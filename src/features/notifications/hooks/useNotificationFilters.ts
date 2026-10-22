import { useMemo, useState } from 'react';
import type { AppNotification, NotificationCategory } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

export type ReadFilter = 'all' | 'unread' | 'read';
export type CategoryFilter = 'all' | NotificationCategory;

function matchesSearch(notification: AppNotification, term: string): boolean {
  if (!term) return true;
  const haystack =
    `${notification.title} ${notification.message} ${notification.tracking_number ?? ''}`.toLowerCase();
  return haystack.includes(term);
}

export function useNotificationFilters(notifications: AppNotification[]) {
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const debouncedSearch = useDebounce(search.trim().toLowerCase());

  const visible = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          (readFilter === 'all' ||
            (readFilter === 'unread' ? !notification.read : notification.read)) &&
          (category === 'all' || notification.category === category) &&
          matchesSearch(notification, debouncedSearch)
      ),
    [notifications, readFilter, category, debouncedSearch]
  );

  const counts = useMemo(() => {
    const unread = notifications.filter((notification) => !notification.read).length;
    return { all: notifications.length, unread, read: notifications.length - unread };
  }, [notifications]);

  const hasActiveFilters = Boolean(debouncedSearch) || readFilter !== 'all' || category !== 'all';
  const resetFilters = () => {
    setSearch('');
    setReadFilter('all');
    setCategory('all');
  };

  return {
    search,
    setSearch,
    readFilter,
    setReadFilter,
    category,
    setCategory,
    visible,
    counts,
    hasActiveFilters,
    resetFilters,
  };
}
