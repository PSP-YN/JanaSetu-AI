FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends clamav clamav-freshclam gosu ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10001 --create-home scanner \
 && mkdir -p /var/lib/clamav /tmp/janasetu-scanner \
 && chown -R scanner:scanner /tmp/janasetu-scanner
WORKDIR /opt/janasetu-scanner
COPY --chown=scanner:scanner package.json worker.mjs ./
ENV NODE_ENV=production
CMD ["sh","-c","for attempt in 1 2 3 4 5 6; do freshclam --quiet && break; sleep 20; done; test -s /var/lib/clamav/daily.cvd -o -s /var/lib/clamav/daily.cld; exec gosu scanner node worker.mjs"]
