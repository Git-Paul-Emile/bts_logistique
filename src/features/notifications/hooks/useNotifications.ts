import { useEffect, useState } from 'react';
import { NotificationLog } from '@/types';
import { notificationsApi } from '@/api/endpoints/notifications.api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
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

  return { notifications, loading };
}
