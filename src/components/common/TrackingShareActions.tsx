import { useState } from 'react';
import { Link2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { useSendTrackingEmail } from '@/features/packages/hooks/usePackages';
import { errorMessage } from '@/lib/errorMessage';
import type { Package } from '@/types';
import { trackingPath } from '@/router/paths';

/** Lien public de suivi : copie pour un SMS, ou envoi par e-mail à l'adresse du client. */
export function TrackingShareActions({ pkg }: { pkg: Package }) {
  const [error, setError] = useState('');
  const sendTrackingEmail = useSendTrackingEmail();
  const notify = useNotify();
  const trackingUrl = `${window.location.origin}${trackingPath(pkg.tracking_number)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      notify('Lien de suivi copié. Vous pouvez le coller dans un SMS ou un message.');
    } catch {
      notify(`Copie impossible depuis ce navigateur. Lien à transmettre : ${trackingUrl}`);
    }
  };

  const handleSend = async () => {
    setError('');
    try {
      await sendTrackingEmail.mutateAsync(pkg.id);
      notify(`E-mail de suivi de ${pkg.tracking_number} en cours d’envoi.`);
    } catch (sendError) {
      setError(errorMessage(sendError, 'L’e-mail n’a pas pu être préparé. Réessayez.'));
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="mb-4 border-b pb-3 text-sm font-semibold text-slate-800">
        Transmettre le suivi au client
      </h3>
      <p className="rounded-md bg-slate-50 px-3 py-2 font-mono text-xs break-all text-slate-700">
        {trackingUrl}
      </p>
      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" icon={<Link2 size={14} />} onClick={handleCopy}>
          Copier le lien de suivi
        </Button>
        <Button
          size="sm"
          icon={<Send size={14} />}
          loading={sendTrackingEmail.isPending}
          onClick={handleSend}
        >
          Envoyer au client par e-mail
        </Button>
      </div>
    </div>
  );
}
