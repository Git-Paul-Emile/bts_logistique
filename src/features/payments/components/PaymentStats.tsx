import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import type { DashboardSummary } from '@/api/endpoints/dashboard.api';
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

interface PaymentStatsProps {
  /** Chiffres calculés par le serveur pour le mois en cours. */
  finance: NonNullable<DashboardSummary['finance']>;
  /** Nombre de paiements enregistrés, annulations comprises. */
  transactionCount: number;
}

/** Les quatre indicateurs de caisse : encaissé, reste à recouvrer, facturé, transactions. */
export function PaymentStats({ finance, transactionCount }: PaymentStatsProps) {
  const recoveryRate =
    finance.revenue > 0 ? Math.round((finance.collected / finance.revenue) * 100) : 100;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <PaymentStatCard
        label="Encaissé ce mois"
        value={formatPrice(finance.collected)}
        hint={`Taux de recouvrement du mois : ${recoveryRate}%`}
        icon={CheckCircle}
        iconClass="text-emerald-500"
        valueClass="text-emerald-600"
      />
      <PaymentStatCard
        label="Reste à Recouvrer"
        value={formatPrice(finance.total_due)}
        hint={`${finance.debtor_count} client${finance.debtor_count > 1 ? 's' : ''} avec un impayé`}
        icon={AlertCircle}
        iconClass="text-amber-500"
        valueClass="text-amber-600"
      />
      <PaymentStatCard
        label="Chiffre d'Affaires du mois"
        value={formatPrice(finance.revenue)}
        hint="Prix des colis enregistrés ce mois"
        icon={TrendingUp}
        iconClass="text-[#003366]"
        valueClass="text-slate-800"
      />
      <PaymentStatCard
        label="Transactions"
        value={transactionCount}
        hint="Paiements enregistrés"
        icon={DollarSign}
        iconClass="text-indigo-500"
        valueClass="text-indigo-700"
      />
    </div>
  );
}
