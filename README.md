# Detective Reader

A responsive, detective-themed structured-literacy app for nine-year-old
readers. It includes 49 sequenced word-family lessons, the 14-screen lesson
framework, guided pattern practice, avatars, earned coins, badges, and a
fixed-price rewards shop.

Production narration uses the same Azure voice configuration as
ReadingSoundGame:

- Voice: `en-US-AvaNeural`
- Output: `audio-24khz-48kbitrate-mono-mp3`
- Pitch: `-6%`
- Rate: preserves Detective Reader's slower lesson and word pacing

The browser calls a same-origin FastAPI endpoint. The Azure key remains on the
server, generated audio is cached, request text is validated and bounded, and
the app never silently switches to a device-dependent browser voice.

To adjust every Ava line from one place, change
`AVA_SPEECH_SPEED_MULTIPLIER` near the narration constants in `app.js`.
`1.0` preserves the current pace, `0.85` is 15% slower, and `1.15` is 15%
faster. Individual lesson rates remain proportional, and the final Azure rate
is constrained to the API's supported `0.5`–`1.2` range.

## Local development

Create a virtual environment and install the pinned dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

Set the real `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in `.env`, then either
load those variables into your shell and run Uvicorn:

```powershell
.\.venv\Scripts\python.exe -m uvicorn server.main:app --reload --port 8080
```

or use Docker Compose:

```powershell
docker compose up --build
```

Open `http://127.0.0.1:8080`. Opening `index.html` directly still renders the
interface, but narration requires the server.

## Verification

```powershell
.\.venv\Scripts\python.exe -m pytest
python -m compileall -q server tests
node --check app.js
node tests/app-smoke.cjs
```

## AWS production deployment

The repository includes Terraform for a dedicated VPC, EC2, ECR, IAM, Systems
Manager, Secrets Manager, remote state, optional DNS, and monitoring. GitHub
Actions uses AWS OIDC rather than long-lived AWS access keys, publishes an
immutable image digest, deploys through Systems Manager with no SSH port, checks
readiness, and rolls back a failed image.

See [`deploy/README.md`](deploy/README.md) for the one-time bootstrap and
production setup.

Never commit `.env`, Terraform state, plan files, `tfvars`, Azure credentials,
or AWS credentials. Terraform creates the Azure secret container but
intentionally does not place a secret value in Terraform state.

## Mobile lesson wireframes

The Developer Notebook flow is available at
[`wireframes/index.html`](wireframes/index.html). It contains mobile-first
wireframes for Screens 1–14, from the Pattern Detective welcome through the
mastery check and celebration.

## Current data boundary

Learner progress, avatars, coins, and purchases remain in browser
`localStorage`. There are no learner accounts or server-side progress records
in this release.
