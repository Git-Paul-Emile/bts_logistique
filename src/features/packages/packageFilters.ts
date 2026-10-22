import type { Package } from '@/types';

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'registered', label: 'Enregistré' },
  { value: 'in_transit', label: 'En transit' },
  { value: 'arrived', label: 'Arrivé' },
  { value: 'delivered', label: 'Livré' },
  { value: 'on_hold', label: 'En attente douane' },
];

export const PAYMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les règlements' },
  { value: 'paid', label: 'Payé' },
  { value: 'partial', label: 'Partiel' },
  { value: 'unpaid', label: 'Non payé' },
];

export interface PackageFilters {
  search: string;
  status: string;
  payment: string;
}

/** Colis qui contiennent le texte cherché et correspondent aux deux filtres ('all' = tous). */
export function filterPackages(packages: Package[], filters: PackageFilters): Package[] {
  const query = filters.search.toLowerCase();
  return packages.filter((p) => {
    const matchSearch =
      p.tracking_number.toLowerCase().includes(query) ||
      (p.client_name && p.client_name.toLowerCase().includes(query)) ||
      p.origin.toLowerCase().includes(query) ||
      p.destination.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query));
    const matchStatus = filters.status === 'all' || p.status === filters.status;
    const matchPayment = filters.payment === 'all' || p.payment_status === filters.payment;
    return matchSearch && matchStatus && matchPayment;
  });
}
