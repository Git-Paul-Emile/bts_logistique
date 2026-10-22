import type { FormEvent } from 'react';
import { useState } from 'react';
import type { Quote } from '@/types';
import { CUBIC_CM_PER_CUBIC_METER } from '@/utils/packagePricing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateQuoteInput } from '@/utils/validators';
import { QuoteSummaryPanel } from './QuoteSummaryPanel';

interface CalculatorFormProps {
  coefficient: number;
  onSave: (quote: Quote) => Promise<void>;
  onDone: () => void;
}

/** Nom du champ du formulaire, puis nom de la donnée vérifiée par validateQuoteInput. */
const FIELD_BY_KEY = {
  recipient: 'recipient_name',
  destination: 'destination',
  length: 'length_cm',
  width: 'width_cm',
  height: 'height_cm',
  weight: 'weight_kg',
} as const;

export function CalculatorForm({ coefficient, onSave, onDone }: CalculatorFormProps) {
  const [form, setForm] = useState({
    recipient: '',
    destination: '',
    length: '',
    width: '',
    height: '',
    weight: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const numLength = Number(form.length) || 0;
  const numWidth = Number(form.width) || 0;
  const numHeight = Number(form.height) || 0;
  const numWeight = Number(form.weight) || 0;

  const volume = (numLength * numWidth * numHeight) / CUBIC_CM_PER_CUBIC_METER;
  const price = volume * coefficient;

  const update = (key: keyof typeof form, value: string) => {
    setErrorMessage('');
    setFieldErrors((current) => ({ ...current, [FIELD_BY_KEY[key]]: '' }));
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validateQuoteInput({
      recipient_name: form.recipient,
      destination: form.destination,
      length_cm: numLength,
      width_cm: numWidth,
      height_cm: numHeight,
      weight_kg: numWeight,
    });
    setFieldErrors(validation.errors);
    if (!validation.isValid) return;

    setSaving(true);
    try {
      await onSave({
        id: crypto.randomUUID(),
        recipient_name: form.recipient.trim(),
        destination: form.destination.trim(),
        length_cm: numLength,
        width_cm: numWidth,
        height_cm: numHeight,
        weight_kg: numWeight,
        cubic_meter: Number(volume.toFixed(3)),
        coefficient,
        final_price: Number(price.toFixed(2)),
        created_at: new Date().toISOString(),
      });
      onDone();
    } catch {
      setErrorMessage("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7"
      >
        <h3 className="mb-4 border-b border-slate-100 pb-3 font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[#003366] uppercase">
          1. Informations de livraison
        </h3>

        {errorMessage && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Destinataire / Client"
            value={form.recipient}
            error={fieldErrors.recipient_name}
            onChange={(e) => update('recipient', e.target.value)}
            placeholder="Ex : Société Commerciale d'Abidjan"
          />

          <Input
            label="Ville de destination"
            value={form.destination}
            error={fieldErrors.destination}
            onChange={(e) => update('destination', e.target.value)}
            placeholder="Ex : Abidjan, Côte d'Ivoire"
          />
        </div>

        <h3 className="mt-6 mb-4 border-b border-slate-100 pb-3 font-['Space_Grotesk'] text-sm font-bold tracking-wider text-[#003366] uppercase">
          2. Caractéristiques du colis
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Longueur (cm)"
            type="number"
            inputMode="decimal"
            value={form.length}
            error={fieldErrors.length_cm}
            onChange={(e) => update('length', e.target.value)}
          />
          <Input
            label="Largeur (cm)"
            type="number"
            inputMode="decimal"
            value={form.width}
            error={fieldErrors.width_cm}
            onChange={(e) => update('width', e.target.value)}
          />
          <Input
            label="Hauteur (cm)"
            type="number"
            inputMode="decimal"
            value={form.height}
            error={fieldErrors.height_cm}
            onChange={(e) => update('height', e.target.value)}
          />
        </div>

        <div className="mt-4 max-w-xs">
          <Input
            label="Poids estimé (kg)"
            type="number"
            inputMode="decimal"
            value={form.weight}
            error={fieldErrors.weight_kg}
            onChange={(e) => update('weight', e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <Button type="submit" variant="secondary" loading={saving}>
            Enregistrer la cotation
          </Button>

          <Button type="button" variant="ghost" onClick={onDone}>
            Annuler
          </Button>
        </div>
      </form>

      <QuoteSummaryPanel
        volume={volume}
        coefficient={coefficient}
        weight={numWeight}
        price={price}
      />
    </div>
  );
}
