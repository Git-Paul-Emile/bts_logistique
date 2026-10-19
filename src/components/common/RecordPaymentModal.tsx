import { useState } from 'react';
import { Package, PaymentMethod, PAYMENT_METHOD_LABELS } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';


interface RecordPaymentModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onRecord: (
    pkgId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string
  ) => Promise<void>;
}

export function RecordPaymentModal({
  pkg,
  isOpen,
  onClose,
  onRecord,
}: RecordPaymentModalProps) {
  const remaining = Math.max(0, (pkg?.final_price ?? 0) - (pkg?.amount_paid || 0));
  const [amount, setAmount] = useState<number>(remaining);
  const [method, setMethod] = useState<PaymentMethod>('mobile_money');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setIsSubmitting(true);
    try {
      await onRecord(pkg.id, amount, method, reference);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Encaisser un paiement : ${pkg.tracking_number}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 border text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Client :</span>
            <span className="font-semibold text-slate-800">{pkg.client_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Montant total facturé :</span>
            <span className="font-semibold text-slate-800">{formatPrice(pkg.final_price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Déjà réglé :</span>
            <span className="text-emerald-700 font-semibold">{formatPrice(pkg.amount_paid)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-bold text-amber-700">
            <span>Reste à payer :</span>
            <span>{formatPrice(remaining)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Montant à encaisser (F CFA) *
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            max={remaining || undefined}
            required
          />
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setAmount(remaining)}
              className="text-[11px] text-[#003366] underline hover:text-[#002244]"
            >
              Régler le solde total ({formatPrice(remaining)})
            </button>
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setAmount(Math.round(remaining / 2))}
                className="text-[11px] text-slate-500 underline hover:text-slate-800"
              >
                Acompte 50%
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Mode de règlement *
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]"
          >
            {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Référence / N° de transaction
          </label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ex: WAVE-CI-998811, Reçu Espèces N°12..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || amount <= 0}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le reçu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
