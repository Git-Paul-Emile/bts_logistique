import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { errorMessage } from '@/lib/errorMessage';
import { formatDateTime } from '@/utils/formatDate';
import { formatPrice } from '@/utils/formatters';
import type { PricingGrid, TransportMode } from '@/types';
import { TRANSPORT_MODE_LABELS } from '@/types';

interface PricingSettingsFormProps {
  /** null tant qu'aucune grille n'a été enregistrée (premier démarrage). */
  grid: PricingGrid | null;
  onSave: (rates: PricingGrid['rates']) => Promise<void>;
}

type RateField = 'client_rate_per_cbm' | 'collector_margin_per_cbm';
type FormValues = Record<TransportMode, Record<RateField, string>>;
type FormErrors = Partial<Record<`${TransportMode}.${RateField}`, string>>;

const MODES = Object.keys(TRANSPORT_MODE_LABELS) as TransportMode[];

function toFormValues(grid: PricingGrid | null): FormValues {
  const values = {} as FormValues;
  for (const mode of MODES) {
    values[mode] = {
      client_rate_per_cbm: grid ? String(grid.rates[mode].client_rate_per_cbm) : '',
      collector_margin_per_cbm: grid ? String(grid.rates[mode].collector_margin_per_cbm) : '',
    };
  }
  return values;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const mode of MODES) {
    const label = TRANSPORT_MODE_LABELS[mode].toLowerCase();
    const clientRate = Number(values[mode].client_rate_per_cbm);
    const margin = Number(values[mode].collector_margin_per_cbm);
    if (!Number.isInteger(clientRate) || clientRate <= 0) {
      errors[`${mode}.client_rate_per_cbm`] =
        `Saisissez un prix ${label} en F CFA, nombre entier supérieur à 0.`;
    }
    if (!Number.isInteger(margin) || margin < 0) {
      errors[`${mode}.collector_margin_per_cbm`] =
        'Saisissez une marge en F CFA, nombre entier, ou 0 si aucune marge.';
    } else if (margin >= clientRate) {
      errors[`${mode}.collector_margin_per_cbm`] =
        'La marge doit rester inférieure au prix client.';
    }
  }
  return errors;
}

export function PricingSettingsForm({ grid, onSave }: PricingSettingsFormProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(grid));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const updateValue = (mode: TransportMode, field: RateField, value: string) => {
    setErrors((previous) => ({ ...previous, [`${mode}.${field}`]: undefined }));
    setValues((previous) => ({ ...previous, [mode]: { ...previous[mode], [field]: value } }));
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }
    const rates = {} as PricingGrid['rates'];
    for (const mode of MODES) {
      rates[mode] = {
        client_rate_per_cbm: Number(values[mode].client_rate_per_cbm),
        collector_margin_per_cbm: Number(values[mode].collector_margin_per_cbm),
      };
    }
    setSaving(true);
    setFormError('');
    try {
      await onSave(rates);
    } catch (error) {
      setFormError(errorMessage(error, 'Les tarifs n’ont pas pu être enregistrés. Réessayez.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">
          Tarifs & marges collecteurs
        </h2>
        <p className="mt-0.5 text-sm text-slate-600">
          Le prix client est celui affiché sur le site public et appliqué aux nouveaux colis. La
          marge collecteur est un montant fixe par m³, comprise dans ce prix.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {grid
            ? `Dernière modification : ${formatDateTime(grid.updated_at)}`
            : 'Aucun tarif enregistré : les colis ne peuvent pas être enregistrés avant la saisie de cette grille.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {formError && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {formError}
          </p>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          {MODES.map((mode) => {
            const clientRate = Number(values[mode].client_rate_per_cbm) || 0;
            const margin = Number(values[mode].collector_margin_per_cbm) || 0;
            return (
              <fieldset
                key={mode}
                className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
              >
                <legend className="px-1 font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[#003366] uppercase">
                  {TRANSPORT_MODE_LABELS[mode]}
                </legend>
                <div className="space-y-4">
                  <Input
                    id={`${mode}-client-rate`}
                    label="Prix client au m³"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={values[mode].client_rate_per_cbm}
                    error={errors[`${mode}.client_rate_per_cbm`]}
                    onChange={(event) =>
                      updateValue(mode, 'client_rate_per_cbm', event.target.value)
                    }
                    rightElement={
                      <span className="text-xs font-semibold text-slate-400">F CFA</span>
                    }
                  />
                  <Input
                    id={`${mode}-collector-margin`}
                    label="Marge collecteur au m³"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={values[mode].collector_margin_per_cbm}
                    error={errors[`${mode}.collector_margin_per_cbm`]}
                    onChange={(event) =>
                      updateValue(mode, 'collector_margin_per_cbm', event.target.value)
                    }
                    rightElement={
                      <span className="text-xs font-semibold text-slate-400">F CFA</span>
                    }
                  />
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Client paie</dt>
                    <dd className="font-bold text-slate-800">{formatPrice(clientRate)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Collecteur</dt>
                    <dd className="font-bold text-[#058441]">{formatPrice(margin)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Part BTS</dt>
                    <dd className="font-bold text-[#003366]">
                      {formatPrice(Math.max(0, clientRate - margin))}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-[11px] text-slate-500">Répartition pour 1 m³.</p>
              </fieldset>
            );
          })}
        </div>

        <Button type="submit" variant="primary" loading={saving}>
          Enregistrer les tarifs
        </Button>
      </form>
    </div>
  );
}
