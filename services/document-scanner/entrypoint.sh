#!/bin/sh
set -eu
mkdir -p /run/clamav /var/lib/clamav
chown -R clamav:clamav /run/clamav /var/lib/clamav

# Download current signatures before accepting work. Never scan with stale signatures.
freshclam --datadir=/var/lib/clamav --stdout
freshclam --daemon --checks=12 --datadir=/var/lib/clamav

clamd --foreground --config-file=/etc/clamav/clamd.conf &
CLAMD_PID=$!
WORKER_PID=""
cleanup() {
  if [ -n "$WORKER_PID" ]; then kill "$WORKER_PID" 2>/dev/null || true; fi
  kill "$CLAMD_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

attempt=0
until python -c "import socket; s=socket.create_connection(('127.0.0.1',3310),2); s.close()" 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then echo "ClamAV daemon failed to become ready." >&2; exit 1; fi
  sleep 2
done

exec gosu scanner python /opt/janasetu-scanner/worker.py
