#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: $0 /path/to/document"
  exit 2
fi
if ! command -v clamscan >/dev/null 2>&1; then
  echo "UNAVAILABLE: install ClamAV locally; no clean verdict was produced."
  exit 2
fi
echo "Scanning local file: $(basename "$1")"
echo "Ensure signatures were recently updated with: sudo freshclam"
set +e
clamscan --infected --no-summary -- "$1"
status=$?
set -e
case "$status" in
  0) echo "CLEAN: ClamAV found no detection in this file."; exit 0 ;;
  1) echo "DETECTED: ClamAV reported a malware detection."; exit 1 ;;
  *) echo "ERROR: scan did not complete; file is NOT verified clean."; exit 2 ;;
esac
