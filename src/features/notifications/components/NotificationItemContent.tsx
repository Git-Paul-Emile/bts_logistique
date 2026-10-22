import type { AppNotification } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatDate';

interface NotificationItemContentProps {
  notification: AppNotification;
}

/** Contenu d'une notification, partagé par la cloche et la page complète. */
export function NotificationItemContent({ notification }: NotificationItemContentProps) {
  return (
    <div className="flex min-w-0 flex-1 gap-3">
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${notification.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}
        >
          {notification.title}
          {!notification.read && <span className="sr-only"> (non lue)</span>}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">{notification.message}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          {notification.tracking_number && (
            <span className="font-mono font-semibold text-[#003366]">
              {notification.tracking_number}
            </span>
          )}
          <time dateTime={notification.created_at} title={formatDateTime(notification.created_at)}>
            {formatRelativeTime(notification.created_at)}
          </time>
        </p>
      </div>
      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#058441]" aria-hidden="true" />
      )}
    </div>
  );
}
