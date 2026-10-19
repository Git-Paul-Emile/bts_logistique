import { FormEvent, useState } from 'react';
import { Calculator } from 'lucide-react';
import { Quote } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CalculatorFormProps {
  coefficient: number;
  onSave: (quote: Quote) => Promise<void>;
  onDone: () => void;
}

export function CalculatorForm({
  coefficient,
  onSave,
  onDone,
}: CalculatorFormProps) {
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

  const numLength = Number(form.length) || 0;
  const numWidth = Number(form.width) || 0;
  const numHeight = Number(form.height) || 0;
  const numWeight = Number(form.weight) || 0;

  const volume = (numLength * numWidth * numHeight) / 1000000;
  const price = volume * coefficient;

  const isValid =
    form.recipient.trim().length > 0 &&
    form.destination.trim().length > 0 &&
    numLength > 0 &&
    numWidth > 0 &&
    numHeight > 0 &&
    numWeight > 0;

  const update = (key: keyof typeof form, value: string) => {
    setErrorMessage('');
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValid) {
      setErrorMessage('Veuillez renseigner un destinataire et des dimensions positives.');
      return;
    }

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
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-7"
      >
        <h3 className="mb-4 border-b border-slate-100 pb-3 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wider text-[#003366]">
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
            onChange={(e) => update('recipient', e.target.value)}
            placeholder="Ex : Société Commerciale d'Abidjan"
            required
          />

          <Input
            label="Ville de destination"
            value={form.destination}
            onChange={(e) => update('destination', e.target.value)}
            placeholder="Ex : Abidjan, Côte d'Ivoire"
            required
          />
        </div>

        <h3 className="mb-4 mt-6 border-b border-slate-100 pb-3 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wider text-[#003366]">
          2. Caractéristiques du colis
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Longueur (cm)"
            type="number"
            min="1"
            value={form.length}
            onChange={(e) => update('length', e.target.value)}
            required
          />
          <Input
            label="Largeur (cm)"
            type="number"
            min="1"
            value={form.width}
            onChange={(e) => update('width', e.target.value)}
            required
          />
          <Input
            label="Hauteur (cm)"
            type="number"
            min="1"
            value={form.height}
            onChange={(e) => update('height', e.target.value)}
            required
          />
        </div>

        <div className="mt-4 max-w-xs">
          <Input
            label="Poids estimé (kg)"
            type="number"
            min="0.1"
            step="0.1"
            value={form.weight}
            onChange={(e) => update('weight', e.target.value)}
            required
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <Button
            type="submit"
            variant="secondary"
            loading={saving}
          >
            Enregistrer la cotation
          </Button>

          <Button type="button" variant="ghost" onClick={onDone}>
            Annuler
          </Button>
        </div>
      </form>

      {/* Volet récapitulatif en direct */}
      <div className="lg:col-span-5">
        <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-['Space_Grotesk'] text-sm font-bold text-[#003366]">
            <Calculator size={18} />
            <span>Synthèse volumétrique en direct</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Volume unitaire :</span>
              <span className="font-semibold text-slate-800">{volume.toFixed(3)} m³</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Coefficient appliqué :</span>
              <span className="font-semibold text-slate-800">{coefficient.toFixed(2)} F CFA/m³</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Poids renseigné :</span>
              <span className="font-semibold text-slate-800">{numWeight > 0 ? `${numWeight} kg` : '-'}</span>
            </div>

            <div className="my-2 border-t border-slate-100 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prix estimé
                </span>
                <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">
                  {formatPrice(price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
