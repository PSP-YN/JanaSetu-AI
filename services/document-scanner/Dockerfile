FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends clamav clamav-daemon clamav-freshclam gosu ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10001 --home /nonexistent --shell /usr/sbin/nologin scanner \
 && mkdir -p /run/clamav /var/lib/clamav /opt/janasetu-scanner \
 && chown -R clamav:clamav /run/clamav /var/lib/clamav
WORKDIR /opt/janasetu-scanner
COPY worker.py entrypoint.sh ./
COPY clamd.conf /etc/clamav/clamd.conf
RUN chmod 0755 /opt/janasetu-scanner/entrypoint.sh /opt/janasetu-scanner/worker.py
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
ENTRYPOINT ["/opt/janasetu-scanner/entrypoint.sh"]
