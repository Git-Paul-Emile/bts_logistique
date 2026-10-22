import type { Quote } from '@/types';
import { formatDate, formatPrice } from '@/utils/formatters';

interface QuoteListProps {
  quotes: Quote[];
  emptyMessage?: string;
}

export function QuoteList({
  quotes,
  emptyMessage = 'Aucun enregistrement ne correspond à votre recherche.',
}: QuoteListProps) {
  if (quotes.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            <th className="px-3 py-2.5">Date</th>
            <th className="px-3 py-2.5">Destinataire</th>
            <th className="px-3 py-2.5">Destination</th>
            <th className="px-3 py-2.5 text-right">Dimensions (cm)</th>
            <th className="px-3 py-2.5 text-right">Poids</th>
            <th className="px-3 py-2.5 text-right">Volume</th>
            <th className="px-3 py-2.5 text-right">Tarif appliqué</th>
            <th className="px-3 py-2.5 text-right">Montant</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {quotes.map((quote) => (
            <tr key={quote.id} className="transition hover:bg-slate-50/80">
              <td className="px-3 py-3 text-xs text-slate-500">{formatDate(quote.created_at)}</td>
              <td className="px-3 py-3 font-semibold text-slate-800">{quote.recipient_name}</td>
              <td className="px-3 py-3 text-xs text-slate-600">{quote.destination}</td>
              <td className="px-3 py-3 text-right font-mono text-xs text-slate-600">
                {quote.length_cm} × {quote.width_cm} × {quote.height_cm}
              </td>
              <td className="px-3 py-3 text-right text-xs text-slate-600">{quote.weight_kg} kg</td>
              <td className="px-3 py-3 text-right text-xs font-semibold text-slate-800">
                {quote.cubic_meter.toFixed(3)} m³
              </td>
              <td className="px-3 py-3 text-right text-xs text-slate-500">
                {quote.coefficient.toFixed(2)} F CFA/m³
              </td>
              <td className="px-3 py-3 text-right font-['Space_Grotesk'] text-sm font-bold text-[#003366]">
                {formatPrice(quote.final_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
