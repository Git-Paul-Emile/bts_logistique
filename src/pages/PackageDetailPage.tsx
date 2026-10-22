import { useState } from 'react';
import { ArrowLeft, CreditCard, Pencil, RefreshCw } from 'lucide-react';
import { EditPackageModal } from '@/components/common/EditPackageModal';
import { PackageLabelModal } from '@/components/common/PackageLabelModal';
import { RecordPaymentModal } from '@/components/common/RecordPaymentModal';
import { TrackingShareActions } from '@/components/common/TrackingShareActions';
import { UpdateStatusModal } from '@/components/common/UpdateStatusModal';
import { Button } from '@/components/ui/Button';
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
import type { Package, PackageUpdateInput, PaymentMethod, StatusUpdateHandler } from '@/types';
import { formatDate, formatPrice } from '@/utils/formatters';

interface PackageDetailPageProps {
  pkg: Package | null;
  onBack: () => void;
  onUpdateStatus: StatusUpdateHandler;
  onUpdatePackage: (id: string, changes: PackageUpdateInput) => Promise<void>;
  onSendTracking: (pkg: Package) => Promise<void>;
  onNotify: (message: string) => void;
  onRecordPayment: (
    pkgId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string
  ) => Promise<void>;
}

export function PackageDetailPage({
  pkg,
  onBack,
  onUpdateStatus,
  onUpdatePackage,
  onSendTracking,
  onNotify,
  onRecordPayment,
}: PackageDetailPageProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeLabelType, setActiveLabelType] = useState<PackageDocument | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!pkg) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>Aucun colis sélectionné.</p>
        <Button onClick={onBack} className="mt-4">
          Retour à la liste des colis
        </Button>
      </div>
    );
  }

  const remaining = Math.max(0, pkg.final_price - (pkg.amount_paid || 0));

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
              Enregistré le {formatDate(pkg.created_at)} • Route : {pkg.origin} → {pkg.destination}
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
          {remaining > 0 && (
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
          <TrackingShareActions pkg={pkg} onSend={onSendTracking} onNotify={onNotify} />
          <PackageTimeline events={pkg.events} onAddStep={() => setShowStatusModal(true)} />
        </div>
      </div>

      <PackageLabelModal
        pkg={pkg}
        isOpen={Boolean(activeLabelType)}
        onClose={() => setActiveLabelType(null)}
        type={activeLabelType || 'label'}
      />
      <UpdateStatusModal
        pkg={pkg}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={onUpdateStatus}
      />
      {showEditModal && (
        <EditPackageModal
          pkg={pkg}
          isOpen
          onClose={() => setShowEditModal(false)}
          onSave={onUpdatePackage}
        />
      )}
      <RecordPaymentModal
        pkg={pkg}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onRecord={onRecordPayment}
      />
    </div>
  );
}
