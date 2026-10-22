import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppNotification, NewNotification } from '@/types';
import { notificationsApi } from '@/api/endpoints/notifications.api';
import type { NotificationsContextValue } from './NotificationsContext';
import { NotificationsContext } from './NotificationsContext';

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    notificationsApi
      .getNotifications()
      .then((loaded) => {
        if (!cancelled) setNotifications(loaded);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const push = useCallback(async (input: NewNotification) => {
    const created = await notificationsApi.createNotification(input);
    setNotifications((previous) => [created, ...previous]);
    return created;
  }, []);

  const setRead = useCallback(async (ids: string[], read: boolean) => {
    if (ids.length === 0) return;
    const targets = new Set(ids);
    // Mise à jour immédiate de l'affichage ; l'appel API suit.
    setNotifications((previous) =>
      previous.map((notification) =>
        targets.has(notification.id) ? { ...notification, read } : notification
      )
    );
    await notificationsApi.setRead(ids, read);
  }, []);

  const markAllAsRead = useCallback(
    () =>
      setRead(
        notifications
          .filter((notification) => !notification.read)
          .map((notification) => notification.id),
        true
      ),
    [notifications, setRead]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      loading,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      push,
      setRead,
      markAllAsRead,
    }),
    [notifications, loading, push, setRead, markAllAsRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
