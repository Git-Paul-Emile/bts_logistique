import { useEffect, useState } from 'react';
import type { Package, PackageStatus } from '@/types';
import { packagesApi } from '@/api/endpoints/packages.api';

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

interface TrackingLookup {
  loading: boolean;
  pkg: Package | null;
  error: boolean;
}

interface TrackingResult {
  trackingNumber: string;
  pkg: Package | null;
  error: boolean;
}

/** Recherche le colis correspondant au numéro présent dans l'URL. */
export function usePackageTracking(trackingNumber: string | undefined): TrackingLookup {
  const [result, setResult] = useState<TrackingResult | null>(null);

  useEffect(() => {
    if (!trackingNumber) return;
    let cancelled = false;
    packagesApi
      .getPackageByTracking(trackingNumber)
      .then((pkg) => {
        if (!cancelled) setResult({ trackingNumber, pkg, error: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ trackingNumber, pkg: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [trackingNumber]);

  if (!trackingNumber) return { loading: false, pkg: null, error: false };
  if (result?.trackingNumber !== trackingNumber) return { loading: true, pkg: null, error: false };
  return { loading: false, pkg: result.pkg, error: result.error };
}
