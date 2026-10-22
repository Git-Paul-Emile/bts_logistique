import type { KeyboardEvent } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { matchesSearch } from '@/utils/search';
import type { SelectOption } from './SearchableSelect';

const LIST_MAX_HEIGHT_PX = 288;

interface SearchableSelectOptions<T extends string> {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  disabled: boolean;
}

/**
 * Comportement de la liste déroulante avec recherche : ouverture vers le haut ou le bas,
 * filtrage, navigation au clavier, fermeture au clic extérieur.
 */
export function useSearchableSelect<T extends string>({
  id,
  value,
  onChange,
  options,
  disabled,
}: SearchableSelectOptions<T>) {
  const generatedId = useId();
  const triggerId = id ?? `select-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const errorId = `${triggerId}-error`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(
    () =>
      options.filter((option) =>
        matchesSearch(query, [option.label, option.hint ?? '', ...(option.keywords ?? [])])
      ),
    [options, query]
  );

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function openList() {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    const spaceBelow = rect ? window.innerHeight - rect.bottom : LIST_MAX_HEIGHT_PX;
    setOpenUpward(
      Boolean(rect) && spaceBelow < LIST_MAX_HEIGHT_PX && (rect?.top ?? 0) > spaceBelow
    );
    setQuery('');
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === value)
      )
    );
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function choose(option: SelectOption<T>) {
    onChange(option.value);
    close(true);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(filtered.length - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const option = filtered[activeIndex];
        if (option) choose(option);
        break;
      }
      case 'Escape':
        // Ferme seulement la liste, pas la fenêtre qui la contient.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
    }
  }

  const activeOptionId = filtered[activeIndex] ? `${listboxId}-${activeIndex}` : undefined;

  return {
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
  };
}
