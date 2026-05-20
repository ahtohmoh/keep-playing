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

## Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-05-19 | Initial spec locked. Stage 1 fully specified. Stage 2/3 architectural readiness. |
| 1.0.0-scaffold | 2026-05-19 | Week 1 scaffold landed: monorepo, schema, auth foundation, UI tokens, Next.js skeleton. |

---

*This Build Specification is the canonical technical source for Keep Playing v1. It descends from the Keep Playing Platform Brief and the AhTohMoh Founding Document. Both supersede this spec where they conflict. The spec is revised as the build progresses, with version increments and changelog entries above.*

*Legacy through play.*
