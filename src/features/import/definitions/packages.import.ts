import type { PublicPricing } from '@/api/endpoints/pricing.api';
import type { Client, NetworkLocation, Package, TransportMode } from '@/types';
import { TRANSPORT_MODE_LABELS } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { computeCubicMeter, computePrice } from '@/utils/packagePricing';
import { normalizeText } from '@/utils/search';
import { choiceList, issue, readChoice, readNumber, readText } from '../cells';
import { completeEmptyFields } from '../completeFields';
import type { FieldIssue, ImportDefinition } from '../importTypes';
import { EXAMPLE_DESTINATION, EXAMPLE_ORIGIN, matchPlace, placeChoices } from './shipments.import';

/**
 * Ligne de colis. Un numéro de suivi renseigné désigne un colis déjà enregistré, à compléter ;
 * une case vide crée un nouveau colis, dont le numéro est attribué par le serveur.
 */
export interface PackageImportItem {
  tracking_number: string;
  client_id: string;
  origin_code: string;
  destination_code: string;
  description?: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  transport_mode: TransportMode;
  /** Montant déjà versé, enregistré comme paiement à la création. */
  amount_paid: number;
}
export type PackageImportPatch = Partial<Pick<Package, 'description'>>;

export interface PackageImportContext {
  clients: readonly Client[];
  rates: PublicPricing['rates'];
  packagesByTracking: ReadonlyMap<string, Package>;
  origins: readonly NetworkLocation[];
  destinations: readonly NetworkLocation[];
}

const COLUMNS = {
  tracking: 'N° de suivi',
  client: 'Client (nom ou téléphone)',
  origin: 'Hub de départ',
  destination: 'Destination',
  description: 'Description',
  length_cm: 'Longueur (cm)',
  width_cm: 'Largeur (cm)',
  height_cm: 'Hauteur (cm)',
  weight_kg: 'Poids (kg)',
  mode: 'Mode de transport',
  paid: 'Montant déjà payé (F CFA)',
} as const;

const DIMENSIONS = ['length_cm', 'width_cm', 'height_cm', 'weight_kg'] as const;

const digits = (value: string) => value.replace(/\D/g, '');

export function packageImportContext(
  data: Omit<PackageImportContext, 'packagesByTracking'> & { packages: readonly Package[] }
): PackageImportContext {
  const { packages, ...rest } = data;
  return {
    ...rest,
    packagesByTracking: new Map(packages.map((pkg) => [normalizeText(pkg.tracking_number), pkg])),
  };
}

/** Retrouve le client par son téléphone ou par son nom exact. */
function findClient(value: string, clients: readonly Client[]): Client | 'ambiguous' | undefined {
  const phoneDigits = digits(value);
  if (phoneDigits.length >= 8) {
    const byPhone = clients.find((client) => digits(client.phone) === phoneDigits);
    if (byPhone) return byPhone;
  }
  const byName = clients.filter((client) => normalizeText(client.name) === normalizeText(value));
  if (byName.length > 1) return 'ambiguous';
  return byName[0];
}

export const packagesImport: ImportDefinition<
  PackageImportItem,
  PackageImportContext,
  PackageImportPatch
> = {
  entity: 'packages',
  singular: 'colis',
  plural: 'colis',
  columns: [
    { header: COLUMNS.tracking, required: false, example: 'Vide pour un nouveau colis' },
    { header: COLUMNS.client, required: true, example: '+225 07 48 92 10 33' },
    { header: COLUMNS.origin, required: true, example: EXAMPLE_ORIGIN },
    { header: COLUMNS.destination, required: true, example: EXAMPLE_DESTINATION },
    { header: COLUMNS.description, required: false, example: 'Pièces détachées' },
    { header: COLUMNS.length_cm, required: true, example: 80 },
    { header: COLUMNS.width_cm, required: true, example: 60 },
    { header: COLUMNS.height_cm, required: true, example: 50 },
    { header: COLUMNS.weight_kg, required: true, example: 25 },
    { header: COLUMNS.mode, required: true, example: 'Maritime' },
    { header: COLUMNS.paid, required: false, example: 0 },
  ],
  parseRow(cells, context) {
    const errors: FieldIssue[] = [];

    const trackingNumber = readText(cells, COLUMNS.tracking);
    if (trackingNumber && !context.packagesByTracking.has(normalizeText(trackingNumber))) {
      errors.push(
        issue(
          COLUMNS.tracking,
          'Aucun colis ne porte ce numéro. Laissez la case vide : le numéro est attribué à l’enregistrement.'
        )
      );
    }

    const clientValue = readText(cells, COLUMNS.client);
    const client = clientValue ? findClient(clientValue, context.clients) : undefined;
    if (!clientValue) {
      errors.push(issue(COLUMNS.client, 'Saisissez le téléphone ou le nom exact du client.'));
    } else if (client === 'ambiguous') {
      errors.push(
        issue(COLUMNS.client, 'Plusieurs clients portent ce nom : indiquez son téléphone.')
      );
    } else if (!client) {
      errors.push(
        issue(
          COLUMNS.client,
          'Client introuvable. Créez-le d’abord dans Clients, ou vérifiez le téléphone.'
        )
      );
    }

    const origin = matchPlace(readText(cells, COLUMNS.origin), context.origins);
    if (!origin) errors.push(issue(COLUMNS.origin, placeChoices(context.origins)));
    const destination = matchPlace(readText(cells, COLUMNS.destination), context.destinations);
    if (!destination) {
      errors.push(issue(COLUMNS.destination, placeChoices(context.destinations)));
    }

    const sizes: Record<(typeof DIMENSIONS)[number], number> = {
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      weight_kg: 0,
    };
    for (const field of DIMENSIONS) {
      const value = readNumber(cells, COLUMNS[field]);
      if (value === null || Number.isNaN(value) || value <= 0) {
        errors.push(
          issue(COLUMNS[field], 'Saisissez un nombre supérieur à 0, par exemple 80 ou 12,5.')
        );
      } else {
        sizes[field] = value;
      }
    }

    const mode = readChoice(cells, COLUMNS.mode, TRANSPORT_MODE_LABELS);
    if (!mode) errors.push(issue(COLUMNS.mode, `Indiquez ${choiceList(TRANSPORT_MODE_LABELS)}.`));

    const paidValue = readNumber(cells, COLUMNS.paid);
    if (paidValue !== null && (!Number.isInteger(paidValue) || paidValue < 0)) {
      errors.push(
        issue(COLUMNS.paid, 'Saisissez un montant entier en F CFA, ou 0 si rien n’a été payé.')
      );
    }

    if (
      errors.length > 0 ||
      !client ||
      client === 'ambiguous' ||
      !origin ||
      !destination ||
      !mode
    ) {
      return { errors };
    }

    const cubicMeter = computeCubicMeter(sizes.length_cm, sizes.width_cm, sizes.height_cm);
    const finalPrice = computePrice(cubicMeter, context.rates[mode].client_rate_per_cbm);
    const amountPaid = paidValue ?? 0;
    if (amountPaid > finalPrice) {
      return {
        errors: [
          issue(
            COLUMNS.paid,
            `Le montant payé dépasse le prix du colis : ${formatPrice(finalPrice)}.`
          ),
        ],
      };
    }

    return {
      item: {
        tracking_number: trackingNumber,
        client_id: client.id,
        description: readText(cells, COLUMNS.description) || undefined,
        origin_code: origin.code,
        destination_code: destination.code,
        ...sizes,
        transport_mode: mode,
        amount_paid: amountPaid,
      },
    };
  },
  uniqueKey: {
    column: COLUMNS.tracking,
    label: 'numéro de suivi',
    get: (item) => item.tracking_number,
  },
  matchExisting(item, context) {
    if (!item.tracking_number) return null;
    const pkg = context.packagesByTracking.get(normalizeText(item.tracking_number));
    if (!pkg) return null;
    return completeEmptyFields({ id: pkg.id, label: pkg.tracking_number, record: pkg }, item, [
      { key: 'description', column: COLUMNS.description },
    ]);
  },
  // Un colis sans numéro de suivi est reconnu à son contenu lors d'un nouvel import du même fichier.
  fingerprint: (item) =>
    item.tracking_number
      ? `n:${normalizeText(item.tracking_number)}`
      : [
          item.client_id,
          item.origin_code,
          item.destination_code,
          item.description ?? '',
          item.length_cm,
          item.width_cm,
          item.height_cm,
          item.weight_kg,
          item.transport_mode,
          item.amount_paid,
        ]
          .map((part) => normalizeText(String(part)))
          .join('|'),
};
