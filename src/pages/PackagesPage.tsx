import { useState, useMemo } from 'react';
import type { Package, PaymentMethod, StatusUpdateHandler } from '@/types';
import { Button } from '@/components/ui/Button';
import { PackageLabelModal } from '@/components/common/PackageLabelModal';
import { UpdateStatusModal } from '@/components/common/UpdateStatusModal';
import { RecordPaymentModal } from '@/components/common/RecordPaymentModal';
import { Package as PackageIcon, Plus, Search } from 'lucide-react';
import { PackageStats } from '@/features/packages/components/PackageStats';
import { PackagesTable } from '@/features/packages/components/PackagesTable';
import {
  filterPackages,
  PAYMENT_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/features/packages/packageFilters';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import type {
  PackageImportItem,
  PackageImportPatch,
} from '@/features/import/definitions/packages.import';
import {
  packageImportContext,
  packagesImport,
} from '@/features/import/definitions/packages.import';
import type { Client, PricingGrid } from '@/types';
import type { ImportBatch } from '@/features/import/importTypes';

interface PackagesPageProps {
  packages: Package[];
  clients: Client[];
  rates: PricingGrid['rates'];
  onImportPackages: (batch: ImportBatch<PackageImportItem, PackageImportPatch>) => Promise<void>;
  onNavigateNew: () => void;
  onSelectPackage: (pkg: Package) => void;
  onUpdateStatus: StatusUpdateHandler;
  onRecordPayment: (
    pkgId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string
  ) => Promise<void>;
  loading?: boolean;
}

export function PackagesPage({
  packages,
  clients,
  rates,
  onImportPackages,
  onNavigateNew,
  onSelectPackage,
  onUpdateStatus,
  onRecordPayment,
  loading = false,
}: PackagesPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modals state
  const [activeLabelPkg, setActiveLabelPkg] = useState<Package | null>(null);
  const [activeStatusPkg, setActiveStatusPkg] = useState<Package | null>(null);
  const [activePaymentPkg, setActivePaymentPkg] = useState<Package | null>(null);

  const filtered = useMemo(
    () => filterPackages(packages, { search, status: statusFilter, payment: paymentFilter }),
    [packages, search, statusFilter, paymentFilter]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick stats */}
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
          <ImportExcelButton
            definition={packagesImport}
            getContext={() => packageImportContext(clients, rates, packages)}
            onImport={onImportPackages}
          />
          <Button
            onClick={onNavigateNew}
            className="inline-flex flex-row items-center gap-2 bg-[#003366] whitespace-nowrap text-white hover:bg-[#002244]"
          >
            <Plus size={18} className="shrink-0" />
            <span>Enregistrer un colis</span>
          </Button>
        </div>
      </div>

      <PackageStats packages={packages} />

      {/* Filters & Search Bar */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
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
              placeholder="Rechercher par N° de suivi (BTS-...), client, origine, destination..."
              className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48">
              <SearchableSelect
                size="sm"
                aria-label="Filtrer par statut"
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_FILTER_OPTIONS}
              />
            </div>

            <div className="w-48">
              <SearchableSelect
                size="sm"
                aria-label="Filtrer par règlement"
                value={paymentFilter}
                onChange={setPaymentFilter}
                options={PAYMENT_FILTER_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement des colis...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <PackageIcon size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Aucun colis trouvé</p>
            <p className="mt-1 text-xs text-slate-400">
              Modifiez vos critères de recherche ou enregistrez un nouveau colis.
            </p>
          </div>
        ) : (
          <PackagesTable
            packages={filtered}
            onSelect={onSelectPackage}
            onChangeStatus={setActiveStatusPkg}
            onPrint={setActiveLabelPkg}
            onRecordPayment={setActivePaymentPkg}
          />
        )}
      </div>

      {/* Modals */}
      <PackageLabelModal
        pkg={activeLabelPkg}
        isOpen={Boolean(activeLabelPkg)}
        onClose={() => setActiveLabelPkg(null)}
      />

      <UpdateStatusModal
        pkg={activeStatusPkg}
        isOpen={Boolean(activeStatusPkg)}
        onClose={() => setActiveStatusPkg(null)}
        onUpdate={onUpdateStatus}
      />

      <RecordPaymentModal
        pkg={activePaymentPkg}
        isOpen={Boolean(activePaymentPkg)}
        onClose={() => setActivePaymentPkg(null)}
        onRecord={onRecordPayment}
      />
    </div>
  );
}
