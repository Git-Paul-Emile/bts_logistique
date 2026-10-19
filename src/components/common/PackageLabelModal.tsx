import { Package, PACKAGE_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';
import { formatPrice, formatVolume } from '@/utils/formatters';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Barcode } from '@/components/ui/Barcode';
import { trackingPath } from '@/router/paths';
import { Printer, CheckCircle2 } from 'lucide-react';

interface PackageLabelModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
  type?: 'label' | 'receipt';
}

export function PackageLabelModal({
  pkg,
  isOpen,
  onClose,
  type = 'label',
}: PackageLabelModalProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!pkg) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'label' ? "Étiquette d'expédition colis" : "Reçu de dépôt & Bordereau d'expédition"}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-dashed border-[#003366]/40 bg-white p-6 shadow-sm printable-area">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Logo variant="horizontal" theme="light" size="sm" />
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {type === 'label' ? 'COLIS GROUPAGE' : 'BORDEREAU DÉPÔT'}
              </span>
              <p className="mt-1 text-xs text-slate-500">
                Date: {new Date(pkg.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="my-5 flex flex-col items-center justify-center p-4">
            <Barcode value={pkg.tracking_number} className="h-14 w-auto max-w-full" />
            <p className="mt-2 font-mono text-xl font-extrabold tracking-widest text-[#002244]">
              {pkg.tracking_number}
            </p>
            <p className="mt-1 text-[11px] font-mono text-slate-500">
              Suivi en ligne : {window.location.origin}{trackingPath(pkg.tracking_number)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-400 uppercase text-[10px]">Expéditeur / Client</p>
              <p className="mt-1 font-bold text-slate-800 text-sm">{pkg.client_name || 'Client comptoir'}</p>
              <p className="text-slate-600 mt-1">Origine : <span className="font-semibold">{pkg.origin}</span></p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-400 uppercase text-[10px]">Destinataire / Arrivée</p>
              <p className="mt-1 font-bold text-slate-800 text-sm">{pkg.destination}</p>
              <p className="text-slate-600 mt-1">Statut : <span className="font-semibold">{PACKAGE_STATUS_LABELS[pkg.status]}</span></p>
            </div>
          </div>

          {/* Package specs */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="border rounded-md p-2 bg-white">
              <span className="text-slate-400 block text-[10px]">Dimensions</span>
              <span className="font-bold text-slate-700">{pkg.length_cm} × {pkg.width_cm} × {pkg.height_cm} cm</span>
            </div>
            <div className="border rounded-md p-2 bg-white">
              <span className="text-slate-400 block text-[10px]">Volume</span>
              <span className="font-bold text-[#003366]">{formatVolume(pkg.cubic_meter)}</span>
            </div>
            <div className="border rounded-md p-2 bg-white">
              <span className="text-slate-400 block text-[10px]">Poids</span>
              <span className="font-bold text-slate-700">{pkg.weight_kg} kg</span>
            </div>
            <div className="border rounded-md p-2 bg-white">
              <span className="text-slate-400 block text-[10px]">Total TTC</span>
              <span className="font-bold text-amber-600">{formatPrice(pkg.final_price)}</span>
            </div>
          </div>

          {/* Payment receipt footer */}
          <div className="mt-4 flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs">
            <div>
              <span className="text-slate-500">Règlement : </span>
              <span className="font-bold text-slate-800">{PAYMENT_STATUS_LABELS[pkg.payment_status]}</span>
              <span className="text-slate-500 ml-2">
                (Payé : {formatPrice(pkg.amount_paid)} / Reste : {formatPrice(Math.max(0, pkg.final_price - pkg.amount_paid))})
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle2 size={14} /> Reçu certifié BTS
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handlePrint} className="gap-2">
            <Printer size={16} /> Imprimer le document
          </Button>
        </div>
      </div>
    </Modal>
  );
}
