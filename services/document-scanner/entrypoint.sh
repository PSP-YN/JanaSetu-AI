#!/bin/sh
set -eu

# Fetch signatures before accepting work. Failure is fatal: no stale-signature scanning.
freshclam --datadir=/var/lib/clamav --stdout

# Keep signatures updated. If the daily database becomes stale, the worker fails closed.
freshclam --daemon --checks=12 --datadir=/var/lib/clamav

clamd --foreground --config-file=/etc/clamav/clamd.conf &
CLAMD_PID=$!
trap 'kill "$CLAMD_PID" 2>/dev/null || true' EXIT INT TERM

attempt=0
until python -c "import socket; s=socket.create_connection(('127.0.0.1',3310),2); s.close()" 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "ClamAV daemon failed to become ready." >&2
    exit 1
  fi
  sleep 2
done

exec python /opt/janasetu-scanner/worker.py
