import Link from 'next/link';
import { Heading, Prose, Card, Input, Button } from '@keep-playing/ui';

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Keep Playing
          </Link>
        </div>
      </header>

      <section className="flex-1 mx-auto w-full max-w-md px-6 py-24">
        <Heading level={2}>Sign in</Heading>
        <Prose className="mt-3 text-foreground-muted">
          <p>
            Keep Playing is invitation-only. If you&apos;re part of the AhTohMoh Collective, sign
            in with your email.
          </p>
        </Prose>

        <Card className="mt-8">
          <form className="space-y-4" action="/api/auth/login" method="post">
            <label className="block">
              <span className="text-sm text-foreground-muted">Email</span>
              <Input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@ahtohmoh.com"
                className="mt-1"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground-muted">Password</span>
              <Input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="mt-1"
              />
            </label>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-sm text-foreground-subtle">
          No account? Sign-up is currently by invitation only. If Krasumashi has issued you a tier
          agreement, your invite is in your email.
        </p>
      </section>
    </main>
  );
}
