// Indicateurs du tableau de bord, calculés par le serveur selon le rôle de la personne connectée.
import { getData, http } from '@/api/client';
import type { PackageStatus } from '@/types';

export type ActivePackageStatus = Extract<
  PackageStatus,
  'registered' | 'in_transit' | 'arrived' | 'on_hold'
>;

export interface DashboardSummary {
  /** Mois des indicateurs, AAAA-MM. */
  month: string;
  packages_in_progress: Record<ActivePackageStatus, number>;
  month_activity: {
    packages: number;
    volume_cbm: number;
    /** Collecteur : sa marge du mois. Équipe : total des marges dues aux collecteurs. */
    collector_margin: number;
  };
  /** Réservé à l'équipe ; null pour un collecteur. */
  finance: {
    revenue: number;
    collected: number;
    total_due: number;
    debtor_count: number;
    shipments_under_way: number;
  } | null;
}

export const dashboardApi = {
  async get(month?: string): Promise<DashboardSummary> {
    return getData(http.get('/dashboard', { params: { month } }));
  },
};
