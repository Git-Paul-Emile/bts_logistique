import { createContext } from 'react';
import type { AppNotification, NewNotification } from '@/types';

export interface NotificationsContextValue {
  notifications: AppNotification[];
  loading: boolean;
  unreadCount: number;
  push: (input: NewNotification) => Promise<AppNotification>;
  setRead: (ids: string[], read: boolean) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
