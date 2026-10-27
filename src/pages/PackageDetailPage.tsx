import { useState } from 'react';
import { ArrowLeft, CreditCard, Pencil, RefreshCw } from 'lucide-react';
import { EditPackageModal } from '@/components/common/EditPackageModal';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { PackageLabelModal } from '@/components/common/PackageLabelModal';
import { RecordPaymentModal } from '@/components/common/RecordPaymentModal';
import { TrackingShareActions } from '@/components/common/TrackingShareActions';
import { UpdateStatusModal } from '@/components/common/UpdateStatusModal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/useAuth';
import { canAccessView } from '@/features/auth/permissions';
import {
  PackageStatusBadge,
  PaymentStatusBadge,
} from '@/features/packages/components/PackageBadges';
import type { PackageDocument } from '@/features/packages/components/PackageDocumentsMenu';
import { PackageDocumentsMenu } from '@/features/packages/components/PackageDocumentsMenu';
import {
  PackageMeasuresCard,
  PackageShippingCard,
} from '@/features/packages/components/PackageInfoCards';
import { PackageTimeline } from '@/features/packages/components/PackageTimeline';
import { usePackage } from '@/features/packages/hooks/usePackages';
import { formatDate, formatPrice } from '@/utils/formatters';

interface PackageDetailPageProps {
  packageId: string | null;
  onBack: () => void;
}

export function PackageDetailPage({ packageId, onBack }: PackageDetailPageProps) {
  const { user } = useAuth();
  const packageQuery = usePackage(packageId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeLabelType, setActiveLabelType] = useState<PackageDocument | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const pkg = packageQuery.data;

  if (!packageId) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>Aucun colis sélectionné.</p>
        <Button onClick={onBack} className="mt-4">
          Retour à la liste des colis
        </Button>
      </div>
    );
  }
  if (packageQuery.isPending) return <Loader label="Chargement du colis..." />;
  if (!pkg) {
    return (
      <LoadError
        message="Ce colis n’a pas pu être chargé. Il n’existe plus, ou il n’appartient pas à votre agence."
        onRetry={() => void packageQuery.refetch()}
      />
    );
  }

  const remaining = Math.max(0, pkg.final_price - pkg.amount_paid);
  const canRecordPayment = Boolean(user && canAccessView(user.role, 'payments'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-slate-500 transition hover:text-slate-800"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-2xl font-extrabold text-[#002244]">
                {pkg.tracking_number}
              </h2>
              <PackageStatusBadge status={pkg.status} />
              <PaymentStatusBadge status={pkg.payment_status} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Enregistré le {formatDate(pkg.created_at)}, agence {pkg.agency_name}. Route :{' '}
              {pkg.origin} → {pkg.destination}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Pencil size={14} />}
            onClick={() => setShowEditModal(true)}
          >
            Modifier
          </Button>
          <PackageDocumentsMenu onOpen={setActiveLabelType} />
          <Button
            variant="secondary"
            onClick={() => setShowStatusModal(true)}
            className="inline-flex flex-row items-center gap-1.5 text-xs whitespace-nowrap text-white hover:text-white"
          >
            <RefreshCw size={15} /> <span>Changer statut</span>
          </Button>
          {canRecordPayment && remaining > 0 && pkg.status !== 'cancelled' && (
            <Button
              variant="primary"
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex flex-row items-center gap-1.5 bg-emerald-600 text-xs whitespace-nowrap text-white hover:bg-emerald-700"
            >
              <CreditCard size={15} /> <span>Encaisser ({formatPrice(remaining)})</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PackageShippingCard pkg={pkg} />
          <PackageMeasuresCard pkg={pkg} remaining={remaining} />
        </div>
        <div className="space-y-6">
          <TrackingShareActions pkg={pkg} />
          <PackageTimeline events={pkg.events} onAddStep={() => setShowStatusModal(true)} />
        </div>
      </div>

      <PackageLabelModal
        pkg={pkg}
        isOpen={Boolean(activeLabelType)}
        onClose={() => setActiveLabelType(null)}
        type={activeLabelType || 'label'}
      />
      {showStatusModal && (
        <UpdateStatusModal pkg={pkg} isOpen onClose={() => setShowStatusModal(false)} />
      )}
      {showEditModal && (
        <EditPackageModal pkg={pkg} isOpen onClose={() => setShowEditModal(false)} />
      )}
      {showPaymentModal && (
        <RecordPaymentModal pkg={pkg} isOpen onClose={() => setShowPaymentModal(false)} />
      )}
    </div>
  );
}
