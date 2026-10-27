import { CreditCard, Eye, Printer, RefreshCw } from 'lucide-react';
import type { Package } from '@/types';
import { formatDate, formatPrice, formatVolume } from '@/utils/formatters';
import { PackageStatusBadge, PaymentStatusBadge } from './PackageBadges';

interface PackageRowActions {
  onSelect: (pkg: Package) => void;
  onChangeStatus: (pkg: Package) => void;
  onPrint: (pkg: Package) => void;
  /** Absent pour un collecteur : l'encaissement est réservé à l'équipe. */
  onRecordPayment?: (pkg: Package) => void;
}

interface PackagesTableProps extends PackageRowActions {
  packages: Package[];
}

/** Tableau des colis ; un clic sur la ligne ouvre la fiche, les icônes lancent une action. */
export function PackagesTable({ packages, ...actions }: PackagesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
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
          {packages.map((pkg) => (
            <PackageRow key={pkg.id} pkg={pkg} {...actions} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PackageRow({
  pkg,
  onSelect,
  onChangeStatus,
  onPrint,
  onRecordPayment,
}: PackageRowActions & { pkg: Package }) {
  return (
    <tr className="cursor-pointer transition hover:bg-slate-50/80" onClick={() => onSelect(pkg)}>
      <td className="px-5 py-4">
        <div className="font-mono font-bold text-[#003366]">{pkg.tracking_number}</div>
        <div className="mt-0.5 text-xs text-slate-400">{formatDate(pkg.created_at)}</div>
      </td>

      <td className="px-5 py-4">
        <div className="font-semibold text-slate-800">{pkg.client_name || 'Client comptoir'}</div>
        <div className="mt-0.5 text-xs text-slate-500">
          {pkg.origin} → <span className="font-medium text-slate-700">{pkg.destination}</span>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="font-medium text-slate-800">{formatVolume(pkg.cubic_meter)}</div>
        <div className="mt-0.5 text-xs text-slate-500">
          {pkg.length_cm}×{pkg.width_cm}×{pkg.height_cm} cm • {pkg.weight_kg} kg
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="font-bold text-slate-800">{formatPrice(pkg.final_price)}</div>
        <div className="mt-1">
          <PaymentStatusBadge status={pkg.payment_status} />
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <PackageStatusBadge status={pkg.status} />
        </div>
        {pkg.events && pkg.events.length > 0 && (
          <div className="mt-1 max-w-[200px] truncate text-[11px] text-slate-400">
            {pkg.events[0]?.location}
          </div>
        )}
      </td>

      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onSelect(pkg)}
            title="Voir la fiche détaillée"
            className="rounded-sm p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#003366]"
          >
            <Eye size={17} />
          </button>
          <button
            onClick={() => onChangeStatus(pkg)}
            title="Changer le statut"
            className="rounded-sm p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
          >
            <RefreshCw size={17} />
          </button>
          <button
            onClick={() => onPrint(pkg)}
            title="Imprimer l'étiquette & le reçu"
            className="rounded-sm p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Printer size={17} />
          </button>
          {onRecordPayment && pkg.payment_status !== 'paid' && pkg.status !== 'cancelled' && (
            <button
              onClick={() => onRecordPayment(pkg)}
              title="Encaisser un paiement"
              className="rounded-sm p-1.5 text-emerald-600 hover:bg-emerald-50"
            >
              <CreditCard size={17} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
