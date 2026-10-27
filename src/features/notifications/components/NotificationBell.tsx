import { useCallback, useRef, useState } from 'react';
import { useDismiss } from '@/hooks/useDismiss';
import { Bell } from 'lucide-react';
import type { AppNotification } from '@/types';
import {
  useNotificationActions,
  useNotificationList,
  useUnreadCount,
} from '../hooks/useNotifications';
import { NotificationItemContent } from './NotificationItemContent';

const PREVIEW_LIMIT = 6;
const BADGE_MAX = 9;
const PANEL_ID = 'notifications-panel';

interface NotificationBellProps {
  onOpenPackage: (packageId: string) => void;
  onOpenAll: () => void;
}

export function NotificationBell({ onOpenPackage, onOpenAll }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount().data ?? 0;
  // Les dernières notifications ne sont chargées qu'à l'ouverture du panneau.
  const preview = useNotificationList({ limit: PREVIEW_LIMIT }, open);
  const { setRead, markAllAsRead } = useNotificationActions();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const latest = preview.data?.items ?? [];

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, containerRef, buttonRef);

  const handleSelect = (notification: AppNotification) => {
    void setRead([notification.id], true);
    setOpen(false);
    if (notification.package_id) onOpenPackage(notification.package_id);
  };

  const badgeLabel = unreadCount > BADGE_MAX ? `${BADGE_MAX}+` : String(unreadCount);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non ${unreadCount > 1 ? 'lues' : 'lue'}`
            : 'Notifications'
        }
        className="relative rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-label="Dernières notifications"
          className="fixed inset-x-4 top-16 z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="font-['Space_Grotesk'] text-sm font-bold text-[#003366]">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold whitespace-nowrap text-[#003366] hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {preview.isPending ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">Chargement...</p>
          ) : preview.isError ? (
            <p role="alert" className="px-4 py-8 text-center text-sm text-red-700">
              Les notifications n’ont pas pu être chargées.
            </p>
          ) : latest.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Aucune notification pour le moment.
            </p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
              {latest.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(notification)}
                    className={`flex w-full px-4 py-3 text-left transition hover:bg-slate-50 ${notification.read ? '' : 'bg-[#003366]/3'}`}
                  >
                    <NotificationItemContent notification={notification} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenAll();
            }}
            className="block w-full border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-[#003366] hover:bg-slate-50"
          >
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
}
