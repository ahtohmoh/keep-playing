import { createElement, type HTMLAttributes } from 'react';
import { cn } from '../cn';

type Level = 1 | 2 | 3 | 4;
type Variant = 'display' | 'ink' | 'plain';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: Level;
  variant?: Variant;
}

/**
 * Heading.
 *
 * variant:
 *   - "display"  Bricolage Grotesque, large.
 *   - "ink"      Ink Free handwritten — used like the .frame-title.
 *   - "plain"    Bricolage Grotesque, modest.
 */
const sizes: Record<Level, string> = {
  1: 'text-5xl',
  2: 'text-4xl',
  3: 'text-2xl',
  4: 'text-lg',
};

const variants: Record<Variant, string> = {
  display: 'font-sans font-light tracking-tight leading-[1.05]',
  ink: 'font-ink font-normal leading-none capitalize',
  plain: 'font-sans font-medium tracking-tight',
};

export function Heading({
  level = 1,
  variant = 'plain',
  className,
  children,
  ...rest
}: HeadingProps) {
  const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  return createElement(
    tag,
    {
      ...rest,
      className: cn(sizes[level], variants[variant], 'text-ink', className),
    },
    children,
  );
}
