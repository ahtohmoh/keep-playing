import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

/**
 * Editorial reading column. Used for the Onboarding Wizard, the Knowledge Base,
 * brief bodies, and anywhere AhTohMoh wants to be read.
 *
 * Constrained measure (about 65–75ch). Generous leading. The serif appears only
 * when the parent component opts in via the `display-serif` class.
 */
export function Prose({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'max-w-prose text-foreground leading-relaxed',
        '[&>p]:my-4 [&>p:first-child]:mt-0',
        '[&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold',
        '[&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold',
        '[&>ul]:my-4 [&>ul]:list-disc [&>ul]:pl-6',
        '[&>ol]:my-4 [&>ol]:list-decimal [&>ol]:pl-6',
        '[&>blockquote]:my-6 [&>blockquote]:border-l-2 [&>blockquote]:border-accent [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-foreground-muted',
        '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:opacity-80',
        className,
      )}
      {...rest}
    />
  );
}
