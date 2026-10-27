import type { SelectOption } from '@/components/ui/SearchableSelect';
import type { Client } from '@/types';

/** Options à partir d'un dictionnaire de libellés : { valeur: libellé }. */
export function labelsToOptions<T extends string>(labels: Record<T, string>): SelectOption<T>[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

/** Un client se retrouve par son nom, son entreprise (comprise dans le nom), son téléphone ou son e-mail. */
export function clientToOption(client: Client): SelectOption<string> {
  return {
    value: client.id,
    label: client.name,
    hint: client.phone,
    keywords: [client.email ?? '', client.address ?? ''],
  };
}
