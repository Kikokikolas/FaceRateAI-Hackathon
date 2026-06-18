# Private Backend API Contract

The backend implementation for FaceRate AI is private. This document describes the API surface expected by the public hackathon frontend.

## Auth

Protected routes expect a Clerk session token:

```http
Authorization: Bearer <clerk_session_token>
```

The private backend verifies Clerk JWTs, links the Clerk user to a local user record and enforces ownership checks for user data.

## Demo Token Policy

The hosted hackathon backend is configured so judges can test without paying:

```env
HACKATHON_DEMO=true
FREE_TOKENS=200
UNLIMITED_TOKENS=false
```

Default token costs:

| Action | Cost |
|---|---:|
| Face analysis | 20 |
| Style simulation | 10 |
| Maximum Potential Preview | 20 |

In hackathon demo mode, free users can spend their finite token balance on Maximum Potential previews without a paid subscription.

## Expected Routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/user/me` | Current local user |
| `GET` | `/user/profile` | Current profile |
| `PUT` | `/user/profile` | Create/update profile |
| `GET` | `/user/analyses` | List analyses |
| `POST` | `/analysis/upload` | Upload front image and optional side image |
| `GET` | `/analysis/{analysis_id}` | Get analysis result |
| `GET` | `/analysis/{analysis_id}/plan` | Generate/open category plan |
| `GET` | `/analysis/compare/{id_a}/{id_b}` | Compare analyses |
| `POST` | `/chat` | AI chat response with daily limit |
| `POST` | `/simulation/generate` | Generate preset style from uploaded file |
| `POST` | `/simulation/generate/from-analysis/{analysis_id}` | Generate preset style from saved analysis |
| `POST` | `/simulation/generate/custom` | Custom visual edit from uploaded file |
| `POST` | `/simulation/generate/custom/from-analysis/{analysis_id}` | Custom edit from saved analysis |
| `POST` | `/simulation/max-potential/{analysis_id}` | Maximum Potential Preview |
| `GET` | `/billing/me` | Current plan and token state |
| `POST` | `/billing/create-checkout-session` | Create Stripe Checkout session |
| `POST` | `/billing/confirm-checkout` | Sync completed Checkout session |
| `POST` | `/billing/create-portal-session` | Create Stripe customer portal session |
| `POST` | `/billing/webhook` | Stripe webhook endpoint |

## Security Rules

- Backend secrets stay on the private server/VM.
- OpenAI/FAL/Stripe/Clerk secret keys are never exposed to the frontend.
- Token spending is enforced server-side.
- Uploaded/generated images are stored outside this public repository.
- User input is treated as untrusted content.
- Chat and custom prompts are validated server-side.
- Prompting, scoring and image-generation logic are private implementation details.

## Production Notes

The private backend should be deployed with HTTPS, strict CORS for the frontend domain, private environment variables, persistent PostgreSQL storage and controlled upload retention.
