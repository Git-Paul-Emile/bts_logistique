import { useState } from 'react';
import { Link2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Package } from '@/types';
import { trackingPath } from '@/router/paths';

interface TrackingShareActionsProps {
  pkg: Package;
  onSend: (pkg: Package) => Promise<void>;
  onNotify: (message: string) => void;
}

export function TrackingShareActions({ pkg, onSend, onNotify }: TrackingShareActionsProps) {
  const [sending, setSending] = useState(false);
  const trackingUrl = `${window.location.origin}${trackingPath(pkg.tracking_number)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      onNotify('Lien de suivi copié. Vous pouvez le coller dans un SMS ou un message.');
    } catch {
      onNotify(`Copie impossible depuis ce navigateur. Lien à transmettre : ${trackingUrl}`);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(pkg);
    } finally {
      setSending(false);
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
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" icon={<Link2 size={14} />} onClick={handleCopy}>
          Copier le lien de suivi
        </Button>
        <Button size="sm" icon={<Send size={14} />} loading={sending} onClick={handleSend}>
          Envoyer au client par e-mail
        </Button>
      </div>
    </div>
  );
}
