/**
 * Class name helper. clsx for conditional logic, tailwind-merge to resolve
 * conflicting Tailwind utilities.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
