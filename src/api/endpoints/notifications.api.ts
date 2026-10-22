import type { AppNotification, NewNotification } from '@/types';
import { reportError } from '@/lib/reportError';

const NOTIFICATIONS_STORAGE_KEY = 'bts_notifications_v2';

// Notifications de démonstration, cohérentes avec les colis et paiements de démonstration.
const initialNotifications: AppNotification[] = [
  {
    id: 'ntf-seed-3',
    category: 'package',
    title: 'Nouveau colis enregistré',
    message: 'Quincaillerie du Fleuve (M. Traoré), Guangzhou vers Bamako.',
    package_id: 'pkg-3',
    tracking_number: 'BTS-ML-2026-0015',
    read: false,
    created_at: '2026-10-18T09:10:00Z',
  },
  {
    id: 'ntf-seed-2',
    category: 'payment',
    title: 'Paiement reçu',
    message: 'Boutique Touba Textile (Mme Diop) a réglé 154 980 F CFA.',
    package_id: 'pkg-2',
    tracking_number: 'BTS-SN-2026-0042',
    read: false,
    created_at: '2026-10-17T11:30:00Z',
  },
  {
    id: 'ntf-seed-1',
    category: 'package',
    title: 'Colis arrivé à destination',
    message: 'Arrivé à l’entrepôt BTS de Dakar.',
    package_id: 'pkg-2',
    tracking_number: 'BTS-SN-2026-0042',
    read: true,
    created_at: '2026-10-17T11:20:00Z',
  },
];

function loadStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : initialNotifications;
  } catch (error) {
    reportError('notifications.api : loadStoredNotifications', error);
    return initialNotifications;
  }
}

function saveNotifications(notifications: AppNotification[]): void {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
}

// Simulation en attendant le back. Côté serveur, les notifications seront créées par les
// services métier (colis, paiements, envoi d'e-mails) et l'état lu / non lu sera propre à chaque utilisateur.
export const notificationsApi = {
  async getNotifications(): Promise<AppNotification[]> {
    return loadStoredNotifications();
  },

  async createNotification(input: NewNotification): Promise<AppNotification> {
    const created: AppNotification = {
      ...input,
      id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    saveNotifications([created, ...loadStoredNotifications()]);
    return created;
  },

  async setRead(ids: string[], read: boolean): Promise<void> {
    const targets = new Set(ids);
    saveNotifications(
      loadStoredNotifications().map((notification) =>
        targets.has(notification.id) ? { ...notification, read } : notification
      )
    );
  },
};
