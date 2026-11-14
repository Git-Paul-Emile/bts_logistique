export { formatDate, formatDateTime } from './formatDate';

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatVolume(cubicMeter: number): string {
  return `${cubicMeter.toFixed(3)} m³`;
}
