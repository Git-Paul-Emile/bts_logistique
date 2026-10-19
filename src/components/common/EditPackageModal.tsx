import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BTS_DESTINATIONS, BTS_ORIGINS, Package, PackageUpdateInput } from '@/types';
import { formatPrice, formatVolume } from '@/utils/formatters';
import { computeCubicMeter, computePrice } from '@/utils/packagePricing';

interface EditPackageModalProps {
  pkg: Package;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, changes: PackageUpdateInput) => Promise<void>;
}

type NumericField = 'length_cm' | 'width_cm' | 'height_cm' | 'weight_kg' | 'coefficient';

const NUMERIC_FIELDS: { key: NumericField; label: string; unit: string }[] = [
  { key: 'length_cm', label: 'Longueur', unit: 'cm' },
  { key: 'width_cm', label: 'Largeur', unit: 'cm' },
  { key: 'height_cm', label: 'Hauteur', unit: 'cm' },
  { key: 'weight_kg', label: 'Poids', unit: 'kg' },
  { key: 'coefficient', label: 'Tarif au m³', unit: 'F CFA' },
];

const SELECT_CLASS =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]';

function toInput(pkg: Package): PackageUpdateInput {
  return {
    description: pkg.description ?? '',
    origin: pkg.origin,
    destination: pkg.destination,
    length_cm: pkg.length_cm,
    width_cm: pkg.width_cm,
    height_cm: pkg.height_cm,
    weight_kg: pkg.weight_kg,
    coefficient: pkg.coefficient,
  };
}

// Garde les valeurs actuelles dans les listes, même si elles ne font plus partie des choix proposés.
function withCurrent(options: string[], current: string): string[] {
  return options.includes(current) ? options : [current, ...options];
}

export function EditPackageModal({ pkg, isOpen, onClose, onSave }: EditPackageModalProps) {
  const [values, setValues] = useState<PackageUpdateInput>(() => toInput(pkg));
  const [errors, setErrors] = useState<Partial<Record<NumericField, string>>>({});
  const [saving, setSaving] = useState(false);

  const cubicMeter = computeCubicMeter(values.length_cm, values.width_cm, values.height_cm);
  const newPrice = computePrice(cubicMeter, values.coefficient);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<NumericField, string>> = {};
    for (const field of NUMERIC_FIELDS) {
      if (!(values[field.key] > 0)) nextErrors[field.key] = `${field.label} : saisissez une valeur supérieure à 0.`;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave(pkg.id, values);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier le colis ${pkg.tracking_number}`} maxWidth="2xl">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="edit-description"
          label="Description du contenu"
          value={values.description}
          onChange={(event) => setValues((previous) => ({ ...previous, description: event.target.value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-origin" className="mb-1.5 block text-xs font-semibold text-slate-700">Origine</label>
            <select id="edit-origin" className={SELECT_CLASS} value={values.origin} onChange={(event) => setValues((previous) => ({ ...previous, origin: event.target.value }))}>
              {withCurrent(BTS_ORIGINS, pkg.origin).map((origin) => (
                <option key={origin} value={origin}>{origin}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-destination" className="mb-1.5 block text-xs font-semibold text-slate-700">Destination</label>
            <select id="edit-destination" className={SELECT_CLASS} value={values.destination} onChange={(event) => setValues((previous) => ({ ...previous, destination: event.target.value }))}>
              {withCurrent(BTS_DESTINATIONS, pkg.destination).map((destination) => (
                <option key={destination} value={destination}>{destination}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {NUMERIC_FIELDS.map((field) => (
            <Input
              key={field.key}
              id={`edit-${field.key}`}
              label={`${field.label} (${field.unit})`}
              type="number"
              inputMode="decimal"
              min={0}
              value={values[field.key]}
              error={errors[field.key]}
              onChange={(event) => {
                setErrors((previous) => ({ ...previous, [field.key]: undefined }));
                setValues((previous) => ({ ...previous, [field.key]: Number(event.target.value) }));
              }}
            />
          ))}
        </div>

        <dl className="grid grid-cols-3 gap-3 rounded-md bg-slate-50 p-4 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Nouveau volume</dt>
            <dd className="font-bold text-slate-800">{formatVolume(cubicMeter)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Prix actuel</dt>
            <dd className="font-bold text-slate-800">{formatPrice(pkg.final_price)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Nouveau prix</dt>
            <dd className="font-bold text-[#003366]">{formatPrice(newPrice)}</dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500">
          Le statut de paiement est recalculé à partir du montant déjà réglé ({formatPrice(pkg.amount_paid)}).
        </p>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={saving}>Enregistrer les modifications</Button>
        </div>
      </form>
    </Modal>
  );
}
