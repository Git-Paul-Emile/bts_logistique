import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import type { Package, Payment } from '@/types';
import { formatPrice } from '@/utils/formatters';

interface PaymentStatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  iconClass: string;
  valueClass: string;
}

function PaymentStatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  valueClass,
}: PaymentStatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
        <span>{label}</span>
        <Icon size={18} className={iconClass} />
      </div>
      <p className={`mt-2 text-xl font-extrabold ${valueClass}`}>{value}</p>
      <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
    </div>
  );
}

/** Les quatre indicateurs de caisse : encaissé, reste à recouvrer, facturé, transactions. */
export function PaymentStats({ packages, payments }: { packages: Package[]; payments: Payment[] }) {
  const stats = useMemo(() => {
    const totalBilled = packages.reduce((acc, p) => acc + p.final_price, 0);
    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
    const pendingRecovery = Math.max(0, totalBilled - totalCollected);
    const recoveryRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;
    return { totalBilled, totalCollected, pendingRecovery, recoveryRate };
  }, [packages, payments]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <PaymentStatCard
        label="Total Encaissé"
        value={formatPrice(stats.totalCollected)}
        hint={`Taux de recouvrement : ${stats.recoveryRate}%`}
        icon={CheckCircle}
        iconClass="text-emerald-500"
        valueClass="text-emerald-600"
      />
      <PaymentStatCard
        label="Reste à Recouvrer"
        value={formatPrice(stats.pendingRecovery)}
        hint="Créances clients en cours"
        icon={AlertCircle}
        iconClass="text-amber-500"
        valueClass="text-amber-600"
      />
      <PaymentStatCard
        label="Chiffre d'Affaires"
        value={formatPrice(stats.totalBilled)}
        hint="Volume facturé cumulé"
        icon={TrendingUp}
        iconClass="text-[#003366]"
        valueClass="text-slate-800"
      />
      <PaymentStatCard
        label="Transactions"
        value={payments.length}
        hint="Reçus délivrés"
        icon={DollarSign}
        iconClass="text-indigo-500"
        valueClass="text-indigo-700"
      />
    </div>
  );
}
