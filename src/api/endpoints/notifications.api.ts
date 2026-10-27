// Notifications du personnel : appels à /notifications. Elles sont créées par le serveur
// (colis, paiements, e-mails) ; le front ne fait que les lire et les marquer.
import { getData, getPage, http, type Page } from '@/api/client';
import type { AppNotification, NotificationCategory, NotificationDelivery } from '@/types';

interface NotificationDto {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  package: { id: string; tracking_number: string } | null;
  delivery: NotificationDelivery | null;
  read: boolean;
  created_at: string;
}

function toNotification(dto: NotificationDto): AppNotification {
  return {
    id: dto.id,
    category: dto.category,
    title: dto.title,
    message: dto.message,
    package_id: dto.package?.id,
    tracking_number: dto.package?.tracking_number,
    delivery: dto.delivery ?? undefined,
    read: dto.read,
    created_at: dto.created_at,
  };
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: NotificationCategory;
  read?: boolean;
}

export const notificationsApi = {
  async list(params: NotificationListParams): Promise<Page<AppNotification>> {
    const page = await getPage<NotificationDto>(http.get('/notifications', { params }));
    return { items: page.items.map(toNotification), meta: page.meta };
  },

  async unreadCount(): Promise<number> {
    return (await getData<{ count: number }>(http.get('/notifications/unread-count'))).count;
  },

  async setRead(ids: string[], read: boolean): Promise<void> {
    await http.patch('/notifications/read', { ids, read });
  },

  async markAllRead(): Promise<void> {
    await http.post('/notifications/read-all');
  },
};
