import { AlertCircle, Check, MapPin, Printer } from 'lucide-react';
import type { PublicTracking } from '@/api/endpoints/tracking.api';
import { PACKAGE_STATUS_LABELS } from '@/types';
import { formatDate, formatDateTime, formatVolume } from '@/utils/formatters';
import { TRACKING_STEPS } from '../portal.content';
import { getTrackingStep } from '../hooks/usePackageTracking';

interface TrackingResultProps {
  searchedCode: string;
  pkg: PublicTracking | null;
}

export function TrackingResult({ searchedCode, pkg }: TrackingResultProps) {
  return (
    <div aria-live="polite">
      {pkg ? <PackageDetails pkg={pkg} /> : <NotFound code={searchedCode} />}
    </div>
  );
}

function NotFound({ code }: { code: string }) {
  return (
    <div className="flex gap-4 rounded-lg border border-red-200 bg-red-50 p-6">
      <AlertCircle size={24} aria-hidden="true" className="mt-0.5 shrink-0 text-red-600" />
      <div>
        <p className="font-display text-base font-bold text-bts-dark">
          Aucun colis ne correspond au numéro{' '}
          <span className="font-code">{code.toUpperCase()}</span>
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Vérifiez chaque caractère du numéro inscrit sur votre reçu. Si le problème persiste,
          contactez l’agence BTS Logistique de votre pays.
        </p>
      </div>
    </div>
  );
}

function PackageDetails({ pkg }: { pkg: PublicTracking }) {
  const currentStep = getTrackingStep(pkg.status);
  const progressPercent = ((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100;
  const specs = [
    { label: 'Origine', value: pkg.origin },
    { label: 'Destination', value: pkg.destination },
    { label: 'Volume et poids', value: `${formatVolume(pkg.cubic_meter)}, ${pkg.weight_kg} kg` },
    { label: 'Dimensions', value: `${pkg.length_cm} x ${pkg.width_cm} x ${pkg.height_cm} cm` },
  ];

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-xs ring-1 ring-slate-200">
      <header className="flex flex-col gap-4 bg-bts-blue-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-bts-green-400">Numéro de suivi</p>
          <h3 className="mt-1 font-code text-2xl font-semibold">{pkg.tracking_number}</h3>
          <p className="mt-1 text-sm text-white/70">
            Enregistré le {formatDate(pkg.created_at)}, destinataire : {pkg.recipient_initials}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-bts-green px-3 py-1.5 text-sm font-semibold">
            {PACKAGE_STATUS_LABELS[pkg.status]}
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Imprimer la fiche de suivi"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/30 hover:bg-white/10"
          >
            <Printer size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="px-6 pt-8 pb-2">
        <div className="relative">
          <div
            className="absolute top-[15px] right-[12.5%] left-[12.5%] h-1 rounded-sm bg-slate-200"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-sm bg-bts-green"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <ol className="relative grid grid-cols-4">
            {TRACKING_STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const isDone = stepNumber <= currentStep;
              const isCurrent = stepNumber === currentStep;
              return (
                <li
                  key={step.key}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="flex flex-col items-center text-center"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isDone
                        ? 'bg-bts-green text-white'
                        : 'border-2 border-slate-300 bg-white text-slate-500'
                    } ${isCurrent ? 'ring-4 ring-bts-green-100' : ''}`}
                  >
                    {isDone ? <Check size={16} aria-hidden="true" /> : stepNumber}
                  </span>
                  <span
                    className={`mt-2 text-xs sm:text-sm ${isDone ? 'font-semibold text-bts-blue' : 'text-slate-500'}`}
                  >
                    {step.label}
                    {isDone && <span className="sr-only"> (étape franchie)</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <dl className="mx-6 mt-6 grid grid-cols-2 gap-4 rounded-md bg-bts-canvas p-4 lg:grid-cols-4">
        {specs.map((spec) => (
          <div key={spec.label}>
            <dt className="text-xs text-slate-500">{spec.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-bts-dark">{spec.value}</dd>
          </div>
        ))}
      </dl>

      <div className="p-6">
        <h4 className="font-display text-base font-bold text-bts-blue">
          Historique d’acheminement
        </h4>
        {pkg.events && pkg.events.length > 0 ? (
          <ol className="mt-4 border-l-2 border-slate-200 pl-6">
            {pkg.events.map((event, index) => (
              <li key={`${event.date}-${index}`} className="relative pb-5 last:pb-0">
                <span
                  className={`absolute top-1 left-[-31px] h-3 w-3 rounded-full ring-4 ring-white ${
                    index === 0 ? 'bg-bts-green' : 'bg-slate-300'
                  }`}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="text-sm font-semibold text-bts-dark">
                    {PACKAGE_STATUS_LABELS[event.status] ?? event.status}
                  </p>
                  <time dateTime={event.date} className="text-xs text-slate-500">
                    {formatDateTime(event.date)}
                  </time>
                </div>
                {event.location && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-bts-blue">
                    <MapPin size={14} aria-hidden="true" /> {event.location}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Aucun événement enregistré pour le moment.</p>
        )}
      </div>
    </article>
  );
}
