import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type PackageDocument = 'label' | 'receipt';

const ITEM_CLASS =
  'flex w-full flex-row items-center gap-2 px-3 py-2 text-left text-xs whitespace-nowrap text-slate-700 hover:bg-slate-50';

/** Bouton « Documents » : ouvre l'étiquette d'expédition ou le reçu de dépôt. */
export function PackageDocumentsMenu({ onOpen }: { onOpen: (document: PackageDocument) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const choose = (document: PackageDocument) => {
    onOpen(document);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex flex-row items-center gap-1.5 text-xs whitespace-nowrap text-white hover:text-white"
      >
        <Printer size={15} className="shrink-0" />
        <span>Documents</span>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </Button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 w-max min-w-[200px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button type="button" onClick={() => choose('label')} className={ITEM_CLASS}>
            <Printer size={14} className="shrink-0" />
            <span>Étiquette d'expédition</span>
          </button>
          <button type="button" onClick={() => choose('receipt')} className={ITEM_CLASS}>
            <FileText size={14} className="shrink-0" />
            <span>Reçu de dépôt</span>
          </button>
        </div>
      )}
    </div>
  );
}
