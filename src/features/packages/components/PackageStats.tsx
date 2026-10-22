import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, Package as PackageIcon, Truck } from 'lucide-react';
import type { Package } from '@/types';

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

/** Les quatre compteurs en tête de la liste des colis. */
export function PackageStats({ packages }: { packages: Package[] }) {
  const stats = useMemo(
    () => ({
      total: packages.length,
      inTransit: packages.filter((p) => p.status === 'in_transit').length,
      arrived: packages.filter((p) => p.status === 'arrived').length,
      unpaid: packages.filter(
        (p) => p.payment_status === 'unpaid' || p.payment_status === 'partial'
      ).length,
    }),
    [packages]
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <PackageStatCard
        label="Total Colis"
        value={stats.total}
        icon={PackageIcon}
        iconClass="text-[#003366]"
        valueClass="text-slate-800"
      />
      <PackageStatCard
        label="En Transit (Mer/Air)"
        value={stats.inTransit}
        icon={Truck}
        iconClass="text-amber-500"
        valueClass="text-amber-600"
      />
      <PackageStatCard
        label="Arrivés en Hub"
        value={stats.arrived}
        icon={CheckCircle}
        iconClass="text-emerald-500"
        valueClass="text-emerald-600"
      />
      <PackageStatCard
        label="Paiements en attente"
        value={stats.unpaid}
        icon={AlertTriangle}
        iconClass="text-rose-500"
        valueClass="text-rose-600"
      />
    </div>
  );
}
