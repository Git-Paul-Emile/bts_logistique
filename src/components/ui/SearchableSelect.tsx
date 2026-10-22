import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/classNames';
import { useSearchableSelect } from './useSearchableSelect';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  /** Texte secondaire affiché sous le libellé (téléphone, détail…). */
  hint?: string;
  /** Textes supplémentaires pris en compte par la recherche, sans être affichés. */
  keywords?: readonly string[];
}

interface SearchableSelectProps<T extends string> {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** « sm » pour les filtres compacts au-dessus des listes. */
  size?: 'sm' | 'md';
  className?: string;
  error?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function SearchableSelect<T extends string>({
  id,
  value,
  onChange,
  options,
  placeholder = 'Sélectionner…',
  searchPlaceholder = 'Rechercher…',
  emptyMessage = 'Aucun résultat pour cette recherche.',
  size = 'md',
  className,
  error,
  disabled = false,
  'aria-label': ariaLabel,
}: SearchableSelectProps<T>) {
  const {
    triggerId,
    listboxId,
    errorId,
    open,
    query,
    setQuery,
    activeIndex,
    setActiveIndex,
    openUpward,
    containerRef,
    triggerRef,
    searchRef,
    listRef,
    selected,
    filtered,
    activeOptionId,
    openList,
    close,
    choose,
    handleTriggerKeyDown,
    handleListKeyDown,
  } = useSearchableSelect({ id, value, onChange, options, disabled });

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left font-medium text-slate-800 focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60',
          size === 'sm' ? 'py-2 text-xs' : 'py-2.5 text-sm',
          error ? 'border-red-500' : 'border-slate-300',
          className
        )}
      >
        <span className={cn('truncate', !selected && 'text-slate-400')}>
          {selected ? selected.label : placeholder}
          {selected?.hint && <span className="ml-1 text-slate-500">• {selected.hint}</span>}
        </span>
        <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 left-0 z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg',
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          <div className="relative border-b border-slate-100 p-2">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-label={searchPlaceholder}
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleListKeyDown}
              placeholder={searchPlaceholder}
              autoComplete="off"
              className="w-full rounded-md border border-slate-200 py-2 pr-3 pl-8 text-sm text-slate-900 focus:border-[#003366] focus:outline-hidden"
            />
          </div>
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            className="max-h-60 overflow-y-auto py-1 focus:outline-hidden"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(option)}
                    className={cn(
                      'flex cursor-pointer items-start justify-between gap-2 px-3 py-2 text-sm',
                      index === activeIndex ? 'bg-slate-100' : '',
                      isSelected ? 'font-semibold text-[#003366]' : 'text-slate-800'
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.hint && (
                        <span className="block truncate text-xs font-normal text-slate-500">
                          {option.hint}
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
