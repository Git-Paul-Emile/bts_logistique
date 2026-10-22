/** Taille maximale acceptée pour un fichier importé. */
export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;

const XLSX_EXTENSION = /\.xlsx$/i;

export class SpreadsheetFileError extends Error {}

/** Lit la première feuille d'un fichier .xlsx. Les bibliothèques ne sont chargées qu'à l'usage. */
export async function readFirstSheet(file: File): Promise<unknown[][]> {
  if (!XLSX_EXTENSION.test(file.name)) {
    throw new SpreadsheetFileError(
      'Choisissez un fichier Excel au format .xlsx. Un ancien fichier .xls ou un .csv doit être enregistré en .xlsx depuis Excel.'
    );
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new SpreadsheetFileError('Le fichier dépasse 5 Mo. Découpez-le en plusieurs fichiers.');
  }
  const { readSheet } = await import('read-excel-file/browser');
  try {
    return (await readSheet(file)) as unknown[][];
  } catch {
    throw new SpreadsheetFileError(
      'Ce fichier ne peut pas être lu. Ouvrez-le dans Excel, enregistrez-le en .xlsx, puis réessayez.'
    );
  }
}
