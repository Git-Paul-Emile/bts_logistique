import { useState } from 'react';
import type { PricingGrid, TransportMode } from '@/types';

const CUBIC_CM_PER_CUBIC_METER = 1_000_000;
const MIN_CUBIC_METER = 0.001;

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export function usePriceEstimate(rates: PricingGrid['rates']) {
  const [dimensions, setDimensions] = useState<Dimensions>({ length: 80, width: 60, height: 50 });
  const [mode, setMode] = useState<TransportMode>('sea');

  const rawVolume =
    (dimensions.length * dimensions.width * dimensions.height) / CUBIC_CM_PER_CUBIC_METER;
  const cubicMeter = Math.max(MIN_CUBIC_METER, Number(rawVolume.toFixed(4)));
  const priceXof = Math.round(cubicMeter * rates[mode].client_rate_per_cbm);

  const updateDimension = (key: keyof Dimensions, value: number) => {
    setDimensions((previous) => ({ ...previous, [key]: Math.max(0, value) }));
  };

  return { dimensions, updateDimension, mode, setMode, cubicMeter, priceXof };
}
