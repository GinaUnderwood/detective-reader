FROM python:3.13.14-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    WEB_ROOT=/app/web \
    SPEECH_CACHE_DIR=/app/cache/speech

WORKDIR /app

RUN groupadd --gid 10001 app \
    && useradd --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app

COPY requirements.txt ./
RUN pip install --no-cache-dir --requirement requirements.txt

COPY server ./server
COPY index.html app.js styles.css ./web/
COPY wireframes ./web/wireframes

RUN mkdir -p /app/cache/speech \
    && chown -R app:app /app/cache

USER 10001:10001

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/api/ready', timeout=4).read()"]

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers", "--forwarded-allow-ips=127.0.0.1"]
