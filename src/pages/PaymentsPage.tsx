import { useState, useMemo } from 'react';
import type { Payment, Package, PaymentMethod } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { PaymentReceiptModal } from '@/features/payments/components/PaymentReceiptModal';
import { Printer, Search } from 'lucide-react';
import { PaymentStats } from '@/features/payments/components/PaymentStats';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import type { PaymentImportItem } from '@/features/import/definitions/payments.import';
import {
  paymentImportContext,
  paymentsImport,
} from '@/features/import/definitions/payments.import';
import type { ImportBatch } from '@/features/import/importTypes';

const METHOD_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les modes' },
  { value: 'mobile_money', label: 'Mobile Money (Wave/Orange)' },
  { value: 'cash', label: 'Espèces' },
  { value: 'transfer', label: 'Virement bancaire' },
];

interface PaymentsPageProps {
  payments: Payment[];
  packages: Package[];
  onRecordPayment: (
    pkgId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string
  ) => Promise<void>;
  onImportPayments: (batch: ImportBatch<PaymentImportItem, never>) => Promise<void>;
}

export function PaymentsPage({ payments, packages, onImportPayments }: PaymentsPageProps) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase())) ||
        (p.tracking_number && p.tracking_number.toLowerCase().includes(search.toLowerCase())) ||
        (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

      const matchMethod = methodFilter === 'all' || p.payment_method === methodFilter;

      return matchSearch && matchMethod;
    });
  }, [payments, search, methodFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
            Gestion des Règlements & Caisse
          </h2>
          <p className="text-sm text-slate-500">
            Journal des encaissements, suivi des impayés et émission des reçus officiels BTS.
          </p>
        </div>
        <ImportExcelButton
          definition={paymentsImport}
          getContext={() => paymentImportContext(packages)}
          onImport={onImportPayments}
        />
      </div>

      <PaymentStats packages={packages} payments={payments} />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par référence, N° de suivi, client..."
              className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:border-[#003366] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-56">
              <SearchableSelect
                size="sm"
                aria-label="Filtrer par mode de règlement"
                value={methodFilter}
                onChange={setMethodFilter}
                options={METHOD_FILTER_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3.5">Date & Heure</th>
                <th className="px-5 py-3.5">Référence / Reçu</th>
                <th className="px-5 py-3.5">Client & Colis</th>
                <th className="px-5 py-3.5">Mode de Paiement</th>
                <th className="px-5 py-3.5 text-right">Montant Encaissé</th>
                <th className="px-5 py-3.5 text-center">Bordereau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {formatDateTime(p.created_at)}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">
                    {p.reference || p.id}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-slate-800">
                      {p.client_name || 'Client comptoir'}
                    </p>
                    {p.tracking_number && (
                      <p className="font-mono text-[11px] text-[#003366]">{p.tracking_number}</p>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium">
                      {PAYMENT_METHOD_LABELS[p.payment_method]}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right text-sm font-extrabold text-emerald-600">
                    {formatPrice(p.amount)}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedReceiptPayment(p)}
                      title="Imprimer le reçu de paiement"
                      className="rounded-sm p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReceiptPayment && (
        <PaymentReceiptModal
          payment={selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}
    </div>
  );
}
