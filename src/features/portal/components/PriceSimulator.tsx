import { formatVolume } from '@/utils/formatters';
import type { TransportMode } from '@/types';
import { TRANSPORT_MODE_LABELS } from '@/types';
import { usePublicPricing } from '@/features/settings/hooks/usePricingGrid';
import type { Dimensions } from '../hooks/usePriceEstimate';
import { usePriceEstimate } from '../hooks/usePriceEstimate';
import { SectionHeading } from './SectionHeading';

const DIMENSION_FIELDS: { key: keyof Dimensions; label: string }[] = [
  { key: 'length', label: 'Longueur' },
  { key: 'width', label: 'Largeur' },
  { key: 'height', label: 'Hauteur' },
];

const TRANSPORT_MODES = Object.keys(TRANSPORT_MODE_LABELS) as TransportMode[];

const amountFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** Points de suspension tant que le tarif n'est pas chargé (ou s'il n'a pas pu l'être). */
function formatFcfa(amount: number | null | undefined): string {
  return amount == null ? '...' : `${amountFormatter.format(amount)} FCFA`;
}

export function PriceSimulator() {
  const pricing = usePublicPricing();
  const rates = pricing.data?.rates;
  const { dimensions, updateDimension, mode, setMode, cubicMeter, priceXof } =
    usePriceEstimate(rates);

  return (
    <section id="simulateur" className="scroll-mt-20 bg-bts-canvas py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            title="Estimez le prix"
            highlight="de votre envoi"
            intro="Le prix dépend du volume, pas du poids : longueur x largeur x hauteur en centimètres, divisé par 1 000 000, donne le volume en m³."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {TRANSPORT_MODES.map((key) => (
              <li key={key} className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-600">{TRANSPORT_MODE_LABELS[key]}</p>
                <p className="font-display text-base font-bold text-bts-blue">
                  {formatFcfa(rates?.[key].client_rate_per_cbm)} / m³
                </p>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
          noValidate
          className="overflow-hidden rounded-lg bg-white shadow-xs ring-1 ring-slate-200 lg:col-span-7"
          aria-label="Simulateur de prix"
        >
          <div className="space-y-6 p-6 sm:p-8">
            <fieldset>
              <legend className="text-sm font-semibold text-bts-blue">Mode de transport</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {TRANSPORT_MODES.map((key) => {
                  const isActive = mode === key;
                  return (
                    <label
                      key={key}
                      className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border-2 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-bts-blue has-focus-visible:outline-solid ${
                        isActive
                          ? 'border-bts-green text-bts-green-800'
                          : 'border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="transport-mode"
                        value={key}
                        checked={isActive}
                        onChange={() => setMode(key)}
                        className="sr-only"
                      />
                      {TRANSPORT_MODE_LABELS[key]}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-bts-blue">Dimensions du colis</legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {DIMENSION_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={`dimension-${field.key}`}
                      className="block text-sm text-slate-600"
                    >
                      {field.label} (cm)
                    </label>
                    <input
                      id={`dimension-${field.key}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={dimensions[field.key]}
                      onChange={(event) => updateDimension(field.key, Number(event.target.value))}
                      className="mt-1 h-12 w-full rounded-md border border-slate-300 px-3 text-base text-bts-dark focus:border-bts-blue focus:ring-2 focus:ring-bts-blue/20 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <output
            htmlFor="dimension-length dimension-width dimension-height"
            aria-live="polite"
            className="block bg-bts-blue-950 p-6 text-white sm:p-8"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-white/70">
                  Prix estimé, {TRANSPORT_MODE_LABELS[mode].toLowerCase()}
                </p>
                <p className="mt-1 font-display text-4xl font-extrabold text-bts-green-400">
                  {formatFcfa(priceXof)}
                </p>
              </div>
              <p className="text-sm text-white/80 sm:text-right">
                Volume : {formatVolume(cubicMeter)}
              </p>
            </div>
            {pricing.isError && (
              <p role="alert" className="mt-3 text-sm text-white">
                Les tarifs n’ont pas pu être chargés. Rechargez la page pour obtenir une estimation.
              </p>
            )}
            <p className="mt-4 border-t border-white/15 pt-4 text-xs text-white/65">
              Estimation indicative. Le prix final est établi après mesure du colis en entrepôt.
            </p>
          </output>
        </form>
      </div>
    </section>
  );
}
