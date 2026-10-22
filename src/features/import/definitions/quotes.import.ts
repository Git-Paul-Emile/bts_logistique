import type { Quote } from '@/types';
import { normalizeText } from '@/utils/search';
import { validateQuoteInput } from '@/utils/validators';
import { issue, readNumber, readText } from '../cells';
import type { FieldIssue, ImportDefinition } from '../importTypes';

/** Calcul à enregistrer : l'identifiant et la date sont ajoutés au moment de l'import. */
export type QuoteImportItem = Omit<Quote, 'id' | 'created_at'>;

export interface QuoteImportContext {
  /** Prix du m³ appliqué aux calculs importés. */
  coefficient: number;
}

const COLUMNS = {
  recipient_name: 'Destinataire',
  destination: 'Ville de destination',
  length_cm: 'Longueur (cm)',
  width_cm: 'Largeur (cm)',
  height_cm: 'Hauteur (cm)',
  weight_kg: 'Poids (kg)',
} as const;

const NUMBER_ERROR = 'Écrivez un nombre, par exemple 80 ou 12,5.';
const CUBIC_CM_PER_CUBIC_METER = 1_000_000;

export const quotesImport: ImportDefinition<QuoteImportItem, QuoteImportContext> = {
  entity: 'quotes',
  singular: 'calcul',
  plural: 'calculs',
  columns: [
    { header: COLUMNS.recipient_name, required: true, example: 'Société Commerciale d’Abidjan' },
    { header: COLUMNS.destination, required: true, example: 'Abidjan' },
    { header: COLUMNS.length_cm, required: true, example: 80 },
    { header: COLUMNS.width_cm, required: true, example: 60 },
    { header: COLUMNS.height_cm, required: true, example: 50 },
    { header: COLUMNS.weight_kg, required: true, example: 25 },
  ],
  parseRow(cells, context) {
    const errors: FieldIssue[] = [];
    const numbers = {
      length_cm: readNumber(cells, COLUMNS.length_cm),
      width_cm: readNumber(cells, COLUMNS.width_cm),
      height_cm: readNumber(cells, COLUMNS.height_cm),
      weight_kg: readNumber(cells, COLUMNS.weight_kg),
    };
    for (const [field, value] of Object.entries(numbers)) {
      if (value !== null && Number.isNaN(value)) {
        errors.push(issue(COLUMNS[field as keyof typeof numbers], NUMBER_ERROR));
      }
    }
    const input = {
      recipient_name: readText(cells, COLUMNS.recipient_name),
      destination: readText(cells, COLUMNS.destination),
      length_cm: numbers.length_cm ?? 0,
      width_cm: numbers.width_cm ?? 0,
      height_cm: numbers.height_cm ?? 0,
      weight_kg: numbers.weight_kg ?? 0,
    };
    const validation = validateQuoteInput(input);
    for (const [field, message] of Object.entries(validation.errors)) {
      const column = COLUMNS[field as keyof typeof COLUMNS];
      if (!errors.some((existing) => existing.column === column))
        errors.push(issue(column, message));
    }
    if (errors.length > 0) return { errors };

    const cubicMeter =
      (input.length_cm * input.width_cm * input.height_cm) / CUBIC_CM_PER_CUBIC_METER;
    return {
      item: {
        ...input,
        cubic_meter: Number(cubicMeter.toFixed(3)),
        coefficient: context.coefficient,
        final_price: Number((cubicMeter * context.coefficient).toFixed(2)),
      },
    };
  },
  fingerprint: (item) =>
    [
      normalizeText(item.recipient_name),
      normalizeText(item.destination),
      item.length_cm,
      item.width_cm,
      item.height_cm,
      item.weight_kg,
    ].join('|'),
};
