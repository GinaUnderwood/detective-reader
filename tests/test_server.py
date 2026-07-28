from __future__ import annotations

import asyncio
from pathlib import Path

import httpx

from server.main import (
    Settings,
    SpeechService,
    browser_rate_to_ssml,
    build_ssml,
    create_app,
)


class StubSpeechService:
    def __init__(self) -> None:
        self.calls: list[tuple[str, float]] = []

    async def synthesize(self, text: str, rate: float) -> bytes:
        self.calls.append((text, rate))
        return b"fake-mp3"


def settings(tmp_path: Path, **overrides) -> Settings:
    values = {
        "azure_speech_key": "test-key",
        "azure_speech_region": "eastus",
        "cache_dir": tmp_path / "cache",
        "web_root": Path(__file__).resolve().parents[1],
    }
    values.update(overrides)
    return Settings(**values)


def test_uses_reference_ava_voice_and_pitch(tmp_path: Path) -> None:
    config = settings(tmp_path)
    ssml = build_ssml("Read this & that.", config, 0.78)

    assert config.azure_speech_voice == "en-US-AvaNeural"
    assert 'voice name="en-US-AvaNeural"' in ssml
    assert 'rate="-22%"' in ssml
    assert 'pitch="-6%"' in ssml
    assert "Read this &amp; that." in ssml
    assert browser_rate_to_ssml(0.68) == "-32%"


def test_health_and_readiness_do_not_expose_credentials(tmp_path: Path) -> None:
    app = create_app(settings(tmp_path), StubSpeechService())

    async def exercise() -> tuple[httpx.Response, httpx.Response]:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            return await client.get("/api/health"), await client.get(
                "/api/ready"
            )

    health, ready = asyncio.run(exercise())
    assert health.json() == {"status": "ok"}
    assert ready.status_code == 200
    assert ready.json() == {
        "status": "ready",
        "voice": "en-US-AvaNeural",
    }
    assert "test-key" not in ready.text


def test_readiness_fails_without_azure_config(tmp_path: Path) -> None:
    app = create_app(
        settings(
            tmp_path,
            azure_speech_key="",
            azure_speech_region="",
        ),
        StubSpeechService(),
    )

    async def exercise() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            return await client.get("/api/ready")

    response = asyncio.run(exercise())
    assert response.status_code == 503
    assert response.json()["reason"] == "speech_config"


def test_speech_endpoint_requires_app_header_and_validates_text(
    tmp_path: Path,
) -> None:
    service = StubSpeechService()
    app = create_app(settings(tmp_path), service)

    async def exercise() -> tuple[
        httpx.Response, httpx.Response, httpx.Response
    ]:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            missing_header = await client.post(
                "/api/speech", json={"text": "Read this.", "rate": 0.78}
            )
            invalid_text = await client.post(
                "/api/speech",
                headers={"X-Detective-Reader": "1"},
                json={"text": "<speak>bad</speak>", "rate": 0.78},
            )
            valid = await client.post(
                "/api/speech",
                headers={"X-Detective-Reader": "1"},
                json={"text": "Read this.", "rate": 0.78},
            )
            return missing_header, invalid_text, valid

    missing_header, invalid_text, valid = asyncio.run(exercise())
    assert missing_header.status_code == 400
    assert invalid_text.status_code == 422
    assert valid.status_code == 200
    assert valid.content == b"fake-mp3"
    assert valid.headers["x-speech-voice"] == "en-US-AvaNeural"
    assert service.calls == [("Read this.", 0.78)]


def test_speech_audio_is_cached_by_voice_rate_and_text(tmp_path: Path) -> None:
    calls = 0

    async def azure(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        assert request.headers["Ocp-Apim-Subscription-Key"] == "test-key"
        return httpx.Response(200, content=b"azure-mp3")

    async def exercise() -> tuple[bytes, bytes]:
        client = httpx.AsyncClient(transport=httpx.MockTransport(azure))
        service = SpeechService(settings(tmp_path), client=client)
        try:
            first = await service.synthesize("A cached line.", 0.78)
            second = await service.synthesize("A cached line.", 0.78)
            return first, second
        finally:
            await client.aclose()

    first, second = asyncio.run(exercise())

    assert first == b"azure-mp3"
    assert second == b"azure-mp3"
    assert calls == 1


def test_static_routes_do_not_expose_non_public_files(tmp_path: Path) -> None:
    web_root = tmp_path / "web"
    wireframes = web_root / "wireframes"
    wireframes.mkdir(parents=True)
    (web_root / "index.html").write_text("home", encoding="utf-8")
    (web_root / "app.js").write_text("app", encoding="utf-8")
    (web_root / "styles.css").write_text("styles", encoding="utf-8")
    (web_root / ".env").write_text("SECRET=do-not-serve", encoding="utf-8")
    (wireframes / "index.html").write_text("frames", encoding="utf-8")
    app = create_app(
        settings(tmp_path, web_root=web_root),
        StubSpeechService(),
    )

    async def exercise() -> tuple[
        httpx.Response,
        httpx.Response,
        httpx.Response,
        httpx.Response,
    ]:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            return (
                await client.get("/"),
                await client.get("/app.js"),
                await client.get("/wireframes/"),
                await client.get("/.env"),
            )

    home, javascript, frames, secret = asyncio.run(exercise())
    assert home.text == "home"
    assert javascript.text == "app"
    assert frames.text == "frames"
    assert secret.status_code == 404
    assert "do-not-serve" not in secret.text


def test_speech_rate_limits_per_client_and_globally(tmp_path: Path) -> None:
    app = create_app(
        settings(
            tmp_path,
            per_ip_requests_per_minute=1,
            global_requests_per_minute=2,
        ),
        StubSpeechService(),
    )
    headers = {"X-Detective-Reader": "1"}
    payload = {"text": "Read this.", "rate": 0.78}

    async def exercise() -> tuple[int, int, int, int, int]:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            first = await client.post(
                "/api/speech",
                headers={**headers, "X-Forwarded-For": "192.0.2.1"},
                json=payload,
            )
            same_client = await client.post(
                "/api/speech",
                headers={**headers, "X-Forwarded-For": "192.0.2.1"},
                json=payload,
            )
            second_client = await client.post(
                "/api/speech",
                headers={**headers, "X-Forwarded-For": "192.0.2.2"},
                json=payload,
            )
            global_limit = await client.post(
                "/api/speech",
                headers={**headers, "X-Forwarded-For": "192.0.2.3"},
                json=payload,
            )
            refunded_client_slot = await client.post(
                "/api/speech",
                headers={**headers, "X-Forwarded-For": "192.0.2.3"},
                json=payload,
            )
            return (
                first.status_code,
                same_client.status_code,
                second_client.status_code,
                global_limit.status_code,
                refunded_client_slot.status_code,
            )

    assert asyncio.run(exercise()) == (200, 429, 200, 503, 503)
