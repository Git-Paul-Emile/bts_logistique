import type { Shipment } from '@/types';
import { BTS_DESTINATIONS, BTS_ORIGINS, TRANSPORT_MODE_LABELS } from '@/types';
import { normalizeText } from '@/utils/search';
import { validateShipmentInput } from '@/utils/validators';
import { choiceList, issue, readChoice, readDate, readNumber, readText } from '../cells';
import { completeEmptyFields } from '../completeFields';
import type { FieldIssue, ImportDefinition } from '../importTypes';

export type ShipmentImportItem = Omit<Shipment, 'id' | 'created_at'>;
export type ShipmentImportPatch = Partial<
  Pick<Shipment, 'departure_date' | 'estimated_arrival' | 'notes'>
>;

export interface ShipmentImportContext {
  shipmentsByNumber: ReadonlyMap<string, Shipment>;
}

const COLUMNS = {
  container_number: 'N° conteneur ou vol',
  type: 'Type de fret',
  origin: 'Hub de départ',
  destination: 'Hub d’arrivée',
  carrier: 'Compagnie',
  max_volume_cbm: 'Capacité (m³)',
  departure_date: 'Date de départ',
  estimated_arrival: 'Date d’arrivée estimée',
  notes: 'Notes',
} as const;

export function shipmentImportContext(shipments: readonly Shipment[]): ShipmentImportContext {
  return {
    shipmentsByNumber: new Map(
      shipments.map((shipment) => [normalizeText(shipment.container_number), shipment])
    ),
  };
}

/** Trouve la ville dans une liste fermée, sans tenir compte des majuscules ni des accents. */
export function matchPlace(value: string, places: readonly string[]): string | undefined {
  const key = normalizeText(value);
  return places.find((place) => normalizeText(place) === key);
}

export const shipmentsImport: ImportDefinition<
  ShipmentImportItem,
  ShipmentImportContext,
  ShipmentImportPatch
> = {
  entity: 'shipments',
  singular: 'conteneur',
  plural: 'conteneurs',
  columns: [
    { header: COLUMNS.container_number, required: true, example: 'MSKU-998811-4' },
    { header: COLUMNS.type, required: true, example: 'Maritime' },
    { header: COLUMNS.origin, required: true, example: BTS_ORIGINS[0] },
    { header: COLUMNS.destination, required: true, example: BTS_DESTINATIONS[0] },
    { header: COLUMNS.carrier, required: true, example: 'Maersk' },
    { header: COLUMNS.max_volume_cbm, required: true, example: 68 },
    { header: COLUMNS.departure_date, required: false, example: '05/11/2026' },
    { header: COLUMNS.estimated_arrival, required: false, example: '14/12/2026' },
    { header: COLUMNS.notes, required: false, example: 'Scellé n° 44821' },
  ],
  parseRow(cells) {
    const errors: FieldIssue[] = [];
    const type = readChoice(cells, COLUMNS.type, TRANSPORT_MODE_LABELS);
    if (!type) {
      errors.push(issue(COLUMNS.type, `Indiquez ${choiceList(TRANSPORT_MODE_LABELS)}.`));
    }
    const origin = matchPlace(readText(cells, COLUMNS.origin), BTS_ORIGINS);
    if (!origin) {
      errors.push(issue(COLUMNS.origin, `Choisissez parmi : ${BTS_ORIGINS.join(', ')}.`));
    }
    const destination = matchPlace(readText(cells, COLUMNS.destination), BTS_DESTINATIONS);
    if (!destination) {
      errors.push(issue(COLUMNS.destination, `Choisissez parmi : ${BTS_DESTINATIONS.join(', ')}.`));
    }
    const departure = readDate(cells, COLUMNS.departure_date);
    if (departure === null) {
      errors.push(issue(COLUMNS.departure_date, 'Écrivez la date au format JJ/MM/AAAA.'));
    }
    const arrival = readDate(cells, COLUMNS.estimated_arrival);
    if (arrival === null) {
      errors.push(issue(COLUMNS.estimated_arrival, 'Écrivez la date au format JJ/MM/AAAA.'));
    }

    const containerNumber = readText(cells, COLUMNS.container_number);
    const capacity = readNumber(cells, COLUMNS.max_volume_cbm);
    const validation = validateShipmentInput({
      container_number: containerNumber,
      carrier: readText(cells, COLUMNS.carrier),
      max_volume_cbm: capacity ?? Number.NaN,
      departure_date: departure ?? undefined,
      estimated_arrival: arrival ?? undefined,
    });
    for (const [field, message] of Object.entries(validation.errors)) {
      errors.push(issue(COLUMNS[field as keyof typeof COLUMNS], message));
    }

    if (errors.length > 0 || !type || !origin || !destination) return { errors };
    return {
      item: {
        container_number: containerNumber,
        type,
        origin,
        destination,
        status: 'planned',
        carrier: readText(cells, COLUMNS.carrier),
        departure_date: departure || undefined,
        estimated_arrival: arrival || undefined,
        max_volume_cbm: capacity ?? 0,
        current_volume_cbm: 0,
        package_ids: [],
        notes: readText(cells, COLUMNS.notes) || undefined,
      },
    };
  },
  uniqueKey: {
    column: COLUMNS.container_number,
    label: 'numéro de conteneur',
    get: (item) => item.container_number,
  },
  matchExisting(item, context) {
    const shipment = context.shipmentsByNumber.get(normalizeText(item.container_number));
    if (!shipment) return null;
    return completeEmptyFields(
      { id: shipment.id, label: shipment.container_number, record: shipment },
      item,
      [
        { key: 'departure_date', column: COLUMNS.departure_date },
        { key: 'estimated_arrival', column: COLUMNS.estimated_arrival },
        { key: 'notes', column: COLUMNS.notes },
      ]
    );
  },
};
