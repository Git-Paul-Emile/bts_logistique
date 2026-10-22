import { normalizeText } from '@/utils/search';
import type { Cell, FieldIssue, RowCells } from './importTypes';

/** Texte d'une cellule, sans espaces autour. Un nombre (téléphone saisi en chiffres) devient du texte. */
export function readText(cells: RowCells, column: string): string {
  const cell = cells[column];
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  return String(cell).trim();
}

/**
 * Nombre d'une cellule. Accepte « 12,5 » et « 1 250 » écrits en texte.
 * Renvoie null si la cellule est vide, NaN si elle ne contient pas un nombre.
 */
export function readNumber(cells: RowCells, column: string): number | null {
  const cell = cells[column];
  if (cell === null || cell === undefined || cell === '') return null;
  if (typeof cell === 'number') return cell;
  if (typeof cell !== 'string') return Number.NaN;
  const cleaned = cell.replace(/\s/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(cleaned) ? Number(cleaned) : Number.NaN;
}

const FRENCH_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function toIsoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? date.toISOString().slice(0, 10) : null;
}

/**
 * Date d'une cellule au format AAAA-MM-JJ. Accepte une vraie date Excel, « 21/10/2026 » ou « 2026-10-21 ».
 * Renvoie '' si la cellule est vide, null si la date est invalide.
 */
export function readDate(cells: RowCells, column: string): string | null {
  const cell: Cell | undefined = cells[column];
  if (cell === null || cell === undefined || cell === '') return '';
  if (cell instanceof Date)
    return Number.isNaN(cell.getTime()) ? null : cell.toISOString().slice(0, 10);
  const text = String(cell).trim();
  const french = FRENCH_DATE.exec(text);
  if (french) return toIsoDate(Number(french[3]), Number(french[2]), Number(french[1]));
  const iso = ISO_DATE.exec(text);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  return null;
}

/**
 * Valeur d'une liste fermée. La cellule peut contenir le libellé (« Maritime ») ou la valeur
 * technique (« sea »), sans tenir compte des majuscules ni des accents.
 */
export function readChoice<T extends string>(
  cells: RowCells,
  column: string,
  labels: Readonly<Record<T, string>>
): T | null | undefined {
  const text = normalizeText(readText(cells, column));
  if (!text) return undefined;
  const entries = Object.entries(labels) as [T, string][];
  const match = entries.find(
    ([value, label]) => normalizeText(label) === text || normalizeText(value) === text
  );
  return match ? match[0] : null;
}

/** « A », « B » ou « C » */
export function choiceList(labels: Readonly<Record<string, string>>): string {
  const quoted = Object.values(labels).map((label) => `« ${label} »`);
  const last = quoted.pop();
  return quoted.length > 0 ? `${quoted.join(', ')} ou ${last}` : (last ?? '');
}

/** Raccourci pour écrire les erreurs d'une ligne. */
export function issue(column: string, message: string): FieldIssue {
  return { column, message };
}
