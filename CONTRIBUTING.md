# Contributing to Keep Playing

Thanks for showing up.

Keep Playing is open-source under AGPL-3.0. AhTohMoh remains the steward of direction. Contributions are welcome where they enhance the practice. They are gently redirected where they would dilute it.

## Before you write code

Open an issue first. Describe what you're proposing and why. This is faster than a PR for both of us, and it gives the project room to say "we love this, please do" or "we appreciate the offer, but the practice is going elsewhere."

## When you write code

Match the voice. Short, declarative sentences in comments and docs. Periods over em-dashes by default. Specific over abstract. The code is an extension of the practice, not a different surface.

Match the conventions:

- TypeScript strict mode. No `any` without justification.
- Names from the brief. Resident, Fellow, Correspondent, Collective, Constellation, Season — these are the canonical terms.
- Server-first. RSC and server actions before client-side fetching.
- Permission checks on every state-changing route via `packages/auth/can()`.
- Audit log writes on every state change.

Run before opening a PR:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

CI will block merge on any of these failing.

## Commits

Conventional commits, lowercase, present tense.

```
feat: add voice note recording UI
fix: handle empty transcription response from whisper
docs: clarify tier permission cascade
refactor: extract permission matrix to packages/auth
```

## Pull requests

Title in the same voice as commits. Body describes:

1. What changed.
2. Why.
3. How to verify.
4. Any decisions you'd like the maintainers' eyes on.

Squash-merge by default. Linear history.

## What we won't merge

- Features that contradict the design principles in [`docs/platform-brief.md`](docs/platform-brief.md) §3 (Practice First, Quiet Not Loud, Texture Over Status, Permissions Follow Commitment, Async By Default, Owned Not Rented).
- Engagement-maximising mechanics. Streaks, badges with anxiety mechanics, autoplay celebrations, public leaderboards.
- Generic productivity bloat. Keep Playing does fewer things, in AhTohMoh's shape.
- Vendor lock-in. Hosted-only dependencies that displace an open alternative.

## Code of Conduct

See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Contributor Covenant 2.1. Be kind. Be specific. Listen.

## Security

Found a vulnerability? See [`SECURITY.md`](SECURITY.md). Do not open a public issue.

## License

By contributing, you agree your contribution is licensed under AGPL-3.0-only.

Legacy through play.
