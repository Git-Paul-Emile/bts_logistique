export const CUBIC_CM_PER_CUBIC_METER = 1_000_000;
const MIN_CUBIC_METER = 0.001;
const VOLUME_DECIMALS = 4;

export function computeCubicMeter(lengthCm: number, widthCm: number, heightCm: number): number {
  const volume = (lengthCm * widthCm * heightCm) / CUBIC_CM_PER_CUBIC_METER;
  return Math.max(MIN_CUBIC_METER, Number(volume.toFixed(VOLUME_DECIMALS)));
}

export function computePrice(cubicMeter: number, ratePerCbm: number): number {
  return Math.round(cubicMeter * ratePerCbm);
}
