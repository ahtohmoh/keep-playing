import { Heading, Prose } from '@keep-playing/ui';

export default function ConstellationPage() {
  return (
    <div>
      <Heading level={2}>The Constellation</Heading>
      <Prose className="mt-4 text-foreground-muted">
        <p>
          Every artifact AhTohMoh has shipped, rendered as named points in a non-grid layout. Quiet
          ceremony when a new one lands. Week 12.
        </p>
      </Prose>
    </div>
  );
}
