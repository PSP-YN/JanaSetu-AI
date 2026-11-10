FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CLAMAV_DATABASE_DIR=/var/lib/clamav

RUN apt-get update && apt-get install -y --no-install-recommends clamav clamav-daemon clamav-freshclam ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && sed -i 's/^Example/#Example/' /etc/clamav/clamd.conf \
    && sed -i '/^LocalSocket /d; /^LogFile /d; /^PidFile /d' /etc/clamav/clamd.conf \
    && printf '\nTCPSocket 3310\nTCPAddr 127.0.0.1\nForeground yes\nLogFile /tmp/clamd.log\n' >> /etc/clamav/clamd.conf \
    && sed -i 's/^Example/#Example/; s#^UpdateLogFile .*#UpdateLogFile /tmp/freshclam.log#' /etc/clamav/freshclam.conf

WORKDIR /opt/janasetu-scanner
COPY worker.py /opt/janasetu-scanner/worker.py
COPY entrypoint.sh /opt/janasetu-scanner/entrypoint.sh
RUN chmod 0755 /opt/janasetu-scanner/entrypoint.sh /opt/janasetu-scanner/worker.py

# ClamAV listens on loopback only; no host/container port is published.
ENTRYPOINT ["/opt/janasetu-scanner/entrypoint.sh"]
