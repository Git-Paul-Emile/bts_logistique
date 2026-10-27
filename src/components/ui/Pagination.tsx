import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/api/client';
import { Button } from './Button';

interface PaginationProps {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  /** Nom des éléments au pluriel, pour le texte « 42 colis ». */
  itemLabel: string;
}

/** Pagination des listes renvoyées par l'API : précédent, suivant et position. */
export function Pagination({ meta, onPageChange, itemLabel }: PaginationProps) {
  if (!meta || meta.total <= meta.limit) return null;
  const pageCount = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row"
    >
      <p className="text-sm text-slate-600">
        Page {meta.page} sur {pageCount}, {meta.total} {itemLabel}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<ChevronLeft size={14} />}
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Précédente
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Suivante
          <ChevronRight size={14} aria-hidden="true" className="ml-1" />
        </Button>
      </div>
    </nav>
  );
}
