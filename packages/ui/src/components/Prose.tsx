import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

/**
 * Editorial reading column.
 * Used in the Wizard, knowledge base, briefs, anywhere AhTohMoh's voice carries.
 */
export function Prose({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'max-w-[75ch] text-muted-strong leading-[1.7]',
        '[&>p]:my-4 [&>p:first-child]:mt-0',
        '[&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-medium [&>h2]:text-ink',
        '[&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-ink',
        '[&>ul]:my-4 [&>ul]:list-none [&>ul]:pl-0 [&>ul>li]:pl-4 [&>ul>li]:border-l [&>ul>li]:border-hairline [&>ul>li]:my-3',
        '[&>ol]:my-4 [&>ol]:list-decimal [&>ol]:pl-6',
        '[&>blockquote]:my-6 [&>blockquote]:font-serif [&>blockquote]:italic [&>blockquote]:text-muted-strong [&>blockquote]:border-l [&>blockquote]:border-hairline-strong [&>blockquote]:pl-4',
        '[&>strong]:text-ink [&>strong]:font-medium',
        '[&_em]:font-serif [&_em]:italic',
        '[&_a]:text-ink [&_a]:border-b [&_a]:border-hairline-strong [&_a]:no-underline hover:[&_a]:border-ink',
        className,
      )}
      {...rest}
    />
  );
}
