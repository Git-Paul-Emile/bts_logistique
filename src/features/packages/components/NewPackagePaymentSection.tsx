import { FieldLabel } from '@/components/ui/FieldLabel';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { labelsToOptions } from '@/utils/selectOptions';
import type { NewPackageForm, PaymentOption } from '../hooks/useNewPackageForm';

const PAYMENT_OPTIONS: ReadonlyArray<{ id: PaymentOption; label: string }> = [
  { id: 'unpaid', label: 'Paiement à la livraison' },
  { id: 'partial', label: 'Acompte partiel' },
  { id: 'paid', label: 'Règlement total' },
];

/** Section 3 du nouveau colis : ce que le client paie au dépôt. */
export function NewPackagePaymentSection({ form }: { form: NewPackageForm }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="border-b pb-2 text-sm font-semibold text-slate-800">
        3. Modalité d'encaissement initial
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.id}
            onClick={() => form.choosePaymentOption(opt.id)}
            className={`rounded-lg border p-3 text-center text-xs font-semibold transition ${
              form.paymentOption === opt.id
                ? 'border-[#003366] bg-[#003366] text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {form.paymentOption !== 'unpaid' && (
        <div className="pt-2">
          <FieldLabel htmlFor="new-package-payment-method">Mode de règlement *</FieldLabel>
          <SearchableSelect
            id="new-package-payment-method"
            value={form.paymentMethod}
            onChange={form.setPaymentMethod}
            options={labelsToOptions(PAYMENT_METHOD_LABELS)}
          />
        </div>
      )}

      {form.paymentOption === 'partial' && (
        <div className="pt-2">
          <FieldLabel htmlFor="new-package-deposit">Montant de l'acompte (F CFA) *</FieldLabel>
          <Input
            id="new-package-deposit"
            type="number"
            inputMode="numeric"
            value={form.amountPaid}
            error={form.formErrors.amountPaid}
            onChange={(e) => {
              form.clearError('amountPaid');
              form.setAmountPaid(Number(e.target.value));
            }}
          />
        </div>
      )}
    </div>
  );
}
