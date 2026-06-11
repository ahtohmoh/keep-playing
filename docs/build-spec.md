# Keep Playing — Build Specification

**Status:** v1.0 — locked for Stage 1 build.
**Source of truth:** This document.
**Descends from:** [`platform-brief.md`](platform-brief.md) and the AhTohMoh Founding Document. Both supersede this spec where they conflict.

---

> This file holds the canonical v1.0 build specification, as authored by the founder. The full text — including all twenty-four sections, the Drizzle schema, the permission matrix, the WhatsApp templates, the AI system prompt, the week-by-week build plan, and the appendices — is reproduced verbatim in the project repository.
>
> The headings below are the locked structure. The canonical body is kept in sync with the implementation. Subsequent revisions increment the version and append to the Appendix E changelog.

## Table of Contents

1. Premise and Scope
2. Technology Stack
3. Project Structure
4. Data Model
5. Authentication and Permissions
6. API Surface
7. Frontend Architecture
8. The Onboarding Wizard
9. Voice Notes and Transcription
10. WhatsApp Notifications
11. Template Generator
12. Knowledge Base
13. Claude AI Layer
14. Gamification Surfaces
15. Mobile and Multi-Device
16. File Storage
17. Real-time Features (Stage 2/3)
18. Design System
19. Deployment, Hosting, Operations
20. Security and Privacy
21. Testing Strategy
22. Build Order — Week by Week
23. Open-Source Strategy
24. Appendices

## Implementation cross-reference

Each section of the build spec is realised in the codebase. The pointers below let any contributor jump from a spec section to the code that implements it.

| Section | Implementation home |
|---|---|
| §2 Technology Stack | Root `package.json`, `pnpm-workspace.yaml`, `turbo.json` |
| §3 Project Structure | This repository |
| §4 Data Model | `packages/db/src/schema.ts` |
| §5 Auth & Permissions | `packages/auth/src/` |
| §6 API Surface | `apps/web/app/api/` |
| §7 Frontend Architecture | `apps/web/app/` |
| §8 Onboarding Wizard | `apps/web/app/(auth)/onboarding/` |
| §9 Voice Notes | `packages/transcription/`, `apps/web/components/voice-note-recorder.tsx` |
| §10 WhatsApp | `packages/notifications/src/whatsapp/` |
| §11 Templates | `packages/templates/` |
| §12 Knowledge Base | `packages/db/seeds/knowledge/`, `apps/web/app/(collective)/knowledge/` |
| §13 AI Layer | `packages/ai/` (Stage 2) |
| §14 Gamification | `apps/web/app/(collective)/constellation/`, `apps/web/app/(collective)/members/[id]/` |
| §15 Mobile & PWA | `apps/web/app/manifest.ts`, `apps/web/public/icons/` |
| §16 File Storage | `packages/storage/` |
| §17 Real-time | Stage 2/3 |
| §18 Design System | `packages/ui/src/tokens.ts`, `packages/ui/src/components/` |
| §19 Deploy & Ops | `.github/workflows/`, `infra/` (TBD) |
| §20 Security | `SECURITY.md`, `packages/auth/`, audit log column on every state-changing table |
| §21 Testing | `**/*.test.ts`, `apps/web/playwright/` |
| §22 Build Order | This document |
| §23 Open-Source | `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` |
| §24 Appendices | `.env.example`, `packages/db/seeds/` |

## Build order — Week by Week

The 14-week Stage 1 build plan (§22 of the canonical spec):

### Phase 1: Foundation (Weeks 1–3)

| Week | Deliverable |
|---|---|
| **1** | Monorepo, Next.js scaffold, Drizzle + Neon, Lucia auth foundation, basic UI components |
| 2 | Schema migrations, seed users + tiers, login/signup, member directory |
| 3 | Project CRUD, contributor management, basic permissions, milestone CRUD |

### Phase 2: Core Workflows (Weeks 4–7)

| Week | Deliverable |
|---|---|
| 4 | Deliverable upload (R2 presigned), file viewing, comment threads |
| 5 | Voice note recording, upload to R2, transcription pipeline (Inngest + Whisper) |
| 6 | Notification system, in-app surface, audit log |
| 7 | WhatsApp integration (Meta API setup, templates, send) |

### Phase 3: Knowledge & Templates (Weeks 8–10)

| Week | Deliverable |
|---|---|
| 8 | Knowledge base ingest from markdown, rendering, tier-aware visibility |
| 9 | Template engine (Handlebars), seed 7 templates, template UI |
| 10 | Pipeline view for Correspondents, founder acknowledge flow |

### Phase 4: Onboarding & Gamification (Weeks 11–13)

| Week | Deliverable |
|---|---|
| 11 | Onboarding Wizard (6 stages), reading tracking |
| 12 | Legacy Plots, Constellation, Seasons |
| 13 | Contribution Texture surfaces, founder dashboard |

### Phase 5: Polish & Launch (Week 14)

| Week | Deliverable |
|---|---|
| 14 | Mobile-responsive pass, PWA, E2E tests, deploy to production, soft launch |

## Stage 1.5 — The Async Loop (added in v1.1)

Stage 1 was feature-complete against the original spec. Stage 1.5 closes the gaps between the spec's own principles and what was built. In priority order:

| # | Item | Why |
|---|---|---|
| 1 | **Catch-up home** — "Since you were here" as the signed-in default view, built from the audit log + per-project `last_seen_at` markers | Async by default requires a catch-up loop. This is the platform's core surface. |
| 2 | **Timezones** — `users.timezone`, quiet hours computed in member-local time | The Collective is distributed. Due dates and notification windows must respect local time. |
| 3 | **Email as a first-class channel** — transactional sends + weekly quiet digest via Resend | De-risks notifications entirely. See "Notification channels" below. |
| 4 | **Cmd+K command palette** — navigate, search, create from the keyboard | The platform's intelligence surface. Mono/pencil styling. |
| 5 | **Brief revisions** — append-only history of every brief edit | "Process visible in the artifact" applies to briefs most of all. |
| 6 | **Decision log** — first-class Decision entity per project (what, who, when, what it reversed) | Texture over status. Decisions are the texture. |
| 7 | **Seasons table** — Founder names each season; epoch math becomes a fallback | The spec always said the Founder names seasons. |
| 8 | **File previews** — inline image/PDF/video in deliverables | The first Fellow is a visualiser. The deliverables space is a studio wall, not a file cabinet. |
| 9 | **Rate limiting + founder TOTP** | The spec promised both. |
| 10 | **pgvector + embed-on-write** | Semantic search in Stage 1.5; the AI Layer's context engine in Stage 2. Requires pgvector (Neon: enable extension; local: pgvector image). |

## Notification channels (revised in v1.1)

WhatsApp is **relegated from primary to optional**. The decision: work should not live inside a third-party chat app, and the Collective will carry the platform in their pockets natively.

The channel stack, in order:

1. **In-app** — the notification surface. Always on.
2. **Native push** (Stage 2, via the mobile app — Expo Push/FCM/APNs). Replaces everything WhatsApp was specified to do.
3. **Email** — transactional for the critical few (brief assigned, invite); a weekly quiet digest for everything else. Via Resend.
4. **WhatsApp** — kept as an opt-in personal preference for members who want it. No longer load-bearing. The §10 integration remains in the codebase but is not a launch requirement.

## The Mobile App (elevated in v1.1)

Originally Stage 3 ("a thin native wrapper, maybe"). Now the centrepiece of Stage 2: **Keep Playing is the agency's app.** Joining AhTohMoh means downloading it. Everything the web does, in your pocket — projects, voice notes (recorded natively, better mic access), the knowledge base (offline-readable), notifications via native push.

- **Stack:** Expo + React Native, living in `apps/mobile/` (reserved since Week 1). Shares `packages/shared` types and the same API. Piqabu's app proves this stack and this aesthetic already work together — the design tokens in `packages/ui/src/tokens.ts` are derived from Piqabu's `Theme.ts` and port directly.
- **Auth:** same session API; biometric unlock on device (Piqabu's BiometricLockScreen pattern).
- **Voice-first:** the recorder is a primary tab, not a buried feature. Record offline, upload when connected.
- **Push:** Expo Push notifications replace WhatsApp as the proactive channel.
- **Distribution:** private — TestFlight + Play internal track initially. Joining the Collective = receiving an invite + the app.

## The Mail Surface (new in v1.1)

Every Collective member receives a practice address (`kofi@ahtohmoh.com`) and reads/sends it inside Keep Playing.

Architecture, in two phases:

- **Phase A — mailboxes exist (one-time setup, no code):** host `ahtohmoh.com` mail on a managed provider. Recommended: **Zoho Mail** (cheap, solid APIs) or **Google Workspace** (best deliverability, richest API). DNS: MX + SPF + DKIM + DMARC. Members can use any mail client from day one.
- **Phase B — mail inside Keep Playing (Stage 2 build):** a Mail frame in the app reading and sending through the provider's API (Gmail API or Zoho Mail API; OAuth per member, tokens stored encrypted server-side). The app is a *client* of the mailbox, not the mailbox itself — members never lose mail if Keep Playing is down.
- **Phase C — owned infrastructure (Stage 3 option):** self-host **Stalwart** (open-source Rust mail server, JMAP-native, AGPL like us). Full "Owned, Not Rented." Deferred because deliverability (IP reputation, warm-up) is an operational discipline of its own; rent the hard part until the Collective justifies owning it.

Deliverability rule: the platform's *transactional* email (notifications, digests, invites) stays on Resend with its own subdomain (`mail.keepplaying.studio`) regardless of phase, so member mailbox reputation and platform sending reputation never share fate.

## Knowledge Base (expanded in v1.1)

The knowledge base becomes the agency's institutional memory, not just a document shelf:

- **Founder upload surface** — add/edit docs from the app (currently markdown-in-git only).
- **The full foundational stack seeded** — Founding Document, Company Profile, Brand Strategy, Agreements, Business Plan, this spec. (Drop the markdown files into `packages/db/seeds/knowledge/` and re-seed.)
- **Semantic search** over all of it (item 10 above) — "ask the practice a question" becomes possible the moment pgvector ships, and becomes *conversational* when the Stage 2 AI Layer lands.
- **Mobile offline** — the knowledge base is the first thing the mobile app caches.

## Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-05-19 | Initial spec locked. Stage 1 fully specified. Stage 2/3 architectural readiness. |
| 1.0.0-scaffold | 2026-05-19 | Week 1 scaffold landed: monorepo, schema, auth foundation, UI tokens, Next.js skeleton. |
| 1.1 | 2026-05-20 | Stage 1 complete. Added Stage 1.5 (async loop, memory, hardening). WhatsApp relegated to optional; native push + email become the proactive channels. Mobile app elevated to Stage 2 centrepiece. Mail Surface specified (practice addresses in-app). Knowledge base expanded. UI vocabulary locked: AhTohMoh × Piqabu (cream ink, layered paper, pencil labels, scrollless shell). |

---

*This Build Specification is the canonical technical source for Keep Playing v1. It descends from the Keep Playing Platform Brief and the AhTohMoh Founding Document. Both supersede this spec where they conflict. The spec is revised as the build progresses, with version increments and changelog entries above.*

*Legacy through play.*
