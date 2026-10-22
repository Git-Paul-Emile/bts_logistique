import { useState } from 'react';
import type { Package, PaymentMethod } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { labelsToOptions } from '@/utils/selectOptions';

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

export function RecordPaymentModal({ pkg, isOpen, onClose, onRecord }: RecordPaymentModalProps) {
  const remaining = Math.max(0, (pkg?.final_price ?? 0) - (pkg?.amount_paid || 0));
  const [amount, setAmount] = useState<number>(remaining);
  const [method, setMethod] = useState<PaymentMethod>('mobile_money');
  const [reference, setReference] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

  function getAmountError(value: number): string {
    if (!Number.isFinite(value) || value <= 0) {
      return 'Saisissez le montant encaissé, supérieur à 0 F CFA.';
    }
    if (remaining > 0 && value > remaining) {
      return `Le montant ne peut pas dépasser le reste à payer : ${formatPrice(remaining)}.`;
    }
    return '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = getAmountError(amount);
    setAmountError(error);
    if (error) return;
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
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1 rounded-lg border bg-slate-50 p-3 text-xs">
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
            <span className="font-semibold text-emerald-700">{formatPrice(pkg.amount_paid)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-bold text-amber-700">
            <span>Reste à payer :</span>
            <span>{formatPrice(remaining)}</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="payment-amount"
            className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
          >
            Montant à encaisser (F CFA) *
          </label>
          <Input
            id="payment-amount"
            type="number"
            inputMode="numeric"
            value={amount}
            error={amountError}
            onChange={(e) => {
              setAmountError('');
              setAmount(Number(e.target.value));
            }}
            onBlur={() => setAmountError(getAmountError(amount))}
          />
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAmountError('');
                setAmount(remaining);
              }}
              className="text-[11px] text-[#003366] underline hover:text-[#002244]"
            >
              Régler le solde total ({formatPrice(remaining)})
            </button>
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAmountError('');
                  setAmount(Math.round(remaining / 2));
                }}
                className="text-[11px] text-slate-500 underline hover:text-slate-800"
              >
                Acompte 50%
              </button>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="payment-method"
            className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
          >
            Mode de règlement *
          </label>
          <SearchableSelect
            id="payment-method"
            value={method}
            onChange={setMethod}
            options={labelsToOptions(PAYMENT_METHOD_LABELS)}
          />
        </div>

        <div>
          <label
            htmlFor="payment-reference"
            className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
          >
            Référence / N° de transaction
          </label>
          <Input
            id="payment-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ex: WAVE-CI-998811, Reçu Espèces N°12..."
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le reçu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
