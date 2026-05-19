import { Heading, Prose } from '@keep-playing/ui';

export default function MembersPage() {
  return (
    <div>
      <Heading level={2}>The Collective</Heading>
      <Prose className="mt-4 text-foreground-muted">
        <p>The member directory lives here. Week 2 of the build.</p>
      </Prose>
    </div>
  );
}
