/** Valeur brute d'une cellule Excel : texte, nombre, booléen, date ou vide. */
export type Cell = string | number | boolean | Date | null;

/** Cellules d'une ligne, indexées par le titre de colonne attendu. */
export type RowCells = Record<string, Cell>;

export interface ImportColumn {
  /** Titre de la colonne dans le fichier (majuscules, accents et « * » ne comptent pas). */
  header: string;
  required: boolean;
  /** Exemple de valeur, affiché pour montrer le format attendu. */
  example: string | number;
}

export interface FieldIssue {
  column: string;
  message: string;
}

/** Problème trouvé dans le fichier. `row` vaut null pour un problème qui concerne tout le fichier. */
export interface ImportIssue {
  row: number | null;
  column: string | null;
  /** Valeur lue dans la case en erreur, pour la retrouver facilement dans Excel. */
  value?: string;
  message: string;
}

export type RowResult<Item> = { item: Item } | { errors: FieldIssue[] };

/** Ce que devient une ligne qui correspond à une fiche déjà enregistrée. */
export type ExistingMatch<Patch> =
  | {
      kind: 'complete';
      targetId: string;
      /** Nom lisible de la fiche : « Électro Abidjan SARL », « MSKU-998811-4 »… */
      label: string;
      /** Cases vides de la fiche, remplies par le fichier. */
      changes: Patch;
      /** Titres des colonnes complétées, pour le résumé. */
      columns: string[];
    }
  | { kind: 'skip'; label: string };

export interface ImportDefinition<Item, Context, Patch = never> {
  /** Clé de l'historique des imports : « clients », « payments »… */
  entity: string;
  /** Nom des éléments importés, au singulier et au pluriel : « client », « clients ». */
  singular: string;
  plural: string;
  columns: readonly ImportColumn[];
  /** Vérifie une ligne comme un formulaire et la transforme en élément à créer. */
  parseRow: (cells: RowCells, context: Context) => RowResult<Item>;
  /** Repère deux lignes du fichier qui décrivent le même élément. */
  uniqueKey?: {
    column: string;
    label: string;
    get: (item: Item) => string;
  };
  /**
   * Fiche déjà enregistrée qui correspond à la ligne (même téléphone, même n° de conteneur…) :
   * rien à faire, ou des cases vides à compléter. null : la ligne crée une nouvelle fiche.
   */
  matchExisting?: (item: Item, context: Context) => ExistingMatch<Patch> | null;
  /**
   * Empreinte d'une ligne sans identifiant (paiement, calcul) : une ligne déjà importée une fois
   * est ignorée aux imports suivants.
   */
  fingerprint?: (item: Item) => string;
  /** Contrôles qui portent sur plusieurs lignes à la fois (cumul de montants…). */
  checkRows?: (rows: readonly { item: Item; row: number }[], context: Context) => ImportIssue[];
}

export interface ImportPlan<Item, Patch> {
  creates: { row: number; item: Item }[];
  completions: {
    row: number;
    targetId: string;
    label: string;
    changes: Patch;
    columns: string[];
  }[];
  skipped: { row: number; label: string }[];
  issues: ImportIssue[];
  /** Nombre de lignes de données lues, lignes vides exclues. */
  rowCount: number;
}

/** Ce qui est envoyé à l'enregistrement : les lignes valides seulement. */
export interface ImportBatch<Item, Patch> {
  creates: Item[];
  completions: { targetId: string; changes: Patch }[];
  /**
   * À appeler après l'enregistrement de chaque élément créé : son empreinte est gardée par le
   * serveur, et un import interrompu puis relancé ne le recrée pas.
   */
  markImported: (item: Item) => Promise<void>;
}
