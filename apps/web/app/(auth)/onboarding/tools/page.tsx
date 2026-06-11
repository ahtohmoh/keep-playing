import { Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { WizardFrame } from '../wizard-frame';

export default async function ToolsStage() {
  await requireUser();
  return (
    <WizardFrame
      step={6}
      title="Tools and discipline."
      next="/api/auth/onboarding-complete"
      nextLabel="Enter Keep Playing"
      prev="/onboarding/project"
    >
      <Prose className="text-muted-strong">
        <p className="text-ink">
          Only now, at the end, do we cover the practical mechanics. The order matters.
        </p>
      </Prose>

      <Section title="How briefs are written here">
        Every project has a brief. Briefs are how the work gets named before it starts. Open a
        project, choose <em>Brief</em>, write what you want to make and why. Templates exist if you
        prefer scaffolding.
      </Section>

      <Section title="How voice notes work">
        Open <em>Voice</em>. Press record. Press stop. The note uploads and transcribes. Voice
        notes can be attached to a project, a milestone, or a comment. They capture thinking at the
        speed of speech, especially when typing slows you down.
      </Section>

      <Section title="How comments work">
        Every project has an <em>Activity</em> tab. Leave a note. Reply to one. The whole project
        thread lives in one place. No channels, no chat windows.
      </Section>

      <Section title="How notifications work">
        Critical events appear in <em>Notifications</em>. If you set a WhatsApp number in your
        profile, you get a message for the important ones — assignments, milestones due, voice
        notes from the Founder. Everything else stays quiet until you open the app.
      </Section>

      <Section title="The discipline">
        One external commission per year. Work lived, not administered. Process visible in the
        artifact. The platform exists to reinforce these, not to negotiate with them.
      </Section>

      <Prose className="mt-12 text-muted-strong">
        <p>That is enough for today. The rest you will learn by doing.</p>
      </Prose>
    </WizardFrame>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-2">
        {title}
      </h2>
      <Prose className="text-muted-strong">
        <p>{children}</p>
      </Prose>
    </section>
  );
}
