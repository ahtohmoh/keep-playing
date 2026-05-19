import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground',
          'placeholder:text-foreground-subtle',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-quick ease-standard',
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[88px] w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground',
        'placeholder:text-foreground-subtle',
        'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-quick ease-standard',
        className,
      )}
      {...rest}
    />
  );
});
