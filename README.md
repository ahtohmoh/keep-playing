# Keep Playing

The operating environment for AhTohMoh.

Keep Playing is the platform on which AhTohMoh's Collective lives, works, communicates, and grows. It is not a project management tool. It is not a chat application. It is a creative research practice's operating environment, built for one specific practice and open-sourced for any practice that finds it useful.

> Keep Playing is what AhTohMoh feels like, as software.

## Status

Stage 1 build. Foundation week.

See [`docs/build-spec.md`](docs/build-spec.md) for the full specification. See [`docs/platform-brief.md`](docs/platform-brief.md) for the founding document this build descends from.

## What it does

Stage 1, for the early Collective:

- **Projects** with briefs, milestones, deliverables, files, and contributors.
- **Voice notes** with on-demand transcription.
- **WhatsApp notifications** for the moments that matter.
- **Templates** for briefs, proposals, and operational documents.
- **Knowledge base** holding the AhTohMoh foundational stack.
- **Onboarding Wizard** introducing the practice before the platform.
- **Light gamification** — Legacy Plots, the Constellation, Seasons. Quiet, considered.
- **Founder dashboard** with cross-practice visibility.

Stage 2 adds the Claude AI Layer, an External Collaborator surface, and screen-share. Stage 3 adds walkie-talkie, mobile, and either open-sourcing or productisation.

See [`docs/build-spec.md`](docs/build-spec.md) §9 for the full staging.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind + shadcn/ui · Drizzle ORM · PostgreSQL (Neon) · Lucia Auth · Cloudflare R2 · Inngest · OpenAI Whisper · WhatsApp Cloud API · Anthropic Claude (Stage 2).

See [`docs/build-spec.md`](docs/build-spec.md) §2 for full rationale.

## Run it

```bash
# Install
pnpm install

# Configure
cp .env.example .env.local
# Fill in DATABASE_URL at minimum.

# Migrate
pnpm db:migrate
pnpm db:seed

# Run
pnpm dev
```

The app boots at `http://localhost:3000`.

## Repository

```
keep-playing/
├── apps/web/                 # The Next.js application
├── packages/
│   ├── db/                   # Drizzle schema + migrations
│   ├── auth/                 # Lucia + permission matrix
│   ├── ui/                   # Design tokens + shared components
│   ├── shared/               # Types and Zod schemas
│   ├── ai/                   # Claude integration (Stage 2)
│   ├── transcription/        # Voice note pipeline
│   ├── notifications/        # WhatsApp + email
│   ├── storage/              # R2 client wrapper
│   └── templates/            # Template engine
└── docs/                     # The canonical documents
```

## License

AGPL-3.0-only. See [`LICENSE`](LICENSE).

Permits commercial use. Requires derivative works to share back under the same terms. Protects against proprietary forks, including SaaS forks.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Issues are welcome. PRs are welcome with prior discussion in an issue. AhTohMoh stewards direction. Contributions enhance the practice; they don't redirect it.

## The practice

Keep Playing descends from the AhTohMoh Founding Document and the Keep Playing Platform Brief. Both supersede this code where they conflict. The practice is the proof.

Legacy through play.
