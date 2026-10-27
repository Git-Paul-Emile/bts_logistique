import { useState } from 'react';
import { Package as PackageIcon, Plus, Search } from 'lucide-react';
import type { Package } from '@/types';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { LoadError } from '@/components/common/LoadError';
import { PackageLabelModal } from '@/components/common/PackageLabelModal';
import { RecordPaymentModal } from '@/components/common/RecordPaymentModal';
import { UpdateStatusModal } from '@/components/common/UpdateStatusModal';
import { useAuth } from '@/context/useAuth';
import { canAccessView, canImport } from '@/features/auth/permissions';
import { useBackOfficeNavigation } from '@/features/backoffice/NavigationContext';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import { packagesImport } from '@/features/import/definitions/packages.import';
import { loadPackageImportContext } from '@/features/import/importContexts';
import { useImportHandlers } from '@/features/import/useImportHandlers';
import { PackageStats } from '@/features/packages/components/PackageStats';
import { PackagesTable } from '@/features/packages/components/PackagesTable';
import { usePackageList } from '@/features/packages/hooks/usePackages';
import type { PaymentFilter, StatusFilter } from '@/features/packages/packageFilters';
import { PAYMENT_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '@/features/packages/packageFilters';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 25;

export function PackagesPage() {
  const { user } = useAuth();
  const { navigate, openPackage } = useBackOfficeNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim());
  const packages = usePackageList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    payment_status: paymentFilter === 'all' ? undefined : paymentFilter,
  });
  const dashboard = useDashboard();
  const { importPackages } = useImportHandlers();

  const [activeLabelPkg, setActiveLabelPkg] = useState<Package | null>(null);
  const [activeStatusPkg, setActiveStatusPkg] = useState<Package | null>(null);
  const [activePaymentPkg, setActivePaymentPkg] = useState<Package | null>(null);
  const canImportFiles = Boolean(user && canImport(user.role));
  const canRecordPayment = Boolean(user && canAccessView(user.role, 'payments'));

  // Tout changement de filtre ramène à la première page.
  const filterChange =
    <Value,>(setter: (value: Value) => void) =>
    (value: Value) => {
      setter(value);
      setPage(1);
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
            Gestion des Colis & Expéditions
          </h2>
          <p className="text-sm text-slate-500">
            Suivi opérationnel, groupage et traçabilité internationale en temps réel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canImportFiles && (
            <ImportExcelButton
              definition={packagesImport}
              getContext={loadPackageImportContext}
              onImport={importPackages}
            />
          )}
          <Button
            onClick={() => navigate('package-new')}
            className="inline-flex flex-row items-center gap-2 bg-[#003366] whitespace-nowrap text-white hover:bg-[#002244]"
          >
            <Plus size={18} className="shrink-0" />
            <span>Enregistrer un colis</span>
          </Button>
        </div>
      </div>

      {dashboard.data && <PackageStats inProgress={dashboard.data.packages_in_progress} />}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <label htmlFor="package-search" className="sr-only">
              Rechercher un colis
            </label>
            <Search
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              id="package-search"
              type="search"
              value={search}
              onChange={(e) => filterChange(setSearch)(e.target.value)}
              placeholder="Rechercher par N° de suivi (BTS-...), client, description..."
              className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-hidden"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48">
              <SearchableSelect<StatusFilter>
                size="sm"
                aria-label="Filtrer par statut"
                value={statusFilter}
                onChange={filterChange(setStatusFilter)}
                options={STATUS_FILTER_OPTIONS}
              />
            </div>
            <div className="w-48">
              <SearchableSelect<PaymentFilter>
                size="sm"
                aria-label="Filtrer par règlement"
                value={paymentFilter}
                onChange={filterChange(setPaymentFilter)}
                options={PAYMENT_FILTER_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {packages.isPending && (
          <div className="p-12 text-center text-slate-500">Chargement des colis...</div>
        )}
        {packages.isError && (
          <LoadError
            message="Les colis n’ont pas pu être chargés."
            onRetry={() => void packages.refetch()}
          />
        )}
        {packages.data?.items.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <PackageIcon size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Aucun colis trouvé</p>
            <p className="mt-1 text-xs text-slate-400">
              Modifiez vos critères de recherche ou enregistrez un nouveau colis.
            </p>
          </div>
        )}
        {packages.data && packages.data.items.length > 0 && (
          <PackagesTable
            packages={packages.data.items}
            onSelect={(pkg) => openPackage(pkg.id)}
            onChangeStatus={setActiveStatusPkg}
            onPrint={setActiveLabelPkg}
            onRecordPayment={canRecordPayment ? setActivePaymentPkg : undefined}
          />
        )}
      </div>

      <Pagination meta={packages.data?.meta} onPageChange={setPage} itemLabel="colis" />

      <PackageLabelModal
        pkg={activeLabelPkg}
        isOpen={Boolean(activeLabelPkg)}
        onClose={() => setActiveLabelPkg(null)}
      />
      {activeStatusPkg && (
        <UpdateStatusModal pkg={activeStatusPkg} isOpen onClose={() => setActiveStatusPkg(null)} />
      )}
      {activePaymentPkg && (
        <RecordPaymentModal
          pkg={activePaymentPkg}
          isOpen
          onClose={() => setActivePaymentPkg(null)}
        />
      )}
    </div>
  );
}
