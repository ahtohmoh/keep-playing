# Keep Playing — Platform Brief

**The operating environment for AhTohMoh.**
**A founding document for the platform that holds the work.**
Prepared for review by Krasumashi and the eventual Tech Resident.

## Preface

Keep Playing is the working name of the platform on which AhTohMoh's wider Collective will live, work, communicate, and grow. It is not a project management tool. It is not a chat application. It is the operating environment for a creative research practice.

This brief is the founding document for Keep Playing. It sits alongside the AhTohMoh Founding Document, Company Profile, and Brand Strategy. Its job is the same. To set the premise, name the design principles, and establish what Keep Playing is for. The technical decisions descend from this document, not the other way around.

This is a living document. It is rewritten as Keep Playing matures.

### A note on the name

Keep Playing is also the name of WYETEY LTD's execution arm, the organisational unit responsible for shipping AhTohMoh's work. Using the same name for the platform is deliberate. The platform is the place where Keep Playing happens. The two names point at the same thing from different angles.

---

## 1. Premise

Most platforms for creative teams are built for teams that don't have a culture. They optimise for generic project management, generic chat, generic file storage. Their interface is a neutral canvas onto which any team can be poured. The result is that every team using such a platform feels and behaves the same way, regardless of who they are.

Keep Playing is built for one specific practice. AhTohMoh. It encodes that practice's discipline, vocabulary, and aesthetic into every surface. A new Collective member who logs in is not entering a tool. They are entering AhTohMoh.

> "Keep Playing is what AhTohMoh feels like, as software."

Three things make Keep Playing necessary, not just nice.

1. The Collective will be distributed. Residents, Fellows, and Correspondents will sit across cities. Asynchronous collaboration is the default. The platform is the persistent place where the team meets, even when no one is online.
2. The discipline of AhTohMoh (one external commission per year, work lived not administered, process visible in the artifact) must be embedded into the operating environment. A platform that contradicts the discipline on a daily basis will erode it. A platform that reinforces the discipline will strengthen it.
3. The first Resident is also the first user. Onboarding to AhTohMoh is onboarding to Keep Playing. The platform is the cultural transmission mechanism. The Onboarding Wizard is not a tutorial. It is the practice's way of saying who it is to the people who will become it.

## 2. Who Uses It

Keep Playing has five user types. Each has different access, different surfaces, different needs.

| User type | What they do here | What they see |
|---|---|---|
| **Founder** (Krasumashi) | Sets direction. Issues briefs. Reviews work. Holds the standard. Approves milestones. Communicates with all members. | Everything. Full visibility across every project, every member, every conversation. |
| **Resident** | Leads projects. Manages own deliverables. Collaborates across the Collective. Sees the wider practice. | All projects they're on. Wider practice activity. Knowledge base. Other Residents' work where shared. |
| **Fellow** | Delivers a specific project to standard. Submits work. Communicates with the project lead. | Their own projects only. Knowledge base for context. No visibility into unrelated practice activity. |
| **Correspondent** | Maintains a Pipeline. Flags opportunities. Stays in conversation with the Founder. | Their own Pipeline. Knowledge base for context. Founder-direct messaging surface. |
| **External Collaborator** (Commissioner, Partner, Sponsor) | Engages with one specific project. Sees their commission progress. Provides feedback. | Their own engagement only. No visibility into the wider practice. Read-mostly access. |

Permissions cascade with tier. A Resident sees more than a Fellow. A Fellow sees more than an External Collaborator. The principle is that visibility follows commitment. People see the practice in proportion to the depth of their relationship with it.

## 3. Design Principles

Six principles govern every design and engineering decision in Keep Playing.

### Principle 1. Practice First, Platform Second

Keep Playing is shaped by the practice, not the other way around. When a platform decision conflicts with the practice's discipline, the practice wins. Every time. The platform should make the right way of working easier, and the wrong way of working visible.

### Principle 2. Quiet, Not Loud

Keep Playing is calm software. No streak counters with anxiety mechanics. No engagement-maximising notifications. No autoplay celebrations. The aesthetic is the same as the AhTohMoh brand. Plain. Confident. Considered. Sentences over icons.

### Principle 3. Texture Over Status

Surface the texture of the work, not just the status. A project should feel like a thing in motion, with its history visible. Comments. Voice notes. Drafts. Decisions taken and decisions reversed. The process is visible in the artifact, even here.

### Principle 4. Permissions Follow Commitment

People see the practice in proportion to the depth of their relationship with it. Residents see most, Fellows see their projects, Correspondents see their Pipeline, Commissioners see their engagement. This is not gatekeeping. It is the structural shape of the Collective.

### Principle 5. Async By Default, Live When Earned

Most work happens asynchronously. Voice notes, written comments, drafts left for review overnight. Real-time features (screen-share, walkie-talkie) are reserved for moments where they are genuinely the right tool. The platform should not push the Collective toward constant availability.

### Principle 6. Owned, Not Rented

Keep Playing is built for AhTohMoh, not bought off the shelf. The platform is an AhTohMoh artifact. It evolves with the practice. It cannot be killed by a vendor's product decision. Future versions can be opened to other practices, productised, or kept private. The choice remains with AhTohMoh.

## 4. The Core Features

The features below are organised by what they do, not by what they're called. Naming and exact UI come later, in the design phase.

- **Member Directory and Tier System.** Every user belongs to a tier. Tier defines permissions and surface access.
- **Projects.** The central organising unit. Brief, milestones, deliverables, contributors, status, files, thread.
- **Briefs.** Founding document for any project. Easy to write, share, revise. Templates per type.
- **Milestones and Deadlines.** Named owners, due dates, visible tracking. No public alarms, but the Founder sees them at a glance.
- **Deliverables and File Storage.** Files live alongside the project. Versioned, dated, credited.
- **Voice Notes and Transcription.** Any member can leave a voice note on any project. Transcribed on demand. Captures thinking at the speed of speech.
- **Template Generator.** Library of templates. Briefs, proposals, concept notes, sponsorship pitches, status reports, onboarding packs.
- **WhatsApp Notifications.** Critical events trigger messages on the platform members already use. Quiet by default.
- **Knowledge Base.** Founding Document, Company Profile, Brand Strategy, Agreements, Business Plan. Canonical, read-only for most.
- **Calendar and Practice View.** Unified view of every active project, every milestone.
- **External Collaborator Surface.** Stripped-down view of their own engagement only.
- **Walkie-Talkie and Live Screen-Share.** Stage 2/3 features, integrated via Daily.co or LiveKit.

## 5. The Onboarding Wizard

Every new member of the AhTohMoh Collective enters Keep Playing through the Onboarding Wizard. The Wizard is the most culturally important feature of the platform. It is not a tutorial. It is the practice's way of saying who it is to the people who will become it.

Six stages, in order, each five to twenty minutes:

1. **Welcome.** A short message in the voice of AhTohMoh introducing the practice.
2. **Your Tier.** Explains the member's tier, what it means, what is expected, what they receive.
3. **The Practice.** A guided read through the Founding Document, the Profile, and the Brand Strategy. Not in summary. In full.
4. **The People.** An introduction to the existing Collective.
5. **Your First Project.** The new member is shown the project they are joining. They meet the project before they meet the platform.
6. **Tools and Discipline.** Only at the end does the Wizard cover the practical mechanics.

The order matters. AhTohMoh is the practice. Keep Playing is how it lives in software. The Wizard introduces them in that order, not the reverse.

## 6. Gamification, Done Right

Gamification fits AhTohMoh because "Legacy through play" is the brand essence. But most gamification is condescending. The right gamification for Keep Playing reinforces the discipline rather than diluting it.

- **Personal Legacy Plots.** Each member has a Legacy Plot of their own. A visible record of the projects they have shipped.
- **The Constellation.** The AhTohMoh · 00X numbering becomes a visible constellation. Every artifact shipped lives in it.
- **Seasons.** Time is organised by season, not by quarter. Roughly three months. Each has a theme and a closing review.
- **Contribution Texture.** Every artifact carries the texture of the hands that touched it. Texture is the substitute for status.

What is forbidden:

- No leaderboards between Collective members.
- No streaks with anxiety mechanics.
- No XP, levels, or unlockable surfaces.
- No celebration animations or noise.
- No public shaming of missed milestones.

## 7. The AI Layer (Claude Integration)

Keep Playing integrates Claude as a built-in research and drafting partner. Every Collective member has access to a Claude instance scoped to the project they are in and the foundational documents of AhTohMoh.

Drafts briefs. Summarises voice notes. Reviews work. Acts as a thinking partner. Fills templates intelligently.

The principle: the AI Layer accelerates the work without replacing the thinking. Members are expected to use it to go deeper and faster, not to skip the work.

At small Collective scale (10 to 15 members), expected monthly API cost is in the range of USD 50 to 250.

The AI Layer is a Stage 2 feature. It requires the Tech Resident in place to design context management, authentication, cost controls, and safe usage patterns.

## 8. What Keep Playing Does Not Do

Discipline lives in what a platform refuses to be, as much as in what it embraces.

- **Real-time chat as a default.** Slack-style channels are not part of the design.
- **Time-tracking.** AhTohMoh does not bill by the hour.
- **Engagement maximisation.** No DAU mechanics, no retention-optimised pushes.
- **Public social features.** No profile feeds, follower counts, public likes.
- **Generic productivity.** Keep Playing is not trying to be Notion or ClickUp.
- **Mobile-first.** Keep Playing is built first for desktop. A mobile companion may come later.

## 9. Staging

Three stages. Each produces a working platform.

**Stage 1. Foundation (Months 1 to 3 of build).** Authentication. Project structure. Templates (manual). Voice notes. WhatsApp notifications. Knowledge base. Light gamification. Onboarding Wizard (basic). Founder dashboard.

**Stage 2. Maturity (Months 4 to 9, requires Tech Resident).** AI Layer. Onboarding Wizard (full). External Collaborator surface. Live screen-share. Calendar integrations. AI-assisted templates. Pipeline view.

**Stage 3. Mastery (Months 10 to 18).** Walkie-talkie. Advanced Legacy Plot. Mobile companion. Potential open-sourcing or productisation. Inter-platform connections.

## 10. Technical Architecture (Conceptual)

Specific technology choices belong to the Tech Resident. This section sketches the shape, not the stack. See [`build-spec.md`](build-spec.md) for the locked stack.

Frontend: a web application, desktop-first. Backend: an API server with auth, project data, files, transcription, WhatsApp, AI. Database: relational + object storage + search index. Real-time services: managed WebRTC. AI: Anthropic Claude API direct. Hosting: a major cloud provider, infrastructure-as-code from day one.

**Estimated build cost and timeline.** Stage 1 with one experienced full-stack engineer: three to four months. If contracted out, USD 25,000 to USD 60,000.

**Operating cost at Stage 1 scale.** USD 80 to USD 250 per month.

## 11. Open Decisions (resolved in v1 of build-spec)

The brief originally flagged six open decisions. They are resolved in the v1.0 build specification:

1. The name **Keep Playing** is locked for both platform and execution arm.
2. **Open-source from day one** (AGPL-3.0).
3. **Mobile-responsive web with PWA install** in Stage 1; native companion in Stage 3.
4. **Cloudflare R2** for storage, paid from day one (cost <$5/month at Stage 1 scale).
5. **Tech Resident vs. contracted build** — deferred decision; the spec is buildable either way.
6. **Visualisation Fellow as first test user** — deferred; the platform is built to be onboard-ready.

---

*This Platform Brief is a living document. It is rewritten as the platform matures, as the Collective grows, and as new uses emerge. The AhTohMoh Founding Document remains the source. Any conflict between this brief and the Founding Document is resolved in favour of the Founding Document.*
