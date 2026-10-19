export { formatDate, formatDateTime } from './formatDate';

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))} F CFA`;
}

export function formatVolume(cubicMeter: number): string {
  return `${cubicMeter.toFixed(3)} m³`;
}
