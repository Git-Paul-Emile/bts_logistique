import type { Client } from '@/types';
import { validateClientInput } from '@/utils/validators';
import { issue, readText } from '../cells';
import { completeEmptyFields } from '../completeFields';
import type { FieldIssue, ImportDefinition } from '../importTypes';

export type ClientImportItem = Pick<Client, 'name' | 'phone' | 'email' | 'address'>;
export type ClientImportPatch = Partial<Pick<Client, 'email' | 'address'>>;

export interface ClientImportContext {
  /** Clients enregistrés, indexés par leur téléphone en chiffres seuls. */
  clientsByPhone: ReadonlyMap<string, Client>;
}

const COLUMNS = {
  name: 'Nom ou raison sociale',
  phone: 'Téléphone',
  email: 'E-mail',
  address: 'Adresse',
} as const;

const digits = (value: string) => value.replace(/\D/g, '');

export function clientImportContext(clients: readonly Client[]): ClientImportContext {
  return { clientsByPhone: new Map(clients.map((client) => [digits(client.phone), client])) };
}

export const clientsImport: ImportDefinition<
  ClientImportItem,
  ClientImportContext,
  ClientImportPatch
> = {
  entity: 'clients',
  singular: 'client',
  plural: 'clients',
  columns: [
    { header: COLUMNS.name, required: true, example: 'Boutique Exemple SARL (M. Kouassi)' },
    { header: COLUMNS.phone, required: true, example: '+225 07 00 00 00 01' },
    { header: COLUMNS.email, required: false, example: 'contact@boutique-exemple.ci' },
    { header: COLUMNS.address, required: false, example: 'Zone 4C, Abidjan' },
  ],
  parseRow(cells) {
    const item: ClientImportItem = {
      name: readText(cells, COLUMNS.name),
      phone: readText(cells, COLUMNS.phone),
      email: readText(cells, COLUMNS.email) || undefined,
      address: readText(cells, COLUMNS.address) || undefined,
    };
    const validation = validateClientInput(item);
    const errors: FieldIssue[] = Object.entries(validation.errors).map(([field, message]) =>
      issue(COLUMNS[field as keyof typeof COLUMNS], message)
    );
    return errors.length > 0 ? { errors } : { item };
  },
  uniqueKey: {
    column: COLUMNS.phone,
    label: 'numéro de téléphone',
    get: (item) => digits(item.phone),
  },
  // Le téléphone identifie le client : une fiche existante est seulement complétée.
  matchExisting(item, context) {
    const client = context.clientsByPhone.get(digits(item.phone));
    if (!client) return null;
    return completeEmptyFields({ id: client.id, label: client.name, record: client }, item, [
      { key: 'email', column: COLUMNS.email },
      { key: 'address', column: COLUMNS.address },
    ]);
  },
};
