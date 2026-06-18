# FaceRate AI Frontend

React/Vite frontend for the FaceRate AI hackathon demo. The backend implementation is private and deployed separately by the author.

## Hackathon License

This frontend is provided only for hackathon review and demonstration. It is not licensed for reuse, redistribution, commercial deployment or hosting without written permission from the author.

## Demo Note

On the temporary HTTP/IP deployment, browser webcam access may be blocked. This is expected browser behavior because `getUserMedia` requires HTTPS or localhost. Use file upload instead.

## Stack

- React 18
- TypeScript
- Vite 5
- Tailwind CSS
- Lucide React
- Clerk React
- React Router
- Axios
- Recharts

## Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | `Home.tsx` | Home screen and Clerk sign-in/sign-up entry |
| `/onboarding` | `Onboarding.tsx` | Create or edit local profile |
| `/start-analysis` | `StartAnalysis.tsx` | Profile-aware redirect into analysis flow |
| `/dashboard` | `Dashboard.tsx` | History, stats and Profile Standing |
| `/upload` | `Upload.tsx` | Upload front photo and optional side photo |
| `/results/:id` | `Results.tsx` | Full result, Maximum Potential and plan CTA |
| `/results/:id/plan` | `AnalysisPlan.tsx` | Category-by-category improvement plan |
| `/tracker` | `GlowUpTracker.tsx` | Progress tracking |
| `/compare` | `Compare.tsx` | Compare two analyses |
| `/simulate` | `Simulate.tsx` | Preset and custom visual simulations |
| `/pricing` | `Pricing.tsx` | Plans, checkout and billing portal |

All routes except `/` are protected by Clerk.

## Main Structure

```text
src/
├── api/
│   ├── analysis.ts       # Upload, result, compare, plan and chat API calls
│   ├── axios.ts          # Axios instance with Clerk bearer token and error handling
│   ├── billing.ts        # Stripe billing/status API calls
│   ├── profile.ts        # User profile calls/cache
│   └── simulation.ts     # Preset/custom/max-potential simulation calls
├── components/
│   ├── ChatBot.tsx
│   ├── CreditsBadge.tsx
│   ├── Navbar.tsx
│   ├── ProfileStandingCard.tsx
│   └── ...
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── billingEvents.ts
│   ├── errorMessages.ts
│   └── tokenCosts.ts
├── pages/
├── App.tsx
├── main.tsx
└── index.css
```

## Environment Variables

Create `frontend/.env`. Do not commit it.

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=
```

`VITE_API_BASE_URL` should point to the private backend API for the hosted demo. In local development, if it is empty, the app falls back to `http://localhost:8000`.

## Run

```bash
cd facerate-ai/frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```
If port `5173` is already busy, Vite may use `5174` or another available port.

Production build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Auth Flow

- `main.tsx` wraps the app with `ClerkProvider`.
- `AuthContext.tsx` bridges Clerk user/session data into the app.
- `axios.ts` attaches the Clerk session token to backend requests.
- `PrivateRoute` in `App.tsx` protects private screens.
- New users go through onboarding before upload.
- The Clerk user menu shows the current plan and links to profile editing.

## Billing And Tokens

Frontend billing files:

- `src/api/billing.ts`
- `src/components/CreditsBadge.tsx`
- `src/lib/billingEvents.ts`
- `src/lib/tokenCosts.ts`
- `src/pages/Pricing.tsx`

Token costs displayed in the UI:

| Action | Cost |
|---|---:|
| Face analysis | 20 |
| Style simulation | 10 |
| Maximum Potential | 20 |

Important behavior:

- `CreditsBadge` fetches `/billing/me`.
- Billing and token updates are synced through local browser events.
- `INSUFFICIENT_TOKENS` errors redirect to `/pricing?reason=tokens`.
- Checkout returns to `/pricing?checkout=success&session_id=...`.
- Pricing confirms checkout through `/billing/confirm-checkout`.
- Manage billing opens the Stripe customer portal.

The frontend displays tokens for convenience only. The backend is the source of truth.

## Chat

`ChatBot.tsx` gives the user 3 visible messages per day, matching the backend rule.

Security notes:

- The frontend only sends `role=user` and `role=assistant`.
- The backend still validates roles and limits history.
- The local counter is only UI feedback; the backend enforces the real daily limit.
- Do not add browser/tool/file access to the chat without backend safety review.

## Simulations

`Simulate.tsx` supports preset styles and a custom prompt.

Custom prompt behavior:

- Frontend limit: 120 characters.
- Backend limit: 8 to 120 characters.
- The prompt should describe a visual edit only.
- Supported areas include hair, hair color, beard, mustache, makeup, glasses, sunglasses, earrings, piercings, jewelry, tattoos, accessories, clothing and background.
- Backend blocks common jailbreak phrases, URLs and secret-extraction attempts.

Maximum Potential:

- Triggered from `Results.tsx`.
- Calls the private backend with regeneration enabled.
- Uses token cost from `src/lib/tokenCosts.ts`.
- In the hosted hackathon demo, free users can use their finite token balance without paying.

## Error Handling

`src/api/axios.ts` normalizes structured API errors from the backend.

User-facing messages live in:

```text
src/lib/errorMessages.ts
```

When backend returns `INSUFFICIENT_TOKENS`, the frontend redirects the user to pricing.

## Security Standards

### Secrets

- Never put private keys in frontend code.
- Only `VITE_` public values belong in frontend `.env`.
- Clerk publishable key is public; Clerk secret key, Stripe secret key, webhook secret, OpenAI key and FAL key must stay backend-only.
- Never commit `frontend/.env`.

### Browser Safety

- Treat all UI text input as untrusted.
- Do not trust frontend validation alone.
- Do not expose internal prompts, API keys or server errors to users.
- Do not make browser code call Stripe/OpenAI/FAL directly with secret keys.
- Keep payment changes going through backend routes.

### Auth

- Private pages require Clerk sign-in.
- Backend requests must include the Clerk bearer token.
- Do not store Clerk session tokens manually in localStorage.
- Do not rely on route guards alone for data protection; backend ownership checks remain required.

### Uploads

- The frontend should show previews for user convenience only.
- The backend must still validate file type and ownership.
- Do not add uploaded/generated images to the repository.

### Release Checklist

- Run `npm run build`.
- Check that `frontend/.env` is ignored.
- Check that no frontend file contains backend secrets.
- Confirm production backend URL is configured correctly before deployment.
- Confirm Clerk allowed origins and redirect URLs match production URLs.
- Confirm Stripe success/cancel URLs use the production frontend URL.
