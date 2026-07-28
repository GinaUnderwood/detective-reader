from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import re
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from html import escape
from pathlib import Path
from typing import Final
from uuid import uuid4

import httpx
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator


LOGGER = logging.getLogger("detective_reader")
DEFAULT_VOICE: Final = "en-US-AvaNeural"
DEFAULT_FORMAT: Final = "audio-24khz-48kbitrate-mono-mp3"
DEFAULT_PITCH: Final = "-6%"
PUBLIC_WEB_FILES: Final = frozenset({"index.html", "app.js", "styles.css"})
SAFE_SPEECH_TEXT = re.compile(r"^[A-Za-z0-9\s.,!?;:'\"()\-–—’]+$")


@dataclass(frozen=True)
class Settings:
    azure_speech_key: str = ""
    azure_speech_region: str = ""
    azure_speech_voice: str = DEFAULT_VOICE
    azure_speech_format: str = DEFAULT_FORMAT
    azure_speech_pitch: str = DEFAULT_PITCH
    cache_dir: Path = Path(".cache/speech")
    web_root: Path = Path(__file__).resolve().parents[1]
    per_ip_requests_per_minute: int = 300
    global_requests_per_minute: int = 1200
    azure_requests_per_minute: int = 120
    max_cache_files: int = 5000
    trust_proxy_headers: bool = True

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            azure_speech_key=os.getenv("AZURE_SPEECH_KEY", "").strip(),
            azure_speech_region=os.getenv("AZURE_SPEECH_REGION", "").strip(),
            azure_speech_voice=os.getenv(
                "AZURE_SPEECH_VOICE", DEFAULT_VOICE
            ).strip(),
            azure_speech_format=os.getenv(
                "AZURE_SPEECH_FORMAT", DEFAULT_FORMAT
            ).strip(),
            azure_speech_pitch=os.getenv(
                "AZURE_SPEECH_PITCH", DEFAULT_PITCH
            ).strip(),
            cache_dir=Path(os.getenv("SPEECH_CACHE_DIR", ".cache/speech")),
            web_root=Path(
                os.getenv("WEB_ROOT", str(Path(__file__).resolve().parents[1]))
            ),
            per_ip_requests_per_minute=int(
                os.getenv("SPEECH_REQUESTS_PER_IP_PER_MINUTE", "300")
            ),
            global_requests_per_minute=int(
                os.getenv("SPEECH_REQUESTS_GLOBAL_PER_MINUTE", "1200")
            ),
            azure_requests_per_minute=int(
                os.getenv("AZURE_REQUESTS_PER_MINUTE", "120")
            ),
            max_cache_files=int(os.getenv("SPEECH_CACHE_MAX_FILES", "5000")),
            trust_proxy_headers=os.getenv(
                "TRUST_PROXY_HEADERS", "true"
            ).lower()
            in {"1", "true", "yes"},
        )

    @property
    def speech_ready(self) -> bool:
        return bool(self.azure_speech_key and self.azure_speech_region)


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=700)
    rate: float = Field(default=0.78, ge=0.5, le=1.2)

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized or not SAFE_SPEECH_TEXT.fullmatch(normalized):
            raise ValueError("Text contains unsupported characters.")
        return normalized


class SpeechServiceError(RuntimeError):
    pass


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: float = 60.0) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()
        self._last_cleanup = 0.0

    async def allow(self, key: str) -> bool:
        if self.limit <= 0:
            return True

        now = time.monotonic()
        cutoff = now - self.window_seconds
        async with self._lock:
            if now - self._last_cleanup >= self.window_seconds:
                for existing_key, existing_requests in list(
                    self._requests.items()
                ):
                    while (
                        existing_requests
                        and existing_requests[0] <= cutoff
                    ):
                        existing_requests.popleft()
                    if not existing_requests:
                        self._requests.pop(existing_key, None)
                self._last_cleanup = now

            requests = self._requests[key]
            while requests and requests[0] <= cutoff:
                requests.popleft()
            if len(requests) >= self.limit:
                return False
            requests.append(now)
            return True

    async def refund_latest(self, key: str) -> None:
        async with self._lock:
            requests = self._requests.get(key)
            if not requests:
                return
            requests.pop()
            if not requests:
                self._requests.pop(key, None)


def browser_rate_to_ssml(rate: float) -> str:
    percentage = round((max(0.5, min(1.2, rate)) - 1.0) * 100)
    return f"{percentage:+d}%"


def build_ssml(text: str, settings: Settings, rate: float) -> str:
    return (
        '<speak version="1.0" '
        'xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
        f'<voice name="{escape(settings.azure_speech_voice)}">'
        f'<prosody rate="{browser_rate_to_ssml(rate)}" '
        f'pitch="{escape(settings.azure_speech_pitch)}">'
        f"{escape(text)}"
        "</prosody></voice></speak>"
    )


class SpeechService:
    def __init__(
        self,
        settings: Settings,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self.settings = settings
        self._client = client
        self._inflight: dict[str, asyncio.Task[bytes]] = {}
        self._inflight_guard = asyncio.Lock()
        self._azure_limiter = SlidingWindowLimiter(
            settings.azure_requests_per_minute
        )

    def _cache_key(self, text: str, rate: float) -> str:
        source = "\0".join(
            (
                self.settings.azure_speech_voice,
                self.settings.azure_speech_pitch,
                browser_rate_to_ssml(rate),
                self.settings.azure_speech_format,
                text,
            )
        )
        return hashlib.sha256(source.encode("utf-8")).hexdigest()

    async def synthesize(self, text: str, rate: float) -> bytes:
        if not self.settings.speech_ready:
            raise SpeechServiceError("Azure Speech is not configured.")

        cache_key = self._cache_key(text, rate)
        cache_path = self.settings.cache_dir / f"{cache_key}.mp3"
        if cache_path.is_file():
            return await asyncio.to_thread(cache_path.read_bytes)

        async with self._inflight_guard:
            task = self._inflight.get(cache_key)
            if task is None:
                task = asyncio.create_task(
                    self._synthesize_and_cache(cache_path, text, rate)
                )
                self._inflight[cache_key] = task

        try:
            return await asyncio.shield(task)
        finally:
            if task.done():
                async with self._inflight_guard:
                    if self._inflight.get(cache_key) is task:
                        self._inflight.pop(cache_key, None)

    async def _synthesize_and_cache(
        self,
        cache_path: Path,
        text: str,
        rate: float,
    ) -> bytes:
        if cache_path.is_file():
            return await asyncio.to_thread(cache_path.read_bytes)
        if not await self._azure_limiter.allow("azure"):
            raise SpeechServiceError("Speech capacity is temporarily busy.")
        audio = await self._request_azure(text, rate)
        await asyncio.to_thread(self._write_cache_atomically, cache_path, audio)
        return audio

    def _write_cache_atomically(self, cache_path: Path, audio: bytes) -> None:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = cache_path.with_suffix(f".{uuid4().hex}.tmp")
        try:
            temporary_path.write_bytes(audio)
            os.replace(temporary_path, cache_path)
            self._prune_cache(cache_path.parent)
        finally:
            temporary_path.unlink(missing_ok=True)

    def _prune_cache(self, cache_dir: Path) -> None:
        if self.settings.max_cache_files <= 0:
            return
        cache_files = list(cache_dir.glob("*.mp3"))
        excess = len(cache_files) - self.settings.max_cache_files
        if excess <= 0:
            return
        try:
            oldest = sorted(
                cache_files,
                key=lambda path: path.stat().st_mtime,
            )[:excess]
        except OSError:
            return
        for path in oldest:
            path.unlink(missing_ok=True)

    async def _request_azure(self, text: str, rate: float) -> bytes:
        url = (
            f"https://{self.settings.azure_speech_region}."
            "tts.speech.microsoft.com/cognitiveservices/v1"
        )
        headers = {
            "Ocp-Apim-Subscription-Key": self.settings.azure_speech_key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": self.settings.azure_speech_format,
            "User-Agent": "DetectiveReader",
        }
        client = self._client or httpx.AsyncClient(timeout=60.0)
        try:
            response = await client.post(
                url,
                content=build_ssml(text, self.settings, rate).encode("utf-8"),
                headers=headers,
            )
        except httpx.HTTPError as exc:
            LOGGER.warning("Azure Speech request failed: %s", type(exc).__name__)
            raise SpeechServiceError(
                "Azure Speech is temporarily unavailable."
            ) from exc
        finally:
            if self._client is None:
                await client.aclose()

        if response.status_code >= 400:
            LOGGER.warning(
                "Azure Speech returned HTTP %s.", response.status_code
            )
            raise SpeechServiceError(
                "Azure Speech is temporarily unavailable."
            )
        if not response.content:
            raise SpeechServiceError("Azure Speech returned empty audio.")
        return response.content


def _client_ip(request: Request, settings: Settings) -> str:
    if settings.trust_proxy_headers:
        forwarded_for = request.headers.get("x-forwarded-for", "")
        if forwarded_for:
            return forwarded_for.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def create_app(
    settings: Settings | None = None,
    speech_service: SpeechService | None = None,
) -> FastAPI:
    app_settings = settings or Settings.from_environment()
    service = speech_service or SpeechService(app_settings)
    per_ip_limiter = SlidingWindowLimiter(
        app_settings.per_ip_requests_per_minute
    )
    global_limiter = SlidingWindowLimiter(
        app_settings.global_requests_per_minute
    )

    app = FastAPI(
        title="Detective Reader",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "same-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), geolocation=(), microphone=(), payment=()",
        )
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; "
            "base-uri 'self'; "
            "connect-src 'self'; "
            "font-src 'self'; "
            "frame-ancestors 'none'; "
            "img-src 'self' data:; "
            "media-src 'self' blob:; "
            "object-src 'none'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'",
        )
        return response

    @app.get("/api/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/ready")
    async def ready() -> JSONResponse:
        if not app_settings.speech_ready:
            return JSONResponse(
                status_code=503,
                content={"status": "not_ready", "reason": "speech_config"},
            )
        return JSONResponse(
            content={
                "status": "ready",
                "voice": app_settings.azure_speech_voice,
            }
        )

    @app.post("/api/speech")
    async def speech(
        payload: SpeechRequest,
        request: Request,
        detective_reader: str | None = Header(
            default=None, alias="X-Detective-Reader"
        ),
    ) -> Response:
        if detective_reader != "1":
            raise HTTPException(status_code=400, detail="Invalid speech client.")

        client_ip = _client_ip(request, app_settings)
        if not await per_ip_limiter.allow(client_ip):
            raise HTTPException(
                status_code=429,
                detail="Too many speech requests.",
                headers={"Retry-After": "60"},
            )
        if not await global_limiter.allow("global"):
            await per_ip_limiter.refund_latest(client_ip)
            raise HTTPException(
                status_code=503,
                detail="Speech capacity is temporarily busy.",
                headers={"Retry-After": "60"},
            )

        try:
            audio = await service.synthesize(payload.text, payload.rate)
        except SpeechServiceError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

        return Response(
            content=audio,
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "private, max-age=86400",
                "X-Speech-Voice": app_settings.azure_speech_voice,
            },
        )

    if not app_settings.web_root.is_dir():
        raise RuntimeError(f"Web root does not exist: {app_settings.web_root}")
    missing_web_files = [
        name
        for name in PUBLIC_WEB_FILES
        if not (app_settings.web_root / name).is_file()
    ]
    if missing_web_files:
        raise RuntimeError(
            "Web root is missing required files: "
            + ", ".join(sorted(missing_web_files))
        )

    wireframes_dir = app_settings.web_root / "wireframes"
    if wireframes_dir.is_dir():
        app.mount(
            "/wireframes",
            StaticFiles(directory=wireframes_dir, html=True),
            name="wireframes",
        )

    @app.get("/", include_in_schema=False)
    async def web_index() -> FileResponse:
        return FileResponse(app_settings.web_root / "index.html")

    @app.get("/{asset_name}", include_in_schema=False)
    async def web_asset(asset_name: str) -> FileResponse:
        if asset_name not in PUBLIC_WEB_FILES:
            raise HTTPException(status_code=404, detail="Not found.")
        return FileResponse(app_settings.web_root / asset_name)

    return app


app = create_app()
