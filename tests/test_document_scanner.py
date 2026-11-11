import os
import sys
import unittest
from unittest.mock import patch

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-publishable-key")
os.environ.setdefault("SCANNER_EMAIL", "scanner@example.invalid")
os.environ.setdefault("SCANNER_PASSWORD", "test-only-password")
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "document-scanner")))

import worker


class FakeSocket:
    def __init__(self, response=b"stream: OK\0"):
        self.response = response
        self.sent = bytearray()

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def sendall(self, data):
        self.sent.extend(data)

    def shutdown(self, _how):
        pass

    def recv(self, _size):
        if self.response is None:
            return b""
        response, self.response = self.response, None
        return response


class ScannerTests(unittest.TestCase):
    def test_valid_mime_signatures_and_size(self):
        self.assertTrue(worker.validate_file("application/pdf", b"%PDF-1.7 test", 13))
        self.assertTrue(worker.validate_file("image/jpeg", bytes((255, 216, 255, 0)), 4))
        self.assertTrue(worker.validate_file("image/png", bytes((137, 80, 78, 71, 13, 10, 26, 10)), 8))
        self.assertFalse(worker.validate_file("image/png", b"%PDF-1.7", 8))
        self.assertFalse(worker.validate_file("application/pdf", b"%PDF-1.7", 9))
        self.assertFalse(worker.validate_file("application/pdf", b"", 0))

    def test_clamd_instream_framing_and_clean_result(self):
        fake = FakeSocket()
        with patch.object(worker.socket, "create_connection", return_value=fake):
            self.assertEqual(worker.scan_bytes(b"abcdef"), "clean")
        self.assertTrue(fake.sent.startswith(b"zINSTREAM\0"))
        self.assertIn(b"\x00\x00\x00\x06abcdef", fake.sent)
        self.assertTrue(fake.sent.endswith(b"\x00\x00\x00\x00"))

    def test_clamd_infected_result_is_rejected(self):
        fake = FakeSocket(b"stream: Eicar-Test-Signature FOUND\0")
        with patch.object(worker.socket, "create_connection", return_value=fake):
            self.assertEqual(worker.scan_bytes(b"test"), "rejected")

    def test_indeterminate_clamd_result_fails_closed(self):
        fake = FakeSocket(b"stream: ERROR\0")
        with patch.object(worker.socket, "create_connection", return_value=fake):
            with self.assertRaises(RuntimeError):
                worker.scan_bytes(b"test")


    def test_process_one_uses_atomic_claim_metadata_and_attests_clean_only_after_scan(self):
        item = {
            "id": "11111111-1111-4111-8111-111111111111",
            "storage_object_name": "22222222-2222-4222-8222-222222222222/33333333-3333-4333-8333-333333333333/44444444-4444-4444-8444-444444444444/55555555-5555-4555-8555-555555555555.pdf",
            "mime_type": "application/pdf",
            "expected_size": 13,
        }
        with (
            patch.object(worker, "download_document", return_value=b"%PDF-1.7 test"),
            patch.object(worker, "scan_bytes", return_value="clean") as scan,
            patch.object(worker, "attest") as attest,
        ):
            worker.process_one(item, "scanner-jwt", "ClamAV test")
        scan.assert_called_once()
        attest.assert_called_once()
        self.assertEqual(attest.call_args.args[0], item["id"])
        self.assertEqual(attest.call_args.args[1], "clean")
        self.assertEqual(len(attest.call_args.args[3]), 64)

    def test_process_one_rejects_untrusted_storage_paths_before_download(self):
        item = {
            "id": "11111111-1111-4111-8111-111111111111",
            "storage_object_name": "../../private/secret.pdf",
            "mime_type": "application/pdf",
            "expected_size": 13,
        }
        with patch.object(worker, "download_document") as download:
            with self.assertRaises(RuntimeError):
                worker.process_one(item, "scanner-jwt", "ClamAV test")
        download.assert_not_called()


if __name__ == "__main__":
    unittest.main()
