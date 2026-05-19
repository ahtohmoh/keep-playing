import { createElement, type HTMLAttributes } from 'react';
import { cn } from '../cn';

type Level = 1 | 2 | 3 | 4;
type Variant = 'display' | 'plain';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: Level;
  variant?: Variant;
}

const sizes: Record<Level, string> = {
  1: 'text-5xl tracking-tight',
  2: 'text-3xl tracking-tight',
  3: 'text-xl',
  4: 'text-base',
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
      className: cn(
        sizes[level],
        variant === 'display' ? 'font-serif' : 'font-sans font-semibold',
        'text-foreground',
        className,
      ),
    },
    children,
  );
}
