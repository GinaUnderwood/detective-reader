from pathlib import Path


def test_compose_uses_docker_awslogs_stream_option() -> None:
    compose = (Path(__file__).parents[1] / "deploy" / "compose.yaml").read_text(
        encoding="utf-8"
    )

    assert "awslogs-stream-prefix" not in compose
    assert compose.count("awslogs-stream:") == 2


def test_production_workflow_serves_the_existing_www_alias() -> None:
    workflow = (
        Path(__file__).parents[1] / ".github" / "workflows" / "deploy-production.yml"
    ).read_text(encoding="utf-8")
    locals_tf = (
        Path(__file__).parents[1] / "infra" / "production" / "locals.tf"
    ).read_text(encoding="utf-8")

    assert (
        "TF_VAR_domain_aliases: "
        '${{ vars.DOMAIN_ALIASES || \'["www.detectivereader.com"]\' }}'
    ) in workflow
    assert "site_address = join(\", \", local.site_addresses)" in locals_tf
