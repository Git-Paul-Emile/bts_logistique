import { useState } from 'react';
import type { NotificationCategory } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useNotificationList } from './useNotifications';

export type ReadFilter = 'all' | 'unread' | 'read';
export type CategoryFilter = 'all' | NotificationCategory;

const PAGE_SIZE = 20;

/** Filtres de la page Notifications, appliqués par le serveur. */
export function useNotificationFilters() {
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim());

  const list = useNotificationList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category: category === 'all' ? undefined : category,
    read: readFilter === 'all' ? undefined : readFilter === 'read',
  });

  // Tout changement de filtre ramène à la première page.
  const withFirstPage =
    <Value>(setter: (value: Value) => void) =>
    (value: Value) => {
      setter(value);
      setPage(1);
    };

  const hasActiveFilters = Boolean(debouncedSearch) || readFilter !== 'all' || category !== 'all';
  const resetFilters = () => {
    setSearch('');
    setReadFilter('all');
    setCategory('all');
    setPage(1);
  };

  return {
    search,
    setSearch: withFirstPage(setSearch),
    readFilter,
    setReadFilter: withFirstPage(setReadFilter),
    category,
    setCategory: withFirstPage(setCategory),
    setPage,
    list,
    hasActiveFilters,
    resetFilters,
  };
}
