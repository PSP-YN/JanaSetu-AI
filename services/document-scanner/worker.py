#!/usr/bin/env python3
"""Consent-gated private document scanner. No document bytes or PII are logged."""
from __future__ import annotations
import hashlib
import json
import os
import re
import socket
import struct
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
SCANNER_EMAIL = os.environ["SCANNER_EMAIL"]
SCANNER_PASSWORD = os.environ["SCANNER_PASSWORD"]
CLAMD_HOST = os.getenv("CLAMD_HOST", "127.0.0.1")
CLAMD_PORT = int(os.getenv("CLAMD_PORT", "3310"))
POLL_SECONDS = max(2, int(os.getenv("POLL_SECONDS", "10")))
MAX_DOCUMENT_BYTES = 12 * 1024 * 1024
DATABASE_DIR = Path(os.getenv("CLAMAV_DATABASE_DIR", "/var/lib/clamav"))
TOKEN = ""
TOKEN_REFRESH_AT = 0.0


def request_json(url: str, method: str = "GET", payload=None, token: str | None = None, body: bytes | None = None):
    headers = {"apikey": SUPABASE_ANON_KEY, "Accept": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    if payload is not None:
        body = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as response:
        raw = response.read()
        return json.loads(raw) if raw else None


def scanner_token() -> str:
    global TOKEN, TOKEN_REFRESH_AT
    if TOKEN and time.time() < TOKEN_REFRESH_AT:
        return TOKEN
    result = request_json(
        SUPABASE_URL + "/auth/v1/token?grant_type=password",
        "POST",
        {"email": SCANNER_EMAIL, "password": SCANNER_PASSWORD},
    )
    TOKEN = result["access_token"]
    TOKEN_REFRESH_AT = time.time() + max(60, int(result.get("expires_in", 3600)) - 120)
    return TOKEN


def clamav_database_is_fresh() -> bool:
    candidates = list(DATABASE_DIR.glob("daily.cvd")) + list(DATABASE_DIR.glob("daily.cld"))
    if not candidates:
        return False
    newest = max(path.stat().st_mtime for path in candidates)
    return time.time() - newest <= 48 * 60 * 60


def clamd_version() -> str:
    with socket.create_connection((CLAMD_HOST, CLAMD_PORT), timeout=20) as client:
        client.sendall(b"zVERSION\0")
        response = client.recv(512).decode("utf-8", "replace").strip("\0 ")
    if not response.startswith("ClamAV "):
        raise RuntimeError("ClamAV daemon did not return a valid version.")
    return response[:120]


def scan_bytes(content: bytes) -> str:
    with socket.create_connection((CLAMD_HOST, CLAMD_PORT), timeout=30) as client:
        client.sendall(b"zINSTREAM\0")
        for offset in range(0, len(content), 64 * 1024):
            chunk = content[offset:offset + 64 * 1024]
            client.sendall(struct.pack("!I", len(chunk)) + chunk)
        client.sendall(struct.pack("!I", 0))
        client.shutdown(socket.SHUT_WR)
        response = b""
        while True:
            part = client.recv(4096)
            if not part:
                break
            response += part
    result = response.decode("utf-8", "replace").strip("\0 ")
    if result.endswith(" OK"):
        return "clean"
    if result.endswith(" FOUND"):
        return "rejected"
    raise RuntimeError("ClamAV returned an indeterminate scan result.")


def validate_file(mime_type: str, content: bytes, expected_size: int) -> bool:
    if len(content) != expected_size or not 1 <= len(content) <= MAX_DOCUMENT_BYTES:
        return False
    signatures = {
        "application/pdf": content.startswith(b"%PDF-"),
        "image/jpeg": content.startswith(bytes((0xFF, 0xD8, 0xFF))),
        "image/png": content.startswith(bytes((0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A))),
    }
    return signatures.get(mime_type, False)


def download_document(object_name: str, token: str) -> bytes:
    encoded = urllib.parse.quote(object_name, safe="/")
    url = SUPABASE_URL + "/storage/v1/object/authenticated/citizen-documents/" + encoded
    req = urllib.request.Request(url, headers={"apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + token})
    with urllib.request.urlopen(req, timeout=60) as response:
        content = response.read(MAX_DOCUMENT_BYTES + 1)
    if len(content) > MAX_DOCUMENT_BYTES:
        raise RuntimeError("Stored object exceeds the configured document limit.")
    return content


def delete_storage_object(object_name: str, token: str) -> None:
    encoded = urllib.parse.quote(object_name, safe="/")
    url = SUPABASE_URL + "/storage/v1/object/citizen-documents/" + encoded
    req = urllib.request.Request(
        url,
        headers={"apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + token},
        method="DELETE",
    )
    try:
        with urllib.request.urlopen(req, timeout=60):
            return
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return
        raise


def complete_revoked_cleanup(document_id: str, object_name: str, token: str) -> None:
    request_json(
        SUPABASE_URL + "/rest/v1/rpc/complete_revoked_document_cleanup",
        "POST",
        {"p_document_id": document_id, "p_object_name": object_name},
        token,
    )


def attest(document_id: str, result: str, engine: str, digest: str, token: str) -> None:
    request_json(
        SUPABASE_URL + "/rest/v1/rpc/attest_document_scan",
        "POST",
        {"p_document_id": document_id, "p_result": result, "p_engine": engine, "p_signature": digest},
        token,
    )


def process_one(item: dict, token: str, engine: str) -> str:
    document_id = item["id"]
    object_name = item["storage_object_name"]
    if not re.fullmatch(r"[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png)", object_name, re.IGNORECASE):
        raise RuntimeError("Claimed storage path failed validation.")
    if item.get("cleanup_only") is True:
        delete_storage_object(object_name, token)
        complete_revoked_cleanup(document_id, object_name, token)
        return "deleted"
    content = download_document(object_name, token)
    digest = hashlib.sha256(content).hexdigest()
    if not validate_file(item["mime_type"], content, int(item["expected_size"])):
        attest(document_id, "rejected", engine, digest, token)
        return "scanned"
    result = scan_bytes(content)
    attest(document_id, result, engine, digest, token)
    return "scanned"

def main() -> None:
    print("JanaSetu document scanner starting; document contents are never logged.", flush=True)
    while True:
        try:
            if not clamav_database_is_fresh():
                raise RuntimeError("ClamAV daily signature database missing or older than 48 hours; failing closed.")
            token = scanner_token()
            engine = clamd_version()
            item = request_json(
                SUPABASE_URL + "/rest/v1/rpc/claim_next_document_scan",
                "POST",
                {},
                token,
            )
            if item:
                try:
                    outcome = process_one(item, token, engine)
                    message = "Revoked document deleted: " if outcome == "deleted" else "Document scan completed: "
                    print(message + item["id"], flush=True)
                except Exception as error:
                    # Cleanup failures retain their deleting lease and are retried;
                    # they must never be converted into malware-scan attestations.
                    if item.get("cleanup_only") is not True:
                        try:
                            digest = hashlib.sha256(type(error).__name__.encode()).hexdigest()
                            attest(item["id"], "scan_error", engine, digest, token)
                        except Exception:
                            # If Supabase is unavailable or the lease was revoked,
                            # the database safely reclaims the job after its expiry.
                            pass
                    print("Document job deferred: " + item.get("id", "unknown") + " (" + type(error).__name__ + ")", flush=True)
            else:
                time.sleep(POLL_SECONDS)
        except (urllib.error.URLError, TimeoutError, OSError, KeyError, ValueError, RuntimeError) as error:
            print("Scanner health check failed (" + type(error).__name__ + "); retrying without releasing quarantine.", flush=True)
            time.sleep(max(POLL_SECONDS, 15))


if __name__ == "__main__":
    main()
