import { Search } from 'lucide-react';
import { QuoteList } from '@/features/quotes/components/QuoteList';
import type { Quote } from '@/types';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import type { QuoteImportItem } from '@/features/import/definitions/quotes.import';
import { quotesImport } from '@/features/import/definitions/quotes.import';
import type { ImportBatch } from '@/features/import/importTypes';

interface HistoryPageProps {
  quotes: Quote[];
  search: string;
  setSearch: (value: string) => void;
  /** Prix du m³ appliqué aux calculs importés. */
  coefficient: number;
  onImportQuotes: (batch: ImportBatch<QuoteImportItem, never>) => Promise<void>;
}

export function HistoryPage({
  quotes,
  search,
  setSearch,
  coefficient,
  onImportQuotes,
}: HistoryPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">
            Historique des calculs
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Consultation et recherche des estimations enregistrées.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ImportExcelButton
            definition={quotesImport}
            getContext={() => ({ coefficient })}
            onImport={onImportQuotes}
          />
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-transparent text-xs text-slate-800 outline-hidden placeholder:text-slate-400 sm:w-64"
              placeholder="Rechercher par destinataire ou ville..."
            />
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <QuoteList quotes={quotes} />
      </section>
    </div>
  );
}
