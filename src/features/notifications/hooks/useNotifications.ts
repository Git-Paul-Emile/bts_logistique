import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationListParams } from '@/api/endpoints/notifications.api';
import { queryKeys } from '@/api/queryKeys';

/** La pastille de la cloche est rafraîchie toutes les 30 secondes, et au retour sur l'onglet. */
const UNREAD_POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.unreadCount,
    queryFn: notificationsApi.unreadCount,
    refetchInterval: UNREAD_POLL_INTERVAL_MS,
    staleTime: 0,
  });
}

export function useNotificationList(params: NotificationListParams, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.notifications, 'list', params],
    queryFn: () => notificationsApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Marquer lu ou non lu. Les listes et la pastille sont relues ensuite. */
export function useNotificationActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications });

  const setRead = useMutation({
    mutationFn: ({ ids, read }: { ids: string[]; read: boolean }) =>
      notificationsApi.setRead(ids, read),
    onSettled: refresh,
  });
  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSettled: refresh,
  });

  return {
    setRead: (ids: string[], read: boolean) => setRead.mutateAsync({ ids, read }),
    markAllAsRead: () => markAllRead.mutateAsync(),
  };
}
