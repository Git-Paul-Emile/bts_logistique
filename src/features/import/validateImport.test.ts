import { describe, expect, it } from 'vitest';
import type { Client, Package } from '@/types';
import { clientImportContext, clientsImport } from './definitions/clients.import';
import { paymentImportContext, paymentsImport } from './definitions/payments.import';
import { validateImport } from './validateImport';

const existingClient: Client = {
  id: 'cli-1',
  name: 'Électro Abidjan SARL (M. Koffi)',
  phone: '+225 07 48 92 10 33',
  agency_code: 'CI-ABJ',
  agency_name: "Abidjan (Côte d'Ivoire)",
  total_billed: 0,
  amount_paid: 0,
  balance: 0,
  has_debt: false,
  package_count: 0,
  created_at: '2026-08-15T10:00:00Z',
};

const HEADERS = ['Nom ou raison sociale', 'Téléphone', 'E-mail', 'Adresse'];
const context = clientImportContext([existingClient]);

describe('validateImport : lecture du fichier', () => {
  it('reconnaît les colonnes malgré les majuscules, les étoiles et un ordre différent', () => {
    const plan = validateImport(
      clientsImport,
      [
        ['ADRESSE', 'téléphone *', 'Nom ou raison sociale'],
        ['Dakar', 221776543210, 'Boutique Touba'],
      ],
      context
    );

    expect(plan.issues).toEqual([]);
    expect(plan.creates.map(({ item }) => item)).toEqual([
      { name: 'Boutique Touba', phone: '221776543210', email: undefined, address: 'Dakar' },
    ]);
  });

  it('signale une colonne obligatoire absente de la ligne 1', () => {
    const plan = validateImport(clientsImport, [['Nom ou raison sociale'], ['Boutique']], context);

    expect(plan.creates).toEqual([]);
    expect(plan.issues[0]).toMatchObject({ row: 1, column: 'Téléphone' });
  });
});

describe('validateImport : lignes en erreur', () => {
  it('garde les lignes valides et donne la ligne, la colonne et la valeur de chaque erreur', () => {
    const plan = validateImport(
      clientsImport,
      [HEADERS, ['Boutique A', '+221 77 111 22 33', '', ''], ['', 'abc', 'pas-un-mail', '']],
      context
    );

    expect(plan.creates.map(({ row }) => row)).toEqual([2]);
    expect(plan.issues).toEqual([
      {
        row: 3,
        column: 'Nom ou raison sociale',
        value: '(case vide)',
        message: expect.any(String),
      },
      {
        row: 3,
        column: 'Téléphone',
        value: 'abc',
        message: expect.stringContaining('numéro valide'),
      },
      { row: 3, column: 'E-mail', value: 'pas-un-mail', message: expect.any(String) },
    ]);
  });

  it('refuse un doublon à l’intérieur du fichier', () => {
    const plan = validateImport(
      clientsImport,
      [
        HEADERS,
        ['Boutique B', '+221 77 111 22 33', '', ''],
        ['Boutique B bis', '221 77 111 22 33', '', ''],
      ],
      context
    );

    expect(plan.issues).toEqual([
      expect.objectContaining({ row: 3, message: expect.stringContaining('ligne 2') }),
    ]);
  });
});

describe('validateImport : fiches déjà enregistrées', () => {
  it('complète seulement les cases vides d’une fiche existante', () => {
    const plan = validateImport(
      clientsImport,
      [HEADERS, ['Autre nom', '+225 0748921033', 'koffi@afnet.ci', '']],
      context
    );

    expect(plan.creates).toEqual([]);
    expect(plan.completions).toEqual([
      {
        row: 2,
        targetId: 'cli-1',
        label: existingClient.name,
        changes: { email: 'koffi@afnet.ci' },
        columns: ['E-mail'],
      },
    ]);
  });

  it('ignore une fiche existante quand le fichier n’apporte rien de nouveau', () => {
    const plan = validateImport(
      clientsImport,
      [HEADERS, ['Électro Abidjan SARL (M. Koffi)', '+225 07 48 92 10 33', '', '']],
      context
    );

    expect(plan.creates).toEqual([]);
    expect(plan.completions).toEqual([]);
    expect(plan.skipped.map(({ row }) => row)).toEqual([2]);
  });
});

describe('validateImport : paiements', () => {
  const pkg = {
    id: 'pkg-1',
    client_id: 'cli-1',
    tracking_number: 'BTS-CI-2026-0089',
    final_price: 100_000,
    amount_paid: 40_000,
  } as Package;
  const paymentContext = paymentImportContext([pkg]);
  const headers = ['N° de suivi', 'Montant (F CFA)', 'Mode de règlement', 'Référence'];

  it('refuse la ligne qui fait dépasser le reste à payer, et garde la précédente', () => {
    const plan = validateImport(
      paymentsImport,
      [
        headers,
        ['bts-ci-2026-0089', 40_000, 'Espèces', 'R1'],
        ['BTS-CI-2026-0089', '30 000', 'cash', 'R2'],
      ],
      paymentContext
    );

    expect(plan.creates.map(({ row }) => row)).toEqual([2]);
    expect(plan.issues).toEqual([
      {
        row: 3,
        column: 'Montant (F CFA)',
        message: expect.stringContaining('dépassent le reste à payer'),
      },
    ]);
  });

  it('ignore au nouvel import une ligne déjà importée', () => {
    const sheet = [headers, ['BTS-CI-2026-0089', 10_000, 'Espèces', 'R1']];
    const first = validateImport(paymentsImport, sheet, paymentContext);
    const firstItem = first.creates[0]?.item;
    expect(firstItem).toBeDefined();

    const imported = new Set([paymentsImport.fingerprint?.(firstItem!) ?? '']);
    const second = validateImport(paymentsImport, sheet, paymentContext, imported);

    expect(second.creates).toEqual([]);
    expect(second.skipped.map(({ row }) => row)).toEqual([2]);
  });
});
