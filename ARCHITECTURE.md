# Architecture

High-level technical shape of Keep Playing. For the full specification, see [`docs/build-spec.md`](docs/build-spec.md).

## Shape, not stack

The platform is a Next.js application with a typed API layer, a Postgres database via Drizzle, object storage on R2, and a small set of background workers for transcription, notifications, and (in Stage 2) AI calls. Real-time features are integrated via a managed WebRTC service, not built from scratch.

Specific technology choices are documented in [`docs/build-spec.md`](docs/build-spec.md) §2.

## System diagram

```
            ┌──────────────────────────────────────────────┐
            │              Browser / PWA                   │
            └────────────────────┬─────────────────────────┘
                                 │  HTTPS
            ┌────────────────────▼─────────────────────────┐
            │           Next.js (apps/web)                 │
            │   App Router · RSC · API routes              │
            └──┬───────────────┬──────────────┬────────────┘
               │               │              │
       ┌───────▼─────┐   ┌─────▼──────┐  ┌────▼─────────┐
       │ PostgreSQL  │   │   R2       │  │  Inngest     │
       │ (Neon)      │   │ (storage)  │  │  (workers)   │
       └─────────────┘   └────────────┘  └────┬─────────┘
                                              │
                            ┌─────────────────┼─────────────────┐
                            │                 │                 │
                       ┌────▼──────┐    ┌─────▼──────┐    ┌─────▼──────┐
                       │  Whisper  │    │  WhatsApp  │    │  Claude    │
                       │  (STT)    │    │  Cloud API │    │  (Stage 2) │
                       └───────────┘    └────────────┘    └────────────┘
```

## Packages

| Package | Role |
|---|---|
| `apps/web` | The Next.js application. Pages, API routes, server actions. |
| `packages/db` | Drizzle schema, migrations, seed scripts. The shape of the world. |
| `packages/auth` | Lucia adapter, session helpers, permission matrix. |
| `packages/ui` | Tokens, primitives, shadcn-based components. |
| `packages/shared` | Cross-cutting types, Zod schemas, constants. |
| `packages/ai` | Claude integration, context builders, cost controls. (Stage 2) |
| `packages/transcription` | Whisper client, job queue producers. |
| `packages/notifications` | WhatsApp + email senders, template registry. |
| `packages/storage` | R2 client wrapper, presigned URL helpers. |
| `packages/templates` | Handlebars-based template engine. |

## Data flow patterns

**Reads.** UI components call typed query functions from `packages/db`, executed in React Server Components or server actions. No data fetching from the client in Stage 1 unless required (e.g. polling transcription status).

**Writes.** All mutations go through `apps/web/app/api/*` route handlers or server actions. Permission is checked via `packages/auth/can()` before any state change. Every state-changing action writes an audit log row.

**Long-running work.** Voice transcription, WhatsApp sends, AI calls, and any task slower than ~200ms after the response are dispatched to Inngest. The route handler returns immediately with a status the client can poll or subscribe to.

## Permission model

Tier-based, with project-membership overrides. See `packages/auth/permissions.ts` and the full matrix in [`docs/build-spec.md`](docs/build-spec.md) §5. The permission matrix is exhaustively tested — every action × every tier × every context.

## Voice and conventions

Code and documentation follow the same voice as the practice. Short, declarative sentences. Periods over em-dashes by default. Specific over abstract. Comments explain the why. Names match the brief — "Resident" not "user_role_2", "Constellation" not "achievements".

## Where to learn the rest

- The Keep Playing Platform Brief — [`docs/platform-brief.md`](docs/platform-brief.md)
- The full Build Specification — [`docs/build-spec.md`](docs/build-spec.md)
- Contributing — [`CONTRIBUTING.md`](CONTRIBUTING.md)
