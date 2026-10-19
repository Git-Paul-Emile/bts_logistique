import { useCallback, useEffect, useState } from 'react';
import { PricingGrid } from '@/types';
import { DEFAULT_PRICING_GRID, pricingApi } from '@/api/endpoints/pricing.api';

export function usePricingGrid() {
  const [grid, setGrid] = useState<PricingGrid>(DEFAULT_PRICING_GRID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    pricingApi
      .getPricingGrid()
      .then((loaded) => {
        if (!cancelled) setGrid(loaded);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveRates = useCallback(async (rates: PricingGrid['rates']) => {
    const saved = await pricingApi.updatePricingGrid(rates);
    setGrid(saved);
    return saved;
  }, []);

  return { grid, loading, saveRates };
}
