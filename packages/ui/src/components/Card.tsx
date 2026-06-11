import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../cn';

type Variant = 'plain' | 'glass' | 'dashed';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  plain: 'border border-edge bg-paper2',
  glass: 'glass',
  dashed: 'dashed-strong bg-paper2/50',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'plain', ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        'px-pad py-pad transition-colors duration-quick ease-standard',
        className,
      )}
      {...rest}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn('mb-4', className)} {...rest} />;
  },
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('font-sans font-medium text-base text-ink', className)}
        {...rest}
      />
    );
  },
);

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...rest }, ref) {
  return <p ref={ref} className={cn('mt-1 text-sm text-muted', className)} {...rest} />;
});

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn('text-muted-strong', className)} {...rest} />;
  },
);
