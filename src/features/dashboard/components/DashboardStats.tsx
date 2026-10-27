import { DollarSign, Package, Scale, Wallet } from 'lucide-react';
import type { DashboardSummary } from '@/api/endpoints/dashboard.api';
import { StatCard } from '@/components/ui/StatCard';
import { formatPrice } from '@/utils/formatters';

interface DashboardStatsProps {
  summary: DashboardSummary;
  /** Tarif maritime public ; absent tant qu'il n'est pas chargé. */
  seaRatePerCbm: number | undefined;
}

/**
 * Les quatre indicateurs du mois, calculés par le serveur. L'équipe voit le chiffre d'affaires ;
 * un collecteur voit sa propre marge.
 */
export function DashboardStats({ summary, seaRatePerCbm }: DashboardStatsProps) {
  const activity = summary.month_activity;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="COLIS DU MOIS"
        value={activity.packages.toString()}
        detail="Colis enregistrés, hors annulés"
        icon={Package}
      />
      <StatCard
        label="VOLUME DU MOIS"
        value={`${activity.volume_cbm.toFixed(2)} m³`}
        detail="Mètres cubes cumulés"
        icon={Scale}
      />
      <StatCard
        label="TARIF MARITIME EN COURS"
        value={seaRatePerCbm === undefined ? '...' : formatPrice(seaRatePerCbm)}
        detail="Par mètre cube (CBM)"
        icon={DollarSign}
      />
      {summary.finance ? (
        <StatCard
          label="CHIFFRE D’AFFAIRES DU MOIS"
          value={formatPrice(summary.finance.revenue)}
          detail={`Dont ${formatPrice(activity.collector_margin)} de marges collecteurs`}
          icon={DollarSign}
        />
      ) : (
        <StatCard
          label="MA MARGE DU MOIS"
          value={formatPrice(activity.collector_margin)}
          detail="Sur les colis que j’ai enregistrés"
          icon={Wallet}
        />
      )}
    </div>
  );
}
