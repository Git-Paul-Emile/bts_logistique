import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';

interface TrackingFormProps {
  initialValue?: string;
  onSubmit: (trackingNumber: string) => void;
  loading?: boolean;
}

const TRACKING_INPUT_ID = 'tracking-number';
const TRACKING_ERROR_ID = 'tracking-number-error';
const EMPTY_ERROR = 'Saisissez le numéro inscrit sur votre reçu, par exemple BTS-CI-2026-0089.';

export function TrackingForm({ initialValue = '', onSubmit, loading = false }: TrackingFormProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError(EMPTY_ERROR);
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} noValidate role="search" aria-label="Suivi de colis">
      <label htmlFor={TRACKING_INPUT_ID} className="block text-sm font-semibold text-bts-blue">
        Numéro de suivi
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={TRACKING_INPUT_ID}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => {
              setError('');
              setValue(event.target.value);
            }}
            placeholder="BTS-CI-2026-0089"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? TRACKING_ERROR_ID : undefined}
            className="h-12 w-full rounded-md border border-slate-300 pl-10 pr-3 font-code text-sm uppercase text-bts-dark placeholder:normal-case placeholder:text-slate-400 focus:border-bts-blue focus:outline-none focus:ring-2 focus:ring-bts-blue/20 aria-[invalid=true]:border-red-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-md bg-bts-green px-6 text-sm font-semibold text-white transition-colors hover:bg-bts-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bts-green disabled:opacity-70"
        >
          {loading ? 'Recherche en cours...' : 'Suivre mon colis'}
        </button>
      </div>
      {error && (
        <p id={TRACKING_ERROR_ID} role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
