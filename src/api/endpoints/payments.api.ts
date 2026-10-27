// Paiements : appels à /payments. Un versement est réparti sur un ou plusieurs colis du client.
import { getData, getPage, http, type Page } from '@/api/client';
import type { Payment, PaymentAllocation, PaymentMethod } from '@/types';

interface PaymentDto {
  id: string;
  client: { id: string; name: string };
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  author: { id: string; name: string };
  allocations: PaymentAllocation[];
  reverses_payment_id: string | null;
  reversed_by_payment_id: string | null;
  created_at: string;
}

function toPayment(dto: PaymentDto): Payment {
  const first = dto.allocations[0];
  return {
    id: dto.id,
    client_id: dto.client.id,
    client_name: dto.client.name,
    package_id: first?.package_id,
    tracking_number: first?.tracking_number,
    allocations: dto.allocations,
    amount: dto.amount,
    payment_method: dto.method,
    reference: dto.reference ?? undefined,
    notes: dto.notes ?? undefined,
    author_name: dto.author.name,
    reverses_payment_id: dto.reverses_payment_id ?? undefined,
    reversed_by_payment_id: dto.reversed_by_payment_id ?? undefined,
    created_at: dto.created_at,
  };
}

export type PaymentSort = 'created_at' | '-created_at' | 'amount' | '-amount';

export interface PaymentListParams {
  page?: number;
  limit?: number;
  search?: string;
  method?: PaymentMethod;
  client_id?: string;
  /** Période, dates incluses, au format AAAA-MM-JJ. */
  from?: string;
  to?: string;
  sort?: PaymentSort;
}

export interface NewPaymentInput {
  client_id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  /** Part de chaque colis réglé ; leur somme est égale au montant. */
  allocations: { package_id: string; amount: number }[];
}

export const paymentsApi = {
  async list(params: PaymentListParams): Promise<Page<Payment>> {
    const page = await getPage<PaymentDto>(http.get('/payments', { params }));
    return { items: page.items.map(toPayment), meta: page.meta };
  },

  async record(input: NewPaymentInput): Promise<Payment> {
    return toPayment(await getData<PaymentDto>(http.post('/payments', input)));
  },

  /** Annulation : une écriture négative, le paiement d'origine reste dans l'historique. */
  async reverse(id: string, reason: string): Promise<Payment> {
    return toPayment(await getData<PaymentDto>(http.post(`/payments/${id}/reversal`, { reason })));
  },
};
