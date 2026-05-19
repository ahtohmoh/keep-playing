# Security

## Reporting a vulnerability

If you find a security vulnerability in Keep Playing, do not open a public issue.

Email **security@ahtohmoh.com** with:

- A description of the vulnerability.
- Steps to reproduce.
- Affected versions, commits, or deployments if you know them.
- Your assessment of impact.

We acknowledge reports within **3 business days** and provide a fix or status update within **14 business days**. Critical vulnerabilities receive priority.

## Disclosure

Coordinated disclosure. We work with you on a timeline. Public disclosure happens after a fix is shipped, unless a longer embargo is justified.

Credit is given in release notes unless you prefer otherwise.

## Scope

In scope:

- The Keep Playing application (apps/web).
- The packages in this repository.
- Default infrastructure configuration shipped in `docs/build-spec.md` §19.

Out of scope:

- Third-party services (Vercel, Neon, R2, Whisper, WhatsApp, Anthropic) — report to those vendors.
- Self-hosted forks with custom modifications.
- Social engineering of maintainers or Collective members.

## Safe harbour

Good-faith research that follows this policy will not be subject to legal action. Specifically:

- Testing only against your own deployments or accounts you have permission to access.
- Not destroying data or degrading service for others.
- Not exploiting beyond what's needed to prove a finding.
- Reporting promptly.
