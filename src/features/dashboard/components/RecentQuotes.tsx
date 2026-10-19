import { Search } from 'lucide-react';
import { Quote } from '@/types';
import { formatDate, formatPrice } from '@/utils/formatters';

interface RecentQuotesProps {
  quotes: Quote[];
  search: string;
  setSearch: (value: string) => void;
  onViewAll: () => void;
  onNewCalculation: () => void;
}

export function RecentQuotes({
  quotes,
  search,
  setSearch,
  onViewAll,
  onNewCalculation,
}: RecentQuotesProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#003366]">
            Dernières opérations enregistrées
          </h3>
          <p className="text-xs text-slate-500">
            Aperçu des 5 expéditions les plus récentes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer client ou ville..."
              className="w-36 bg-transparent outline-none placeholder:text-slate-400 sm:w-48"
            />
          </div>

          <button
            onClick={onViewAll}
            className="flex items-center rounded-md px-2 py-1.5 text-xs font-semibold text-[#003366] hover:bg-slate-50"
          >
            <span>Historique complet</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        {quotes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Aucune opération récente trouvée.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotes.slice(0, 5).map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between py-3 text-xs"
              >
                <div className="min-w-0 pr-4">
                  <p className="font-semibold text-slate-800 truncate">
                    {quote.recipient_name}
                  </p>
                  <p className="text-slate-500 truncate">
                    {quote.destination} • {quote.cubic_meter.toFixed(3)} m³ • {quote.weight_kg} kg
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-['Space_Grotesk'] text-sm font-bold text-[#003366]">
                    {formatPrice(quote.final_price)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(quote.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 text-right">
        <button
          onClick={onNewCalculation}
          className="inline-flex items-center text-xs font-semibold text-[#058441] hover:underline"
        >
          <span>Effectuer une nouvelle cotation</span>
        </button>
      </div>
    </div>
  );
}
