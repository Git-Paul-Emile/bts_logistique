import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/endpoints/dashboard.api';
import { queryKeys } from '@/api/queryKeys';

/** Indicateurs du mois (AAAA-MM), ou du mois en cours. */
export function useDashboard(month?: string) {
  return useQuery({ queryKey: queryKeys.dashboard(month), queryFn: () => dashboardApi.get(month) });
}
