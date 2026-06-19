# FaceRate AI Hackathon Demo

FaceRate AI is a hackathon demo frontend for facial analysis, aesthetic progress tracking, AI style simulations and Maximum Potential previews.

> Hackathon demo only. This repository is not licensed for reuse, redistribution, commercial deployment or copying. FaceRate AI gives cosmetic/aesthetic feedback from photos and is not medical, psychological, dermatological, legal, employment or identity-verification advice.

## License

This repository is shared only for hackathon review and demonstration. It is not open source. See [LICENSE](./LICENSE).

You may not copy, modify, redistribute, sublicense, commercialize, host, deploy or reuse this project without explicit written permission from the author.

## Repository Scope

This public repository contains:

- the React/Vite frontend;
- frontend documentation;
- backend API documentation/contract;
- security and submission notes.

The production backend is private. It runs on the author's server/VM and stores all private API keys, AI prompts, scoring logic, Stripe secrets and image-generation logic outside this public repository.

## Demo Access

For hackathon judging, the hosted demo is configured with a free token allowance per account:

| Setting | Value |
|---|---:|
| Free judge tokens | 200 |
| Face analysis | 20 tokens |
| Style simulation | 10 tokens |
| Maximum Potential Preview | 20 tokens |

Judges do not need to pay. The public frontend calls the private production API over HTTPS.

## Features

- Clerk authentication and protected routes.
- User profile onboarding.
- Photo upload with optional side-profile image.
- Facial analysis results with category scores and feedback.
- Category improvement plan view.
- Dashboard, history, result pages, comparison and tracker.
- AI chat UI.
- Visual simulator UI for preset and custom edits.
- Maximum Potential Preview UI.
- Pricing/token UI for the product concept.

## Future Work

An earlier prototype explored a realtime Battle mode where users could compare analyses, vote on matchups and climb rankings, using Redis for matchmaking/votes and realtime state. It was left out of this public hackathon demo to keep the submission focused and because there was not enough time to polish it safely.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI | Lucide React, Recharts, custom components |
| Auth | Clerk |
| Public API client | Axios |
| Private backend | FastAPI, PostgreSQL, OpenAI, FAL, Stripe |

## Project Structure

```text
facerate-ai-hackathon/
├── README.md
├── LICENSE
├── docs/
│   └── backend-api.md        # API contract for the private backend
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── lib/
    │   └── pages/
    ├── Dockerfile
    └── README.md
```

## Frontend Environment

Create `frontend/.env` locally. Do not commit it.

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=https://your-private-api-domain.com
```

For the hosted hackathon demo, `VITE_API_BASE_URL` points to the private backend controlled by the author. Backend secrets are never exposed to the browser or this repository.

## Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

To test against a local/private backend, set `VITE_API_BASE_URL` in `frontend/.env`.

## Build

```bash
cd frontend
npm run build
```

## Backend API Contract

See [docs/backend-api.md](./docs/backend-api.md).

The public frontend expects the private backend to expose authenticated routes for users, profiles, analyses, chat, simulations, billing status and token spending.

## Security Standards

- No backend secrets are committed.
- No OpenAI, FAL, Stripe or Clerk secret keys are present in this repo.
- User uploads and generated images are not committed.
- The backend implementation, prompts and scoring logic remain private.
- The frontend treats all user input as untrusted and relies on backend validation.
- Payment, token spending and AI calls are handled server-side only.

## Before Pushing

```bash
git status --short
rg -n --hidden --glob '!.git/**' --glob '!frontend/package-lock.json' "(sk_live_|sk_test_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|OPENAI_API_KEY\s*=sk-|FAL_KEY\s*=[A-Za-z0-9_-]{20,}|CLERK_SECRET_KEY\s*=sk_|STRIPE_SECRET_KEY\s*=sk_|Bearer [A-Za-z0-9._-]{20,})" .
```

Only the private deployment environment should contain real secrets.
