import type { ExistingMatch } from './importTypes';

function isEmpty(value: unknown): boolean {
  return (
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
  );
}

/**
 * Compare une fiche enregistrée et une ligne du fichier. Seules les cases vides de la fiche
 * sont remplies : une valeur déjà enregistrée n'est jamais écrasée par l'import.
 */
export function completeEmptyFields<Record_, Key extends keyof Record_>(
  target: { id: string; label: string; record: Record_ },
  incoming: Partial<Record_>,
  fields: readonly { key: Key; column: string }[]
): ExistingMatch<Partial<Pick<Record_, Key>>> {
  const changes: Partial<Pick<Record_, Key>> = {};
  const columns: string[] = [];
  for (const { key, column } of fields) {
    if (isEmpty(target.record[key]) && !isEmpty(incoming[key])) {
      changes[key] = incoming[key] as Record_[Key];
      columns.push(column);
    }
  }
  return columns.length > 0
    ? { kind: 'complete', targetId: target.id, label: target.label, changes, columns }
    : { kind: 'skip', label: `${target.label} : déjà enregistré, rien à compléter` };
}
