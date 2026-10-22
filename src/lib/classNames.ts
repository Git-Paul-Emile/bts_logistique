/** Assemble des classes CSS en ignorant les valeurs vides : cn('a', condition && 'b'). */
export function cn(...inputs: (string | number | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}
