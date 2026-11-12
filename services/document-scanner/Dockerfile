FROM clamav/clamav:1.4.6_base-debian13-slim@sha256:b3d417fcc0de969b2aef169ac391326f2cdf27cc42991e9100fe477838b466ce
USER root
RUN apt-get update && apt-get install -y --no-install-recommends python3 gosu ca-certificates \
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
