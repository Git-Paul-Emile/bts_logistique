import { useMemo, useState } from 'react';
import { BellOff } from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { formatDateTime } from '@/utils/formatDate';
import {
  NOTIFICATION_DELIVERY_LABELS,
  NotificationDelivery,
  PACKAGE_STATUS_LABELS,
} from '@/types';

type DeliveryFilter = 'all' | NotificationDelivery;

const DELIVERY_STYLES: Record<NotificationDelivery, string> = {
  queued: 'text-amber-700',
  sent: 'text-emerald-700',
  failed: 'text-red-700',
  skipped: 'text-slate-500',
};

const FILTERS = ['all', ...Object.keys(NOTIFICATION_DELIVERY_LABELS)] as DeliveryFilter[];

export function NotificationsPage() {
  const { notifications, loading } = useNotifications();
  const [filter, setFilter] = useState<DeliveryFilter>('all');

  const visible = useMemo(
    () => (filter === 'all' ? notifications : notifications.filter((entry) => entry.delivery === filter)),
    [filter, notifications]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">Journal des notifications</h2>
          <p className="mt-0.5 text-sm text-slate-600">
            E-mails envoyés aux clients à chaque changement de statut d’un colis.
          </p>
        </div>
        <div>
          <label htmlFor="delivery-filter" className="mb-1 block text-xs font-semibold text-slate-700">
            Afficher
          </label>
          <select
            id="delivery-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as DeliveryFilter)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {FILTERS.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'Toutes les notifications' : NOTIFICATION_DELIVERY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <Loader label="Chargement du journal..." />}

      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <BellOff size={28} aria-hidden="true" className="text-slate-400" />
          <p className="mt-3 font-semibold text-slate-700">Aucune notification pour le moment</p>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Une notification est créée quand vous changez le statut d’un colis en laissant cochée l’option
            « Notifier le client par e-mail ».
          </p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                <th scope="col" className="px-4 py-3 font-semibold">Colis</th>
                <th scope="col" className="px-4 py-3 font-semibold">Destinataire</th>
                <th scope="col" className="px-4 py-3 font-semibold">Statut annoncé</th>
                <th scope="col" className="px-4 py-3 font-semibold">Envoi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(entry.created_at)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-[#003366]">{entry.tracking_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800">{entry.client_name ?? 'Client inconnu'}</p>
                    <p className="text-xs text-slate-500">{entry.recipient_email ?? 'Pas d’adresse e-mail'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{PACKAGE_STATUS_LABELS[entry.package_status]}</td>
                  <td className="px-4 py-3">
                    <p className={`font-semibold ${DELIVERY_STYLES[entry.delivery]}`}>
                      {NOTIFICATION_DELIVERY_LABELS[entry.delivery]}
                    </p>
                    {entry.reason && <p className="text-xs text-slate-500">{entry.reason}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
