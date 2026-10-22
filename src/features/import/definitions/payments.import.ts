import type { Package, PaymentMethod } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { normalizeText } from '@/utils/search';
import { choiceList, issue, readChoice, readNumber, readText } from '../cells';
import type { FieldIssue, ImportDefinition, ImportIssue } from '../importTypes';

export interface PaymentImportItem {
  packageId: string;
  trackingNumber: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export interface PaymentImportContext {
  packagesByTracking: ReadonlyMap<string, Package>;
}

const COLUMNS = {
  tracking: 'N° de suivi',
  amount: 'Montant (F CFA)',
  method: 'Mode de règlement',
  reference: 'Référence',
} as const;

export function paymentImportContext(packages: readonly Package[]): PaymentImportContext {
  return {
    packagesByTracking: new Map(packages.map((pkg) => [normalizeText(pkg.tracking_number), pkg])),
  };
}

function remainingOf(pkg: Package): number {
  return Math.max(0, pkg.final_price - (pkg.amount_paid || 0));
}

export const paymentsImport: ImportDefinition<PaymentImportItem, PaymentImportContext> = {
  entity: 'payments',
  singular: 'paiement',
  plural: 'paiements',
  columns: [
    { header: COLUMNS.tracking, required: true, example: 'BTS-CI-2026-0089' },
    { header: COLUMNS.amount, required: true, example: 50000 },
    { header: COLUMNS.method, required: true, example: 'Espèces' },
    { header: COLUMNS.reference, required: false, example: 'WAVE-CI-998811' },
  ],
  parseRow(cells, context) {
    const errors: FieldIssue[] = [];
    const trackingNumber = readText(cells, COLUMNS.tracking);
    const pkg = context.packagesByTracking.get(normalizeText(trackingNumber));
    if (!trackingNumber) {
      errors.push(issue(COLUMNS.tracking, 'Saisissez le numéro de suivi du colis réglé.'));
    } else if (!pkg) {
      errors.push(issue(COLUMNS.tracking, 'Aucun colis ne porte ce numéro de suivi.'));
    }

    const amount = readNumber(cells, COLUMNS.amount);
    if (amount === null || Number.isNaN(amount) || amount <= 0) {
      errors.push(
        issue(COLUMNS.amount, 'Saisissez un montant en F CFA supérieur à 0, sans symbole.')
      );
    }

    const method = readChoice(cells, COLUMNS.method, PAYMENT_METHOD_LABELS);
    if (!method) {
      errors.push(issue(COLUMNS.method, `Indiquez ${choiceList(PAYMENT_METHOD_LABELS)}.`));
    }

    if (errors.length > 0 || !pkg || !method || amount === null) return { errors };
    return {
      item: {
        packageId: pkg.id,
        trackingNumber: pkg.tracking_number,
        amount,
        method,
        reference: readText(cells, COLUMNS.reference) || undefined,
      },
    };
  },
  fingerprint: (item) =>
    [item.packageId, item.amount, item.method, normalizeText(item.reference ?? '')].join('|'),
  checkRows(rows, context) {
    const issues: ImportIssue[] = [];
    const totalByPackage = new Map<string, number>();
    for (const { item, row } of rows) {
      const total = (totalByPackage.get(item.packageId) ?? 0) + item.amount;
      totalByPackage.set(item.packageId, total);
      const pkg = context.packagesByTracking.get(normalizeText(item.trackingNumber));
      if (pkg && total > remainingOf(pkg)) {
        issues.push({
          row,
          column: COLUMNS.amount,
          message: `Les paiements de ce colis dépassent le reste à payer : ${formatPrice(remainingOf(pkg))}.`,
        });
      }
    }
    return issues;
  },
};
