import { useState, useMemo } from 'react';
import { Package, PackageStatus, PaymentStatus, PACKAGE_STATUS_LABELS, PAYMENT_STATUS_LABELS, StatusUpdateHandler } from '@/types';
import { formatPrice, formatVolume, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PackageLabelModal } from '@/components/common/PackageLabelModal';
import { UpdateStatusModal } from '@/components/common/UpdateStatusModal';
import { RecordPaymentModal } from '@/components/common/RecordPaymentModal';
import {
  Package as PackageIcon,
  Search,
  Plus,
  Eye,
  RefreshCw,
  Printer,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface PackagesPageProps {
  packages: Package[];
  onNavigateNew: () => void;
  onSelectPackage: (pkg: Package) => void;
  onUpdateStatus: StatusUpdateHandler;
  onRecordPayment: (
    pkgId: string,
    amount: number,
    method: 'cash' | 'transfer' | 'mobile_money' | 'other',
    reference?: string
  ) => Promise<void>;
  loading?: boolean;
}

export function PackagesPage({
  packages,
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

  // Filtered packages
  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const matchSearch =
        p.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
        (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase())) ||
        p.origin.toLowerCase().includes(search.toLowerCase()) ||
        p.destination.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || p.payment_status === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [packages, search, statusFilter, paymentFilter]);

  // KPIs
  const stats = useMemo(() => {
    return {
      total: packages.length,
      inTransit: packages.filter((p) => p.status === 'in_transit').length,
      arrived: packages.filter((p) => p.status === 'arrived').length,
      unpaid: packages.filter((p) => p.payment_status === 'unpaid' || p.payment_status === 'partial').length,
    };
  }, [packages]);

  const getStatusBadge = (status: PackageStatus) => {
    switch (status) {
      case 'registered':
        return <Badge variant="info">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'in_transit':
        return <Badge variant="warning">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'arrived':
        return <Badge variant="success">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'delivered':
        return <Badge variant="muted">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'on_hold':
        return <Badge variant="danger">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      default:
        return <Badge variant="default">{PACKAGE_STATUS_LABELS[status]}</Badge>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">{PAYMENT_STATUS_LABELS[status]}</Badge>;
      case 'partial':
        return <Badge variant="warning">{PAYMENT_STATUS_LABELS[status]}</Badge>;
      case 'unpaid':
        return <Badge variant="danger">{PAYMENT_STATUS_LABELS[status]}</Badge>;
    }
  };

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
        <Button
          onClick={onNavigateNew}
          className="inline-flex flex-row items-center whitespace-nowrap gap-2 bg-[#003366] text-white hover:bg-[#002244]"
        >
          <Plus size={18} className="shrink-0" />
          <span>Enregistrer un colis</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Colis</span>
            <PackageIcon size={18} className="text-[#003366]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">En Transit (Mer/Air)</span>
            <Truck size={18} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.inTransit}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Arrivés en Hub</span>
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.arrived}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Paiements en attente</span>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600">{stats.unpaid}</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par N° de suivi (BTS-...), client, origine, destination..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-[#003366] focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="registered">Enregistré</option>
              <option value="in_transit">En transit</option>
              <option value="arrived">Arrivé</option>
              <option value="delivered">Livré</option>
              <option value="on_hold">En attente douane</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-[#003366] focus:outline-none"
            >
              <option value="all">Tous les règlements</option>
              <option value="paid">Payé</option>
              <option value="partial">Partiel</option>
              <option value="unpaid">Non payé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement des colis...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <PackageIcon size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Aucun colis trouvé</p>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez vos critères de recherche ou enregistrez un nouveau colis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">N° Suivi & Date</th>
                  <th className="px-5 py-3.5">Client & Route</th>
                  <th className="px-5 py-3.5">Dimensions & Volume</th>
                  <th className="px-5 py-3.5">Montant (F CFA)</th>
                  <th className="px-5 py-3.5">Statut Opérationnel</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="transition hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => onSelectPackage(pkg)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-[#003366]">
                        {pkg.tracking_number}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {formatDate(pkg.created_at)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {pkg.client_name || 'Client comptoir'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {pkg.origin} → <span className="font-medium text-slate-700">{pkg.destination}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {formatVolume(pkg.cubic_meter)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {pkg.length_cm}×{pkg.width_cm}×{pkg.height_cm} cm • {pkg.weight_kg} kg
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">
                        {formatPrice(pkg.final_price)}
                      </div>
                      <div className="mt-1">{getPaymentBadge(pkg.payment_status)}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div>{getStatusBadge(pkg.status)}</div>
                      {pkg.events && pkg.events.length > 0 && (
                        <div className="mt-1 text-[11px] text-slate-400 truncate max-w-[200px]">
                          {pkg.events[0].location}
                        </div>
                      )}
                    </td>

                    <td
                      className="px-5 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectPackage(pkg)}
                          title="Voir la fiche détaillée"
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#003366]"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => setActiveStatusPkg(pkg)}
                          title="Changer le statut"
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                        >
                          <RefreshCw size={17} />
                        </button>

                        <button
                          onClick={() => setActiveLabelPkg(pkg)}
                          title="Imprimer l'étiquette & le reçu"
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Printer size={17} />
                        </button>

                        {pkg.payment_status !== 'paid' && (
                          <button
                            onClick={() => setActivePaymentPkg(pkg)}
                            title="Encaisser un paiement"
                            className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CreditCard size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
