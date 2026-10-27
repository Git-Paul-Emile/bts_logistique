import type { SelectOption } from '@/components/ui/SearchableSelect';
import type { PackageStatus, PaymentStatus } from '@/types';
import { PACKAGE_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';
import { labelsToOptions } from '@/utils/selectOptions';

export type StatusFilter = 'all' | PackageStatus;
export type PaymentFilter = 'all' | PaymentStatus;

export const STATUS_FILTER_OPTIONS: SelectOption<StatusFilter>[] = [
  { value: 'all', label: 'Tous les statuts' },
  ...labelsToOptions(PACKAGE_STATUS_LABELS),
];

export const PAYMENT_FILTER_OPTIONS: SelectOption<PaymentFilter>[] = [
  { value: 'all', label: 'Tous les règlements' },
  ...labelsToOptions(PAYMENT_STATUS_LABELS),
];
