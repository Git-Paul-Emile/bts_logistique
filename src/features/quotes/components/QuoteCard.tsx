import { Package } from 'lucide-react';
import { Quote } from '@/types';
import { formatDate, formatPrice } from '@/utils/formatters';

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs transition hover:border-[#003366]/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-[#003366]">
            <Package size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{quote.recipient_name}</h4>
            <p className="text-xs text-slate-500">{quote.destination}</p>
          </div>
        </div>
        <span className="font-['Space_Grotesk'] text-sm font-bold text-[#003366]">
          {formatPrice(quote.final_price)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
        <span>{quote.cubic_meter.toFixed(3)} m³ • {quote.weight_kg} kg</span>
        <span>{formatDate(quote.created_at)}</span>
      </div>
    </div>
  );
}
