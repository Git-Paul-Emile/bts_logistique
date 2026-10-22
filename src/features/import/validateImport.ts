import { normalizeText } from '@/utils/search';
import type { Cell, ImportDefinition, ImportIssue, ImportPlan, RowCells } from './importTypes';

/** Au-delà, le fichier est refusé : un import aussi gros doit passer par le serveur. */
export const MAX_IMPORT_ROWS = 2000;

/** Excel numérote à partir de 1 et la ligne 1 contient les titres de colonnes. */
const FIRST_DATA_ROW_NUMBER = 2;

function headerKey(value: unknown): string {
  return normalizeText(String(value ?? '').replace(/\*/g, ''));
}

function isEmptyRow(row: readonly unknown[]): boolean {
  return row.every((cell) => cell === null || cell === undefined || String(cell).trim() === '');
}

/** Valeur d'une case telle que la personne la voit dans Excel. */
export function displayCell(cell: Cell | undefined): string {
  if (cell === null || cell === undefined || cell === '') return '(case vide)';
  if (cell instanceof Date) return cell.toLocaleDateString('fr-FR', { timeZone: 'UTC' });
  return String(cell);
}

function emptyPlan<Item, Patch>(issues: ImportIssue[], rowCount = 0): ImportPlan<Item, Patch> {
  return { creates: [], completions: [], skipped: [], issues, rowCount };
}

/**
 * Vérifie chaque ligne d'une feuille Excel comme un formulaire, puis la classe :
 * nouvelle fiche, fiche existante à compléter, ligne déjà présente ou ligne en erreur.
 */
export function validateImport<Item, Context, Patch>(
  definition: ImportDefinition<Item, Context, Patch>,
  sheet: readonly (readonly unknown[])[],
  context: Context,
  importedFingerprints: ReadonlySet<string> = new Set()
): ImportPlan<Item, Patch> {
  const [headerRow = [], ...dataRows] = sheet;
  const positions = new Map<string, number>();
  headerRow.forEach((value, index) => {
    const key = headerKey(value);
    if (key && !positions.has(key)) positions.set(key, index);
  });

  const missing = definition.columns.filter(
    (column) => column.required && !positions.has(headerKey(column.header))
  );
  if (missing.length > 0) {
    return emptyPlan(
      missing.map((column) => ({
        row: 1,
        column: column.header,
        message: `Colonne « ${column.header} » introuvable dans la ligne 1. Ajoutez-la, ou corrigez son titre.`,
      }))
    );
  }

  const rows = dataRows
    .map((cells, index) => ({ cells, rowNumber: index + FIRST_DATA_ROW_NUMBER }))
    .filter(({ cells }) => !isEmptyRow(cells));

  if (rows.length === 0) {
    return emptyPlan([
      {
        row: null,
        column: null,
        message: `Le fichier ne contient aucune ligne remplie sous les titres de colonnes.`,
      },
    ]);
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return emptyPlan(
      [
        {
          row: null,
          column: null,
          message: `Le fichier contient ${rows.length} lignes. Importez au plus ${MAX_IMPORT_ROWS} lignes à la fois.`,
        },
      ],
      rows.length
    );
  }

  const plan = emptyPlan<Item, Patch>([], rows.length);
  const firstRowByKey = new Map<string, number>();
  const firstRowByFingerprint = new Map<string, number>();

  for (const { cells, rowNumber } of rows) {
    const rowCells: RowCells = {};
    for (const column of definition.columns) {
      const position = positions.get(headerKey(column.header));
      rowCells[column.header] = position === undefined ? null : ((cells[position] ?? null) as Cell);
    }

    const result = definition.parseRow(rowCells, context);
    if ('errors' in result) {
      for (const error of result.errors) {
        plan.issues.push({
          row: rowNumber,
          column: error.column,
          value: displayCell(rowCells[error.column]),
          message: error.message,
        });
      }
      continue;
    }
    const { item } = result;

    if (definition.uniqueKey) {
      const key = normalizeText(definition.uniqueKey.get(item));
      const firstRow = firstRowByKey.get(key);
      if (key && firstRow !== undefined) {
        plan.issues.push({
          row: rowNumber,
          column: definition.uniqueKey.column,
          value: displayCell(rowCells[definition.uniqueKey.column]),
          message: `Même ${definition.uniqueKey.label} qu’à la ligne ${firstRow}. Gardez une seule des deux lignes.`,
        });
        continue;
      }
      if (key) firstRowByKey.set(key, rowNumber);
    }

    const match = definition.matchExisting?.(item, context) ?? null;
    if (match?.kind === 'skip') {
      plan.skipped.push({ row: rowNumber, label: match.label });
      continue;
    }
    if (match?.kind === 'complete') {
      plan.completions.push({
        row: rowNumber,
        targetId: match.targetId,
        label: match.label,
        changes: match.changes,
        columns: match.columns,
      });
      continue;
    }

    if (definition.fingerprint) {
      const fingerprint = definition.fingerprint(item);
      if (importedFingerprints.has(fingerprint)) {
        plan.skipped.push({ row: rowNumber, label: 'déjà importée lors d’un import précédent' });
        continue;
      }
      const firstRow = firstRowByFingerprint.get(fingerprint);
      if (firstRow !== undefined) {
        plan.issues.push({
          row: rowNumber,
          column: null,
          message: `Ligne identique à la ligne ${firstRow}. Supprimez-la si c’est un doublon.`,
        });
        continue;
      }
      firstRowByFingerprint.set(fingerprint, rowNumber);
    }

    plan.creates.push({ row: rowNumber, item });
  }

  if (definition.checkRows) {
    const crossIssues = definition.checkRows(plan.creates, context);
    const rowsInError = new Set(crossIssues.map((issue) => issue.row));
    plan.issues.push(...crossIssues);
    plan.creates = plan.creates.filter(({ row }) => !rowsInError.has(row));
  }

  plan.issues.sort((a, b) => (a.row ?? 0) - (b.row ?? 0));
  return plan;
}
