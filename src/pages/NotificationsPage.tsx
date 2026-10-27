import { BellOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/common/Loader';
import { NotificationRow } from '@/features/notifications/components/NotificationRow';
import {
  useNotificationActions,
  useUnreadCount,
} from '@/features/notifications/hooks/useNotifications';
import type {
  CategoryFilter,
  ReadFilter,
} from '@/features/notifications/hooks/useNotificationFilters';
import { useNotificationFilters } from '@/features/notifications/hooks/useNotificationFilters';
import type { AppNotification, NotificationCategory } from '@/types';
import { NOTIFICATION_CATEGORY_LABELS } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import type { SelectOption } from '@/components/ui/SearchableSelect';

interface NotificationsPageProps {
  onOpenPackage: (packageId: string) => void;
}

const READ_TABS: { value: ReadFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'unread', label: 'Non lues' },
  { value: 'read', label: 'Lues' },
];

const CATEGORY_OPTIONS: SelectOption<CategoryFilter>[] = [
  { value: 'all', label: 'Toutes les catégories' },
  ...(Object.keys(NOTIFICATION_CATEGORY_LABELS) as NotificationCategory[]).map((category) => ({
    value: category,
    label: NOTIFICATION_CATEGORY_LABELS[category],
  })),
];

export function NotificationsPage({ onOpenPackage }: NotificationsPageProps) {
  const unreadCount = useUnreadCount().data ?? 0;
  const { setRead, markAllAsRead } = useNotificationActions();
  const filters = useNotificationFilters();
  const loading = filters.list.isPending;
  const visible = filters.list.data?.items ?? [];

  const openNotification = (notification: AppNotification) => {
    if (!notification.read) void setRead([notification.id], true);
    if (notification.package_id) onOpenPackage(notification.package_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">
            Notifications
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Colis enregistrés, changements de statut, paiements et e-mails envoyés aux clients.
          </p>
        </div>
        <Button variant="outline" onClick={() => void markAllAsRead()} disabled={unreadCount === 0}>
          Tout marquer comme lu
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="notification-search"
            className="mb-1 block text-xs font-semibold text-slate-700"
          >
            Rechercher
          </label>
          <div className="relative">
            <Search
              size={16}
              aria-hidden="true"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <input
              id="notification-search"
              type="search"
              value={filters.search}
              onChange={(event) => filters.setSearch(event.target.value)}
              placeholder="N° de suivi, client, e-mail..."
              className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-hidden"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="notification-category"
            className="mb-1 block text-xs font-semibold text-slate-700"
          >
            Catégorie
          </label>
          <div className="w-full lg:w-48">
            <SearchableSelect<CategoryFilter>
              id="notification-category"
              size="sm"
              value={filters.category}
              onChange={filters.setCategory}
              options={CATEGORY_OPTIONS}
            />
          </div>
        </div>
        <div
          role="group"
          aria-label="Filtrer par état de lecture"
          className="flex rounded-md border border-slate-300 p-0.5"
        >
          {READ_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={filters.readFilter === tab.value}
              onClick={() => filters.setReadFilter(tab.value)}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                filters.readFilter === tab.value
                  ? 'bg-[#003366] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.value === 'unread' ? `${tab.label} (${unreadCount})` : tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loader label="Chargement des notifications..." />}

      {filters.list.isError && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          Les notifications n’ont pas pu être chargées. Vérifiez votre connexion puis rechargez la
          page.
        </p>
      )}

      {!loading && !filters.list.isError && visible.length === 0 && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <BellOff size={28} aria-hidden="true" className="text-slate-400" />
          <p className="mt-3 font-semibold text-slate-700">
            {filters.hasActiveFilters
              ? 'Aucune notification ne correspond à ces filtres'
              : 'Aucune notification pour le moment'}
          </p>
          {filters.hasActiveFilters && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={filters.resetFilters}>
              Effacer les filtres
            </Button>
          )}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <ul
          className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white"
          aria-live="polite"
        >
          {visible.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onOpen={() => openNotification(notification)}
              onToggleRead={() => void setRead([notification.id], !notification.read)}
            />
          ))}
        </ul>
      )}

      <Pagination
        meta={filters.list.data?.meta}
        onPageChange={filters.setPage}
        itemLabel="notifications"
      />
    </div>
  );
}
