from pathlib import Path


def test_compose_uses_docker_awslogs_stream_option() -> None:
    compose = (Path(__file__).parents[1] / "deploy" / "compose.yaml").read_text(
        encoding="utf-8"
    )

    assert "awslogs-stream-prefix" not in compose
    assert compose.count("awslogs-stream:") == 2
