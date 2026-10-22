import type { AppUser, AppUserInput } from '@/types';
import { BTS_DESTINATIONS, BTS_ORIGINS, USER_ROLE_LABELS } from '@/types';
import { normalizeText } from '@/utils/search';
import { isValidEmail, isValidPhone } from '@/utils/validators';
import { choiceList, issue, readChoice, readText } from '../cells';
import { completeEmptyFields } from '../completeFields';
import type { FieldIssue, ImportDefinition } from '../importTypes';
import { matchPlace } from './shipments.import';

export type UserImportPatch = Partial<Pick<AppUser, 'phone'>>;

export interface UserImportContext {
  usersByEmail: ReadonlyMap<string, AppUser>;
}

const COLUMNS = {
  name: 'Nom et prénom',
  email: 'E-mail',
  phone: 'Téléphone',
  role: 'Rôle',
  agency: 'Agence',
} as const;

const AGENCIES = [...BTS_ORIGINS, ...BTS_DESTINATIONS];

export function userImportContext(users: readonly AppUser[]): UserImportContext {
  return { usersByEmail: new Map(users.map((user) => [normalizeText(user.email), user])) };
}

export const usersImport: ImportDefinition<AppUserInput, UserImportContext, UserImportPatch> = {
  entity: 'users',
  singular: 'compte',
  plural: 'comptes',
  columns: [
    { header: COLUMNS.name, required: true, example: 'Awa Traoré' },
    { header: COLUMNS.email, required: true, example: 'awa.traore@bts-logistique.fr' },
    { header: COLUMNS.phone, required: false, example: '+223 70 00 00 00' },
    { header: COLUMNS.role, required: true, example: 'Collecteur' },
    { header: COLUMNS.agency, required: true, example: BTS_DESTINATIONS[0] },
  ],
  parseRow(cells) {
    const errors: FieldIssue[] = [];
    const name = readText(cells, COLUMNS.name);
    const email = readText(cells, COLUMNS.email);
    const phone = readText(cells, COLUMNS.phone);

    if (!name) errors.push(issue(COLUMNS.name, 'Saisissez le nom et le prénom.'));
    if (!email) {
      errors.push(issue(COLUMNS.email, 'Saisissez l’adresse e-mail professionnelle.'));
    } else if (!isValidEmail(email)) {
      errors.push(
        issue(COLUMNS.email, 'Saisissez une adresse complète, par exemple nom@exemple.com.')
      );
    }
    if (phone && !isValidPhone(phone)) {
      errors.push(
        issue(COLUMNS.phone, 'Saisissez un numéro avec l’indicatif, ou laissez la case vide.')
      );
    }
    const role = readChoice(cells, COLUMNS.role, USER_ROLE_LABELS);
    if (!role) errors.push(issue(COLUMNS.role, `Indiquez ${choiceList(USER_ROLE_LABELS)}.`));
    const agency = matchPlace(readText(cells, COLUMNS.agency), AGENCIES);
    if (!agency) errors.push(issue(COLUMNS.agency, `Choisissez parmi : ${AGENCIES.join(', ')}.`));

    if (errors.length > 0 || !role || !agency) return { errors };
    return { item: { name, email: email.trim(), phone: phone || undefined, role, agency } };
  },
  uniqueKey: { column: COLUMNS.email, label: 'adresse e-mail', get: (item) => item.email },
  matchExisting(item, context) {
    const user = context.usersByEmail.get(normalizeText(item.email));
    if (!user) return null;
    return completeEmptyFields({ id: user.id, label: user.name, record: user }, item, [
      { key: 'phone', column: COLUMNS.phone },
    ]);
  },
};
