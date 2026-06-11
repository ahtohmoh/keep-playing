import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../cn';

const inputBase =
  'w-full bg-transparent text-ink font-sans font-light border-b border-hairline px-0 py-2.5 ' +
  'placeholder:text-muted ' +
  'focus:outline-none focus:border-ink ' +
  'disabled:opacity-30 disabled:cursor-not-allowed ' +
  'transition-colors duration-quick ease-standard';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(inputBase, 'h-10', className)} {...rest} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(inputBase, 'min-h-[96px] py-2.5', className)} {...rest} />;
});
