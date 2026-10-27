import { Mail, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AppNotification } from '@/types';
import { NOTIFICATION_DELIVERY_LABELS } from '@/types';
import { NotificationItemContent } from './NotificationItemContent';

interface NotificationRowProps {
  notification: AppNotification;
  onOpen: () => void;
  onToggleRead: () => void;
}

/** Ligne de la page Notifications : contenu, état d'envoi de l'e-mail et lecture. */
export function NotificationRow({ notification, onOpen, onToggleRead }: NotificationRowProps) {
  return (
    <li
      className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start ${notification.read ? '' : 'bg-[#003366]/3'}`}
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={!notification.package_id}
        className="flex min-w-0 flex-1 text-left disabled:cursor-default"
        aria-label={
          notification.package_id
            ? `${notification.title}, ouvrir le colis ${notification.tracking_number}`
            : undefined
        }
      >
        <NotificationItemContent notification={notification} />
      </button>
      <div className="flex shrink-0 items-center gap-3">
        {notification.delivery && (
          <span className="text-xs font-semibold text-slate-500">
            {NOTIFICATION_DELIVERY_LABELS[notification.delivery]}
          </span>
        )}
        <Button
          size="sm"
          variant="ghost"
          icon={notification.read ? <Mail size={14} /> : <MailOpen size={14} />}
          onClick={onToggleRead}
        >
          {notification.read ? 'Marquer non lue' : 'Marquer lue'}
        </Button>
      </div>
    </li>
  );
}
