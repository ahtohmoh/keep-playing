import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

/**
 * Frame — the AhTohMoh website's hairline-bordered translucent panel.
 *
 * Used as the primary content container on every surface. Sits over the paper
 * (or sketch background) and gives the impression of a printed page held up
 * against light.
 */
export function Frame({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn('frame', className)} {...rest}>
      {children}
    </section>
  );
}

export function FrameHead({
  title,
  dots,
  action,
  className,
}: {
  title?: ReactNode;
  dots?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('frame-head', className)}>
      <div className="flex items-baseline gap-4 min-w-0">
        {title && <h2 className="frame-title truncate">{title}</h2>}
        {dots && (
          <span className="text-muted text-xs flex gap-2 shrink-0">{dots}</span>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </header>
  );
}

export function FrameBody({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('frame-body nice-scroll', className)} {...rest}>
      {children}
    </div>
  );
}

export function FrameNav({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <nav className={cn('frame-nav', className)} {...rest}>
      {children}
    </nav>
  );
}

/** Eyebrow — wide-tracked uppercase label. */
export function Eyebrow({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('eyebrow', className)} {...rest}>
      {children}
    </span>
  );
}

/** Caption — Cormorant Garamond italic. Used for pull-quotes. */
export function Caption({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('caption', className)} {...rest}>
      {children}
    </p>
  );
}
