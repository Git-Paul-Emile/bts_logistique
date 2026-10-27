import { useState } from 'react';
import { Search, Wallet } from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { Pagination } from '@/components/ui/Pagination';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import { paymentsImport } from '@/features/import/definitions/payments.import';
import { loadPaymentImportContext } from '@/features/import/importContexts';
import { useImportHandlers } from '@/features/import/useImportHandlers';
import { PaymentReceiptModal } from '@/features/payments/components/PaymentReceiptModal';
import { PaymentStats } from '@/features/payments/components/PaymentStats';
import { PaymentsTable } from '@/features/payments/components/PaymentsTable';
import { usePaymentList } from '@/features/payments/hooks/usePayments';
import { useDebounce } from '@/hooks/useDebounce';
import type { Payment, PaymentMethod } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { labelsToOptions } from '@/utils/selectOptions';

const PAGE_SIZE = 25;

type MethodFilter = 'all' | PaymentMethod;

const METHOD_FILTER_OPTIONS = [
  { value: 'all' as const, label: 'Tous les modes' },
  ...labelsToOptions(PAYMENT_METHOD_LABELS),
];

export function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');
  const [page, setPage] = useState(1);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const debouncedSearch = useDebounce(search.trim());
  const payments = usePaymentList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    method: methodFilter === 'all' ? undefined : methodFilter,
  });
  const dashboard = useDashboard();
  const { importPayments } = useImportHandlers();

  return (
    <div className="space-y-6">
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
          getContext={loadPaymentImportContext}
          onImport={importPayments}
        />
      </div>

      {dashboard.data?.finance && (
        <PaymentStats
          finance={dashboard.data.finance}
          transactionCount={payments.data?.meta.total ?? 0}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <label htmlFor="payment-search" className="sr-only">
              Rechercher un paiement
            </label>
            <Search
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              id="payment-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher par référence, N° de suivi, client..."
              className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:border-[#003366] focus:outline-hidden"
            />
          </div>
          <div className="w-full md:w-56">
            <SearchableSelect<MethodFilter>
              size="sm"
              aria-label="Filtrer par mode de règlement"
              value={methodFilter}
              onChange={(value) => {
                setMethodFilter(value);
                setPage(1);
              }}
              options={METHOD_FILTER_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {payments.isPending && <Loader label="Chargement des paiements..." />}
        {payments.isError && (
          <LoadError
            message="Les paiements n’ont pas pu être chargés."
            onRetry={() => void payments.refetch()}
          />
        )}
        {payments.data?.items.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Wallet size={36} aria-hidden="true" className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Aucun paiement trouvé</p>
          </div>
        )}
        {payments.data && payments.data.items.length > 0 && (
          <PaymentsTable payments={payments.data.items} onPrintReceipt={setReceiptPayment} />
        )}
      </div>

      <Pagination meta={payments.data?.meta} onPageChange={setPage} itemLabel="paiements" />

      {receiptPayment && (
        <PaymentReceiptModal payment={receiptPayment} onClose={() => setReceiptPayment(null)} />
      )}
    </div>
  );
}
