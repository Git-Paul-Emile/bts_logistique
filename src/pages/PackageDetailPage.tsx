import { useState, useRef, useEffect } from 'react';
import { Package, PackageStatus, PaymentStatus, PACKAGE_STATUS_LABELS, PAYMENT_STATUS_LABELS, PackageUpdateInput, StatusUpdateHandler } from '@/types';
import { formatPrice, formatVolume, formatDate, formatDateTime } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PackageLabelModal } from '@/components/common/PackageLabelModal';
import { UpdateStatusModal } from '@/components/common/UpdateStatusModal';
import { RecordPaymentModal } from '@/components/common/RecordPaymentModal';
import { EditPackageModal } from '@/components/common/EditPackageModal';
import {
  ArrowLeft,
  ChevronDown,
  Printer,
  RefreshCw,
  CreditCard,
  MapPin,
  User,
  FileText,
  Pencil,
} from 'lucide-react';

interface PackageDetailPageProps {
  pkg: Package | null;
  onBack: () => void;
  onUpdateStatus: StatusUpdateHandler;
  onUpdatePackage: (id: string, changes: PackageUpdateInput) => Promise<void>;
  onRecordPayment: (
    pkgId: string,
    amount: number,
    method: 'cash' | 'transfer' | 'mobile_money' | 'other',
    reference?: string
  ) => Promise<void>;
}

export function PackageDetailPage({
  pkg,
  onBack,
  onUpdateStatus,
  onUpdatePackage,
  onRecordPayment,
}: PackageDetailPageProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeLabelType, setActiveLabelType] = useState<'label' | 'receipt' | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getStatusBadge = (status: PackageStatus) => {
    switch (status) {
      case 'registered':
        return <Badge variant="info">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'in_transit':
        return <Badge variant="warning">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'arrived':
        return <Badge variant="success">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'delivered':
        return <Badge variant="muted">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      case 'on_hold':
        return <Badge variant="danger">{PACKAGE_STATUS_LABELS[status]}</Badge>;
      default:
        return <Badge variant="default">{PACKAGE_STATUS_LABELS[status]}</Badge>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">{PAYMENT_STATUS_LABELS[status]}</Badge>;
      case 'partial':
        return <Badge variant="warning">{PAYMENT_STATUS_LABELS[status]}</Badge>;
      case 'unpaid':
        return <Badge variant="danger">{PAYMENT_STATUS_LABELS[status]}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 transition"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-2xl font-extrabold text-[#002244]">
                {pkg.tracking_number}
              </h2>
              {getStatusBadge(pkg.status)}
              {getPaymentBadge(pkg.payment_status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enregistré le {formatDate(pkg.created_at)} • Route : {pkg.origin} → {pkg.destination}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" icon={<Pencil size={14} />} onClick={() => setShowEditModal(true)}>
            Modifier
          </Button>
          {/* Documents dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="secondary"
              onClick={() => setDropdownOpen((o) => !o)}
              className="inline-flex flex-row items-center whitespace-nowrap gap-1.5 text-xs text-white hover:text-white"
            >
              <Printer size={15} className="shrink-0" />
              <span>Documents</span>
              <ChevronDown size={13} className={`shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[200px] w-max rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { setActiveLabelType('label'); setDropdownOpen(false); }}
                  className="flex flex-row items-center whitespace-nowrap w-full gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                >
                  <Printer size={14} className="shrink-0" />
                  <span>Étiquette d'expédition</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveLabelType('receipt'); setDropdownOpen(false); }}
                  className="flex flex-row items-center whitespace-nowrap w-full gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                >
                  <FileText size={14} className="shrink-0" />
                  <span>Reçu de dépôt</span>
                </button>
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            onClick={() => setShowStatusModal(true)}
            className="inline-flex flex-row items-center whitespace-nowrap gap-1.5 text-xs text-white hover:text-white"
          >
            <RefreshCw size={15} /> <span>Changer statut</span>
          </Button>

          {remaining > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex flex-row items-center whitespace-nowrap gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CreditCard size={15} /> <span>Encaisser ({formatPrice(remaining)})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Details & Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Details cards */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section: Client & Marchandise */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm border-b pb-3 mb-4">
              Informations d'Expédition
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px] mb-1">
                  <User size={14} /> Client Destinataire
                </div>
                <p className="font-bold text-slate-800 text-sm">{pkg.client_name || 'Client comptoir'}</p>
                <p className="text-slate-500 mt-1">ID Client : <span className="font-mono">{pkg.client_id}</span></p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px] mb-1">
                  <MapPin size={14} /> Acheminement
                </div>
                <p className="text-slate-700">Origine : <span className="font-bold">{pkg.origin}</span></p>
                <p className="text-slate-700 mt-0.5">Destination : <span className="font-bold text-[#003366]">{pkg.destination}</span></p>
              </div>
            </div>

            {pkg.description && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">
                  Nature de la marchandise :
                </span>
                {pkg.description}
              </div>
            )}
          </div>

          {/* Section: Mesures & Facturation */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm border-b pb-3 mb-4">
              Cubage, Poids & Détail Financier
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="rounded-lg border p-3 bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dimensions</span>
                <span className="font-bold text-slate-800 text-sm mt-1 block">
                  {pkg.length_cm} × {pkg.width_cm} × {pkg.height_cm} cm
                </span>
              </div>

              <div className="rounded-lg border p-3 bg-[#003366]/5 border-[#003366]/20">
                <span className="text-[#003366] block text-[10px] uppercase font-bold">Volume</span>
                <span className="font-extrabold text-[#003366] text-base mt-1 block">
                  {formatVolume(pkg.cubic_meter)}
                </span>
              </div>

              <div className="rounded-lg border p-3 bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Poids Brut</span>
                <span className="font-bold text-slate-800 text-sm mt-1 block">
                  {pkg.weight_kg} kg
                </span>
              </div>

              <div className="rounded-lg border p-3 bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Coefficient</span>
                <span className="font-bold text-slate-800 text-sm mt-1 block">
                  {formatPrice(pkg.coefficient)}/m³
                </span>
              </div>
            </div>

            {/* Financial balance */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase">Prix Total F CFA</span>
                  <p className="text-lg font-bold text-slate-800">{formatPrice(pkg.final_price)}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase">Montant Encaissé</span>
                  <p className="text-lg font-bold text-emerald-600">{formatPrice(pkg.amount_paid)}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase">Solde Reste Dû</span>
                  <p className="text-lg font-extrabold text-amber-600">{formatPrice(remaining)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Tracking Timeline */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#002244]">
                Historique & Suivi
              </h3>
              <button
                onClick={() => setShowStatusModal(true)}
                className="text-xs font-semibold text-[#003366] hover:underline"
              >
                + Ajouter étape
              </button>
            </div>

            {pkg.events && pkg.events.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
                {pkg.events.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative">
                    {/* Bullet */}
                    <div
                      className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white ${
                        idx === 0
                          ? 'border-[#003366] bg-[#003366] text-white shadow-sm'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          idx === 0 ? 'bg-amber-400' : 'bg-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">
                          {PACKAGE_STATUS_LABELS[evt.status] || evt.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(evt.created_at)}
                        </span>
                      </div>

                      {evt.location && (
                        <p className="text-xs font-medium text-[#003366] flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {evt.location}
                        </p>
                      )}

                      {evt.comment && (
                        <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                          {evt.comment}
                        </p>
                      )}

                      <p className="text-[10px] text-slate-400 mt-1">
                        Agent : {evt.agent_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucun événement enregistré pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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
        <EditPackageModal pkg={pkg} isOpen onClose={() => setShowEditModal(false)} onSave={onUpdatePackage} />
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
