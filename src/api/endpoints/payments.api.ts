import type { Payment } from '@/types';
import { reportError } from '@/lib/reportError';

const PAYMENTS_STORAGE_KEY = 'bts_payments_v1';

export const initialPayments: Payment[] = [
  {
    id: 'pay-1',
    client_id: 'cli-1',
    client_name: 'Électro Abidjan SARL (M. Koffi)',
    package_id: 'pkg-1',
    tracking_number: 'BTS-CI-2026-0089',
    amount: 200000,
    payment_method: 'mobile_money',
    reference: 'WAVE-CI-998124',
    notes: 'Acompte 50% au départ de Chine',
    created_at: '2026-10-10T11:00:00Z',
  },
  {
    id: 'pay-2',
    client_id: 'cli-2',
    client_name: 'Boutique Touba Textile (Mme Diop)',
    package_id: 'pkg-2',
    tracking_number: 'BTS-SN-2026-0042',
    amount: 154980,
    payment_method: 'cash',
    reference: 'REC-DKR-0042',
    notes: "Règlement total au retrait à l'entrepôt de Dakar",
    created_at: '2026-10-17T11:30:00Z',
  },
  {
    id: 'pay-3',
    client_id: 'cli-1',
    client_name: 'Électro Abidjan SARL (M. Koffi)',
    package_id: 'pkg-4',
    tracking_number: 'BTS-CI-2026-0094',
    amount: 364800,
    payment_method: 'transfer',
    reference: 'VIR-SGBCI-88410',
    notes: 'Solde complet réglé avant déchargement magasin',
    created_at: '2026-10-11T14:20:00Z',
  },
];

function loadStoredPayments(): Payment[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(initialPayments));
      return initialPayments;
    }
    return JSON.parse(raw);
  } catch (error) {
    reportError('payments.api : loadStoredPayments', error);
    return initialPayments;
  }
}

function savePaymentsToStorage(payments: Payment[]) {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    reportError('payments.api : savePaymentsToStorage', error);
  }
}

export const paymentsApi = {
  async getPayments(): Promise<Payment[]> {
    return loadStoredPayments();
  },

  async recordPayment(data: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const list = loadStoredPayments();
    const newPayment: Payment = {
      ...data,
      id: `pay-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
    };
    const nextList = [newPayment, ...list];
    savePaymentsToStorage(nextList);
    return newPayment;
  },
};
