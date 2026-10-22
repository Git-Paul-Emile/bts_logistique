import { Calculator } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';

interface QuoteSummaryPanelProps {
  volume: number;
  coefficient: number;
  weight: number;
  price: number;
}

/** Volet du calculateur qui affiche le volume et le prix au fil de la saisie. */
export function QuoteSummaryPanel({ volume, coefficient, weight, price }: QuoteSummaryPanelProps) {
  return (
    <div className="lg:col-span-5">
      <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5">
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
            <span className="font-semibold text-slate-800">
              {weight > 0 ? `${weight} kg` : '-'}
            </span>
          </div>

          <div className="my-2 border-t border-slate-100 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
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
  );
}
