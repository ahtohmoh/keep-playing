import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Button — modelled on the AhTohMoh website CTAs.
 * Primary: ink-on-paper (i.e. white-on-black), uppercase, wide-tracked.
 * Secondary: hairline-bordered, ink color.
 * Ghost: text only.
 * Danger: same primary shape; meaning carried by copy, not colour.
 */
const base =
  'inline-flex items-center justify-center font-sans uppercase select-none transition-colors duration-quick ease-standard disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-paper border border-transparent hover:bg-ink',
  secondary:
    'bg-transparent text-ink border border-hairline-strong hover:border-ink hover:bg-white/5',
  ghost: 'text-muted-strong hover:text-ink',
  danger:
    'bg-transparent text-ink border border-hairline-strong hover:border-ink hover:bg-white/5',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-4 text-[10.5px] tracking-eyebrow font-medium',
  md: 'h-10 px-5 text-[11px] tracking-eyebrow font-medium',
  lg: 'h-12 px-7 text-[12px] tracking-eyebrow font-medium',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
});
