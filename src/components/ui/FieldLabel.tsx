import type { ReactNode } from 'react';

interface FieldLabelProps {
  htmlFor: string;
  children: ReactNode;
}

/** Libellé de champ des formulaires de gestion, relié à son champ par `htmlFor`. */
export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-slate-700 uppercase">
      {children}
    </label>
  );
}
