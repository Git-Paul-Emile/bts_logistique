import { useEffect, useState } from 'react';
import { Package, PackageStatus } from '@/types';
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

/** Recherche le colis correspondant au numéro présent dans l'URL. */
export function usePackageTracking(trackingNumber: string | undefined) {
  const [lookup, setLookup] = useState<TrackingLookup>({ loading: false, pkg: null, error: false });

  useEffect(() => {
    if (!trackingNumber) return;
    let cancelled = false;
    setLookup({ loading: true, pkg: null, error: false });
    packagesApi
      .getPackageByTracking(trackingNumber)
      .then((pkg) => {
        if (!cancelled) setLookup({ loading: false, pkg, error: false });
      })
      .catch(() => {
        if (!cancelled) setLookup({ loading: false, pkg: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [trackingNumber]);

  return lookup;
}
