import { useState } from 'react';
import { Package, PackageStatus, PACKAGE_STATUS_LABELS, StatusUpdateHandler } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';


interface UpdateStatusModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: StatusUpdateHandler;
}

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: 'registered', label: 'Enregistré en entrepôt' },
  { value: 'in_transit', label: 'En transit (En mer / En vol)' },
  { value: 'arrived', label: 'Arrivé à destination (Entrepôt local)' },
  { value: 'delivered', label: 'Livré au destinataire' },
  { value: 'on_hold', label: 'En attente / Retenu douane' },
  { value: 'returned', label: 'Retourné à l\'expéditeur' },
  { value: 'cancelled', label: 'Annulé' },
];

export function UpdateStatusModal({
  pkg,
  isOpen,
  onClose,
  onUpdate,
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus>(pkg?.status ?? 'registered');
  const [location, setLocation] = useState(pkg?.destination ?? '');
  const [comment, setComment] = useState('');
  const [agentName, setAgentName] = useState('Thomas Lefèvre (Gestionnaire)');
  const [notifyClient, setNotifyClient] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(pkg.id, selectedStatus, location, comment, agentName, notifyClient);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mise à jour du statut : ${pkg.tracking_number}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Nouveau statut du colis *
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PackageStatus)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Emplacement / Étape géographique *
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: Entrepôt Abidjan Treichville, Port d'Abidjan..."
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Commentaire opérationnel / Observation
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Ex: Dédouanement terminé sans incident. Colis prêt pour remise en agence."
            className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 shadow-sm focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Agent responsable
          </label>
          <Input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            id="notifyClient"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
          />
          <label htmlFor="notifyClient" className="cursor-pointer">
            Notifier le client par e-mail ({pkg.client_name || 'Client'})
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Valider le changement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
