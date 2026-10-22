import { useContext } from 'react';
import type { NotificationsContextValue } from '../context/NotificationsContext';
import { NotificationsContext } from '../context/NotificationsContext';

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationsProvider');
  }
  return context;
}
