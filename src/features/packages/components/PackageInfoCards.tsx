import { MapPin, User } from 'lucide-react';
import type { Package } from '@/types';
import { TRANSPORT_MODE_LABELS } from '@/types';
import { formatPrice, formatVolume } from '@/utils/formatters';

/** Carte « Informations d'Expédition » : client, trajet et contenu. */
export function PackageShippingCard({ pkg }: { pkg: Package }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="mb-4 border-b pb-3 text-sm font-semibold text-slate-800">
        Informations d'Expédition
      </h3>

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase">
            <User size={14} /> Client Destinataire
          </div>
          <p className="text-sm font-bold text-slate-800">{pkg.client_name || 'Client comptoir'}</p>
          <p className="mt-1 text-slate-500">
            ID Client : <span className="font-mono">{pkg.client_id}</span>
          </p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase">
            <MapPin size={14} /> Acheminement
          </div>
          <p className="text-slate-700">
            Origine : <span className="font-bold">{pkg.origin}</span>
          </p>
          <p className="mt-0.5 text-slate-700">
            Destination : <span className="font-bold text-[#003366]">{pkg.destination}</span>
          </p>
        </div>
      </div>

      {pkg.description && (
        <div className="mt-4 rounded-lg border bg-slate-50 p-3 text-xs text-slate-700">
          <span className="mb-0.5 block text-[10px] font-bold text-slate-500 uppercase">
            Nature de la marchandise :
          </span>
          {pkg.description}
        </div>
      )}
    </div>
  );
}

function Measure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <span className="block text-[10px] font-semibold text-slate-400 uppercase">{label}</span>
      <span className="mt-1 block text-sm font-bold text-slate-800">{children}</span>
    </div>
  );
}

/** Carte « Cubage, Poids & Détail Financier » : mesures, prix et reste à payer. */
export function PackageMeasuresCard({ pkg, remaining }: { pkg: Package; remaining: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="mb-4 border-b pb-3 text-sm font-semibold text-slate-800">
        Cubage, Poids & Détail Financier
      </h3>

      <div className="grid grid-cols-2 gap-3 text-center text-xs sm:grid-cols-4">
        <Measure label="Dimensions">
          {pkg.length_cm} × {pkg.width_cm} × {pkg.height_cm} cm
        </Measure>
        <div className="rounded-lg border border-[#003366]/20 bg-[#003366]/5 p-3">
          <span className="block text-[10px] font-bold text-[#003366] uppercase">Volume</span>
          <span className="mt-1 block text-base font-extrabold text-[#003366]">
            {formatVolume(pkg.cubic_meter)}
          </span>
        </div>
        <Measure label="Poids Brut">{pkg.weight_kg} kg</Measure>
        <Measure
          label={`Tarif ${TRANSPORT_MODE_LABELS[pkg.transport_mode ?? 'sea'].toLowerCase()}`}
        >
          {formatPrice(pkg.coefficient)}/m³
        </Measure>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[11px] text-slate-500 uppercase">Prix Total F CFA</span>
            <p className="text-lg font-bold text-slate-800">{formatPrice(pkg.final_price)}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase">Montant Encaissé</span>
            <p className="text-lg font-bold text-emerald-600">{formatPrice(pkg.amount_paid)}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase">Solde Reste Dû</span>
            <p className="text-lg font-extrabold text-amber-600">{formatPrice(remaining)}</p>
          </div>
        </div>
        {pkg.collector_margin !== undefined && (
          <p className="mt-3 border-t border-slate-200 pt-3 text-center text-xs text-slate-600">
            Dont marge collecteur :{' '}
            <span className="font-bold text-[#058441]">{formatPrice(pkg.collector_margin)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
