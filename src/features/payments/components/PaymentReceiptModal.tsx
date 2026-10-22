import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Payment } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatDateTime, formatPrice } from '@/utils/formatters';

interface PaymentReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

/** Reçu officiel d'un encaissement, prêt à imprimer. */
export function PaymentReceiptModal({ payment, onClose }: PaymentReceiptModalProps) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Reçu officiel d'encaissement BTS Logistique"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-xs">
          <div className="border-b pb-3 text-center">
            <h3 className="text-base font-bold text-[#002244]">BTS LOGISTIQUE</h3>
            <p className="text-[10px] text-slate-500">Service Caisse & Facturation</p>
            <p className="mt-1 font-mono text-xs font-bold text-slate-700">
              N° Reçu : {payment.reference || payment.id}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Date :</span>
              <span className="font-medium text-slate-800">
                {formatDateTime(payment.created_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client :</span>
              <span className="font-semibold text-slate-800">{payment.client_name}</span>
            </div>
            {payment.tracking_number && (
              <div className="flex justify-between">
                <span className="text-slate-500">Colis lié :</span>
                <span className="font-mono font-bold text-[#003366]">
                  {payment.tracking_number}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Mode de paiement :</span>
              <span className="font-medium text-slate-800">
                {PAYMENT_METHOD_LABELS[payment.payment_method]}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-sm border-t bg-emerald-50 p-3 pt-3">
            <span className="text-[11px] font-bold text-emerald-800 uppercase">
              Montant Encaissé
            </span>
            <span className="text-lg font-extrabold text-emerald-700">
              {formatPrice(payment.amount)}
            </span>
          </div>

          {payment.notes && (
            <p className="mt-2 text-[11px] text-slate-500 italic">Note : {payment.notes}</p>
          )}

          <div className="pt-2 text-center text-[10px] text-slate-400">
            Merci de votre confiance. Pour tout renseignement : contact@bts-logistique.com
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => window.print()} className="gap-2">
            <Printer size={16} /> Imprimer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
