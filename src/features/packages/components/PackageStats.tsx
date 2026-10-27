import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, Package as PackageIcon, Truck } from 'lucide-react';
import type { ActivePackageStatus } from '@/api/endpoints/dashboard.api';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
  valueClass: string;
}

function PackageStatCard({ label, value, icon: Icon, iconClass, valueClass }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-semibold uppercase">{label}</span>
        <Icon size={18} className={iconClass} />
      </div>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

/** Les quatre compteurs en tête de la liste des colis, calculés par le serveur. */
export function PackageStats({ inProgress }: { inProgress: Record<ActivePackageStatus, number> }) {
  const total = Object.values(inProgress).reduce((sum, count) => sum + count, 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <PackageStatCard
        label="Colis en cours"
        value={total}
        icon={PackageIcon}
        iconClass="text-[#003366]"
        valueClass="text-slate-800"
      />
      <PackageStatCard
        label="En Transit (Mer/Air)"
        value={inProgress.in_transit}
        icon={Truck}
        iconClass="text-amber-500"
        valueClass="text-amber-600"
      />
      <PackageStatCard
        label="Arrivés en Hub"
        value={inProgress.arrived}
        icon={CheckCircle}
        iconClass="text-emerald-500"
        valueClass="text-emerald-600"
      />
      <PackageStatCard
        label="En attente douane"
        value={inProgress.on_hold}
        icon={AlertTriangle}
        iconClass="text-rose-500"
        valueClass="text-rose-600"
      />
    </div>
  );
}
