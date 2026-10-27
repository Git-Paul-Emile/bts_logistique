import type { FormEvent } from 'react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useAuth } from '@/context/useAuth';
import { canOverrideRate } from '@/features/auth/permissions';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { locationOptions, useLocations } from '@/features/locations/useLocations';
import { useUpdatePackage } from '@/features/packages/hooks/usePackages';
import { errorMessage } from '@/lib/errorMessage';
import type { Package } from '@/types';
import type { NumericField } from '@/features/packages/editPackageValues';
import {
  changedFields,
  MEASURE_FIELDS,
  RATE_FIELD,
  toValues,
} from '@/features/packages/editPackageValues';
import { formatPrice, formatVolume } from '@/utils/formatters';
import { computeCubicMeter, computePrice } from '@/utils/packagePricing';

interface EditPackageModalProps {
  pkg: Package;
  isOpen: boolean;
  onClose: () => void;
}

/** Modification d'un colis. Le serveur recalcule volume, prix et marge. */
export function EditPackageModal({ pkg, isOpen, onClose }: EditPackageModalProps) {
  const { user } = useAuth();
  const { origins, destinations } = useLocations();
  const updatePackage = useUpdatePackage();
  const notify = useNotify();
  const [initial] = useState(() => toValues(pkg));
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<NumericField | 'form', string>>>({});
  const [saving, setSaving] = useState(false);
  const fields =
    user && canOverrideRate(user.role) ? [...MEASURE_FIELDS, RATE_FIELD] : MEASURE_FIELDS;

  const cubicMeter = computeCubicMeter(values.length_cm, values.width_cm, values.height_cm);
  const newPrice = computePrice(cubicMeter, values.rate_per_cbm);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<NumericField, string>> = {};
    for (const field of fields) {
      if (!(values[field.key] > 0))
        nextErrors[field.key] = `${field.label} : saisissez une valeur supérieure à 0.`;
    }
    if (!Number.isInteger(values.rate_per_cbm)) {
      nextErrors.rate_per_cbm = 'Le tarif au m³ est un montant entier en F CFA.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const changes = changedFields(initial, values);
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const updated = await updatePackage.mutateAsync({ id: pkg.id, changes });
      notify(`Colis ${updated.tracking_number} modifié.`);
      onClose();
    } catch (error) {
      setErrors({ form: errorMessage(error, 'Le colis n’a pas pu être modifié. Réessayez.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modifier le colis ${pkg.tracking_number}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errors.form && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {errors.form}
          </p>
        )}
        <Input
          id="edit-description"
          label="Description du contenu"
          value={values.description}
          onChange={(event) =>
            setValues((previous) => ({ ...previous, description: event.target.value }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit-origin"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Origine
            </label>
            <SearchableSelect
              id="edit-origin"
              value={values.origin_code}
              onChange={(code) => setValues((previous) => ({ ...previous, origin_code: code }))}
              options={locationOptions(origins)}
            />
          </div>
          <div>
            <label
              htmlFor="edit-destination"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Destination
            </label>
            <SearchableSelect
              id="edit-destination"
              value={values.destination_code}
              onChange={(code) =>
                setValues((previous) => ({ ...previous, destination_code: code }))
              }
              options={locationOptions(destinations)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {fields.map((field) => (
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
            <dt className="text-xs text-slate-500">Nouveau prix estimé</dt>
            <dd className="font-bold text-[#003366]">{formatPrice(newPrice)}</dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500">
          Le prix définitif est calculé par le serveur. Le statut de paiement est recalculé à partir
          du montant déjà réglé ({formatPrice(pkg.amount_paid)}).
        </p>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={saving}>
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </Modal>
  );
}
