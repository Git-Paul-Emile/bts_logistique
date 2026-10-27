import { useQuery } from '@tanstack/react-query';
import { trackingApi } from '@/api/endpoints/tracking.api';
import { queryKeys } from '@/api/queryKeys';
import type { PackageStatus } from '@/types';

const STEP_BY_STATUS: Partial<Record<PackageStatus, number>> = {
  registered: 1,
  in_transit: 2,
  on_hold: 2,
  arrived: 3,
  delivered: 4,
};

export function getTrackingStep(status: PackageStatus): number {
  return STEP_BY_STATUS[status] ?? 1;
}

/** Recherche publique du colis correspondant au numéro présent dans l'URL. */
export function usePackageTracking(trackingNumber: string | undefined) {
  const normalized = trackingNumber?.trim().toUpperCase() ?? '';
  const query = useQuery({
    queryKey: queryKeys.tracking(normalized),
    queryFn: () => trackingApi.find(normalized),
    enabled: Boolean(normalized),
  });
  return {
    loading: Boolean(normalized) && query.isPending,
    pkg: query.data ?? null,
    error: query.isError,
  };
}
