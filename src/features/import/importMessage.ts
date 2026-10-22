import type { ImportDefinition } from './importTypes';

function count<Item, Context, Patch>(
  definition: ImportDefinition<Item, Context, Patch>,
  value: number
): string {
  return `${value} ${value > 1 ? definition.plural : definition.singular}`;
}

/** Message de confirmation : « 12 clients ajoutés, 3 clients complétés. » */
export function importedMessage<Item, Context, Patch>(
  definition: ImportDefinition<Item, Context, Patch>,
  created: number,
  completed = 0
): string {
  const parts: string[] = [];
  if (created > 0) parts.push(`${count(definition, created)} ajouté${created > 1 ? 's' : ''}`);
  if (completed > 0) {
    parts.push(`${count(definition, completed)} complété${completed > 1 ? 's' : ''}`);
  }
  return parts.length > 0 ? `Import terminé : ${parts.join(', ')}.` : 'Import terminé.';
}
