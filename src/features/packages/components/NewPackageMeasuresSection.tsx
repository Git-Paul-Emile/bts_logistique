import { FieldLabel } from '@/components/ui/FieldLabel';
import { Input } from '@/components/ui/Input';
import type { TransportMode } from '@/types';
import { TRANSPORT_MODE_LABELS } from '@/types';
import type { NewPackageForm } from '../hooks/useNewPackageForm';

/** Plus petit prix du m³ accepté, pour éviter un tarif saisi par erreur. */
const MIN_COEFFICIENT = 1;

interface MeasureFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}

function MeasureField({ id, label, value, onChange, required = true }: MeasureFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        required={required}
      />
    </div>
  );
}

/** Section 2 du nouveau colis : dimensions, mode de transport, poids et tarif. */
export function NewPackageMeasuresSection({ form }: { form: NewPackageForm }) {
  const isAir = form.transportMode === 'air';

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="flex items-center justify-between border-b pb-2 text-sm font-semibold text-slate-800">
        <span>2. Dimensions, Poids &amp; Tarification</span>
        <span className="text-xs font-bold text-amber-700">Calcul automatique € / m³</span>
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <MeasureField
          id="package-length-cm"
          label="Longueur (cm) *"
          value={form.lengthCm}
          onChange={form.setLengthCm}
        />
        <MeasureField
          id="package-width-cm"
          label="Largeur (cm) *"
          value={form.widthCm}
          onChange={form.setWidthCm}
        />
        <MeasureField
          id="package-height-cm"
          label="Hauteur (cm) *"
          value={form.heightCm}
          onChange={form.setHeightCm}
        />
      </div>

      <fieldset className="pt-2">
        <legend className="mb-1 block text-xs font-semibold text-slate-700 uppercase">
          Mode de transport *
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(TRANSPORT_MODE_LABELS) as TransportMode[]).map((mode) => (
            <label
              key={mode}
              className={`flex cursor-pointer items-center justify-center rounded-md border-2 px-3 py-2 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-[#003366] has-focus-visible:outline-solid ${
                form.transportMode === mode
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              <input
                type="radio"
                name="transport-mode"
                value={mode}
                checked={form.transportMode === mode}
                onChange={() => form.changeTransportMode(mode)}
                className="sr-only"
              />
              {TRANSPORT_MODE_LABELS[mode]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <FieldLabel htmlFor="package-weight-kg">
            {isAir ? 'Poids réel (kg) *' : 'Poids réel (kg)'}
          </FieldLabel>
          <Input
            id="package-weight-kg"
            type="number"
            min={1}
            value={form.weightKg}
            onChange={(e) => form.setWeightKg(Math.max(1, Number(e.target.value)))}
            required={isAir}
          />
          {!isAir && (
            <p className="mt-1 text-[11px] text-slate-400">
              Facultatif pour le transport maritime.
            </p>
          )}
        </div>
        {form.canOverrideRate && (
          <div>
            <FieldLabel htmlFor="package-custom-coeff">
              Coefficient appliqué (€ / m³)
            </FieldLabel>
            <Input
              id="package-custom-coeff"
              type="number"
              min={MIN_COEFFICIENT}
              step={1}
              value={form.ratePerCbm}
              onChange={(e) =>
                form.setCustomCoeff(Math.max(MIN_COEFFICIENT, Math.round(Number(e.target.value))))
              }
              required
            />
          </div>
        )}
      </div>
    </div>
  );
}
