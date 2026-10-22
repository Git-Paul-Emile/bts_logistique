import type { BadgeVariant } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import type { PackageStatus, PaymentStatus } from '@/types';
import { PACKAGE_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';

const STATUS_VARIANTS: Record<PackageStatus, BadgeVariant> = {
  registered: 'info',
  in_transit: 'warning',
  arrived: 'success',
  delivered: 'muted',
  on_hold: 'danger',
  returned: 'default',
  cancelled: 'default',
};

const PAYMENT_VARIANTS: Record<PaymentStatus, BadgeVariant> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

export function PackageStatusBadge({ status }: { status: PackageStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{PACKAGE_STATUS_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={PAYMENT_VARIANTS[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
