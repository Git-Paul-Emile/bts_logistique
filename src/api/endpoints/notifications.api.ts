import { Client, NotificationLog, Package } from '@/types';

const NOTIFICATIONS_STORAGE_KEY = 'bts_notifications';

function loadStoredNotifications(): NotificationLog[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotificationLog[]) : [];
  } catch {
    return [];
  }
}

// Simulation en attendant le back : le front ne fait que mettre l'e-mail en file.
// L'envoi réel, les nouvelles tentatives et le passage à "Envoyé" ou "Échec" seront faits côté serveur.
export const notificationsApi = {
  async getNotifications(): Promise<NotificationLog[]> {
    return loadStoredNotifications();
  },

  async queueStatusNotification(pkg: Package, client: Client | undefined): Promise<NotificationLog> {
    const email = client?.email?.trim();
    const entry: NotificationLog = {
      id: `ntf-${Date.now()}`,
      package_id: pkg.id,
      tracking_number: pkg.tracking_number,
      client_name: pkg.client_name,
      recipient_email: email || undefined,
      package_status: pkg.status,
      delivery: email ? 'queued' : 'skipped',
      reason: email ? undefined : 'Aucune adresse e-mail sur la fiche client.',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([entry, ...loadStoredNotifications()]));
    return entry;
  },
};
