import Link from 'next/link';
import { decodeInviteToken } from '@keep-playing/auth';
import { Heading, Prose, Card, Input, Button } from '@keep-playing/ui';
import { TIER_LABEL, TIER_SHORT_DESCRIPTION } from '@keep-playing/shared';

export default function AcceptInvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) {
    return (
      <FrameMessage
        title="No invitation token"
        body="An invitation link from Krasumashi looks like a long string after the question mark. Check the link or ask for a new one."
      />
    );
  }

  const decoded = decodeInviteToken(token);
  if (!decoded.ok) {
    return <FrameMessage title="Invitation can't be used" body={decoded.reason} />;
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Keep Playing
          </Link>
        </div>
      </header>

      <section className="flex-1 mx-auto w-full max-w-md px-6 py-20">
        <p className="text-muted-strong text-sm">Invitation for</p>
        <Heading level={2} className="mt-1">
          {decoded.payload.fullName}
        </Heading>
        <p className="mt-1 text-muted-strong">{decoded.payload.email}</p>

        <Prose className="mt-6 text-muted-strong">
          <p>
            <span className="text-ink">
              You&apos;re joining as a {TIER_LABEL[decoded.payload.tier]}.
            </span>{' '}
            {TIER_SHORT_DESCRIPTION[decoded.payload.tier]}
          </p>
          <p>
            Choose a password to finish setting up your account. The Onboarding Wizard comes next.
          </p>
        </Prose>

        <Card className="mt-8">
          <form action="/api/auth/accept-invite" method="post" className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <label className="block">
              <span className="text-sm text-muted-strong">Password</span>
              <Input
                type="password"
                name="password"
                required
                minLength={12}
                autoComplete="new-password"
                placeholder="At least 12 characters"
                className="mt-1"
              />
            </label>
            <Button type="submit" className="w-full">
              Set password and continue
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}

function FrameMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Keep Playing
          </Link>
        </div>
      </header>
      <section className="flex-1 mx-auto w-full max-w-md px-6 py-20">
        <Heading level={2}>{title}</Heading>
        <Prose className="mt-3 text-muted-strong">
          <p>{body}</p>
        </Prose>
      </section>
    </main>
  );
}
