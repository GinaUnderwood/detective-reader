from pathlib import Path


def test_compose_uses_docker_awslogs_stream_option() -> None:
    compose = (Path(__file__).parents[1] / "deploy" / "compose.yaml").read_text(
        encoding="utf-8"
    )

    assert "awslogs-stream-prefix" not in compose
    assert compose.count("awslogs-stream:") == 2


def test_production_workflow_serves_the_existing_www_alias() -> None:
    workflow_dir = Path(__file__).parents[1] / ".github" / "workflows"
    workflows = [
        (workflow_dir / workflow_name).read_text(encoding="utf-8")
        for workflow_name in ("deploy-production.yml", "terraform.yml")
    ]
    locals_tf = (
        Path(__file__).parents[1] / "infra" / "production" / "locals.tf"
    ).read_text(encoding="utf-8")

    domain_alias_setting = (
        "TF_VAR_domain_aliases: "
        '${{ vars.DOMAIN_ALIASES || \'["www.detectivereader.com"]\' }}'
    )
    assert all(domain_alias_setting in workflow for workflow in workflows)
    assert "site_address = join(\", \", local.site_addresses)" in locals_tf

    compute_tf = (
        Path(__file__).parents[1] / "infra" / "production" / "compute.tf"
    ).read_text(encoding="utf-8")
    assert "SITE_ADDRESS=${jsonencode(local.site_address)}" in compute_tf
