import { DollarSign, Package, Scale } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { formatPrice } from '@/utils/formatters';

interface DashboardStatsProps {
  totalQuotes: number;
  totalVolume: number;
  totalRevenue: number;
  coefficient: number;
}

export function DashboardStats({
  totalQuotes,
  totalVolume,
  totalRevenue,
  coefficient,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="EXPÉDITIONS ENREGISTRÉES"
        value={totalQuotes.toString()}
        detail="Calculs archivés"
        icon={Package}
      />
      <StatCard
        label="VOLUME GLOBAL TRAITÉ"
        value={`${totalVolume.toFixed(2)} m³`}
        detail="Mètres cubes cumulés"
        icon={Scale}
      />
      <StatCard
        label="TARIF EN COURS"
        value={`${coefficient.toFixed(2)} F CFA`}
        detail="Par mètre cube (CBM)"
        icon={DollarSign}
      />
      <StatCard
        label="MONTANT ESTIMÉ CUMULÉ"
        value={formatPrice(totalRevenue)}
        detail="Total cotations"
        icon={DollarSign}
      />
    </div>
  );
}
