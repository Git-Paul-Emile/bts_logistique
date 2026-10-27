import { Button } from '@/components/ui/Button';
import { formatPrice, formatVolume } from '@/utils/formatters';
import type { NewPackageForm } from '../hooks/useNewPackageForm';

/** Parité fixe entre le franc CFA (XAF) et l'euro. */
const XAF_PER_EUR = 655.957;

interface NewPackageSummaryProps {
  form: NewPackageForm;
  onCancel: () => void;
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b py-1">
      <span className="text-slate-500">{label}</span>
      {children}
    </div>
  );
}

/**
 * Colonne de droite : volume, prix estimé et boutons d'enregistrement. Le numéro de suivi et la
 * marge collecteur sont fixés par le serveur, visibles sur la fiche du colis créé.
 */
export function NewPackageSummary({ form, onCancel }: NewPackageSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="sticky top-20 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="border-b pb-2 font-['Space_Grotesk'] text-lg font-bold text-[#002244]">
          Synthèse & Cubage
        </h3>

        {form.formErrors.form && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            {form.formErrors.form}
          </p>
        )}
        <div className="space-y-3 text-xs">
          <SummaryRow label="N° de Suivi :">
            <span className="font-medium text-slate-700">attribué à l’enregistrement</span>
          </SummaryRow>
          <SummaryRow label="Volume calculé :">
            <span className="text-sm font-bold text-slate-800">
              {formatVolume(form.cubicMeter)}
            </span>
          </SummaryRow>
          <SummaryRow label="Poids mesuré :">
            <span className="font-medium text-slate-700">{form.weightKg} kg</span>
          </SummaryRow>
          <SummaryRow label="Tarif au m³ :">
            <span className="font-medium text-slate-700">{formatPrice(form.ratePerCbm)}</span>
          </SummaryRow>

          <div className="py-2 text-center">
            <span className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Montant Total Transport (estimation)
            </span>
            <span className="mt-1 block text-2xl font-extrabold text-[#002244]">
              {formatPrice(form.finalPrice)}
            </span>
            <span className="text-[11px] text-slate-500">
              ≈ {(form.finalPrice / XAF_PER_EUR).toFixed(2)} € EUR
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={form.isSubmitting}
            className="w-full justify-center bg-[#003366] py-3 text-sm text-white hover:bg-[#002244]"
          >
            {form.isSubmitting ? 'Enregistrement...' : 'Valider & Imprimer étiquette'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="w-full justify-center text-xs"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}
