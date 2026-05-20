# Deploy

Keep Playing is built to deploy on Vercel + Neon + Cloudflare R2. This doc gets a new instance from zero to running.

## Prerequisites

- A GitHub repo (forked or cloned from `github.com/ahtohmoh/keep-playing`).
- A Vercel account, linked to GitHub.
- A Neon project (or any managed Postgres).
- A Cloudflare account (for R2).
- An OpenAI account (for Whisper transcription).
- A Meta Business Account (for WhatsApp Cloud API). 24–48h approval window.

## One-time setup

### 1. Database

In Neon, create a project. Copy two connection strings:

- `DATABASE_URL` — the pooled connection (`-pooler.neon.tech` host).
- `DIRECT_DATABASE_URL` — the direct (non-pooled) URL. Used for migrations.

### 2. Storage

In Cloudflare R2, create a bucket called `keep-playing-prod`. Issue an API token with read/write scope. Copy:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET=keep-playing-prod`

If you want a public read URL for avatars, attach a public domain to the bucket and set `R2_PUBLIC_URL`.

### 3. Auth secret

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Set as `AUTH_SECRET`.

### 4. WhatsApp (optional in Stage 1)

Follow Meta's setup:
- Create a Business Account.
- Add the WhatsApp Cloud API product.
- Verify your business.
- Create a phone number.
- Configure the webhook URL (`https://app.keepplaying.studio/api/webhooks/whatsapp`) with verify token `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
- Submit the message templates from `packages/notifications/src/templates.ts` for approval. 24–48h.

Set:
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

If unset, WhatsApp sends are logged but not transmitted.

### 5. OpenAI (Whisper)

Get an API key and set `OPENAI_API_KEY`. If unset, voice notes still record and upload, but the transcription is a stub.

## Deploy on Vercel

1. Import the GitHub repo.
2. Set the project root to **`apps/web`**.
3. Vercel reads `vercel.json` and runs the monorepo install + build.
4. Add all environment variables from `.env.example`.
5. Deploy.

## First-run on production

Once the deploy is live, run the database commands from your local machine (with `DATABASE_URL` pointing at production):

```bash
# Migrate the schema.
pnpm db:migrate

# Seed the founder + sample projects + knowledge + templates.
pnpm db:seed

# Set the Founder's password.
FOUNDER_PASSWORD=somethingreallystrong pnpm --filter @keep-playing/db bootstrap
```

Open the production URL. Sign in as `krasumashi@ahtohmoh.com`. Walk through the Onboarding Wizard.

## Domain

Point your domain at the Vercel deployment. `app.keepplaying.studio` is the recommended host.

## Backups

Neon automatic daily backups are included in the Pro tier. R2 supports object versioning — enable it in the bucket settings.

## Monitoring

Add Sentry: install `@sentry/nextjs` in `apps/web` and follow their init wizard. Set `SENTRY_DSN`.

## Real-time (Stage 2)

Daily.co or LiveKit. Documented in `docs/build-spec.md` §17 when Stage 2 begins.
