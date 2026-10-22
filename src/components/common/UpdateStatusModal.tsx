import { useState } from 'react';
import type { Package, PackageStatus, StatusUpdateHandler } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface UpdateStatusModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: StatusUpdateHandler;
}

interface StatusFormErrors {
  location?: string;
  agentName?: string;
}

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: 'registered', label: 'Enregistré en entrepôt' },
  { value: 'in_transit', label: 'En transit (En mer / En vol)' },
  { value: 'arrived', label: 'Arrivé à destination (Entrepôt local)' },
  { value: 'delivered', label: 'Livré au destinataire' },
  { value: 'on_hold', label: 'En attente / Retenu douane' },
  { value: 'returned', label: "Retourné à l'expéditeur" },
  { value: 'cancelled', label: 'Annulé' },
];

export function UpdateStatusModal({ pkg, isOpen, onClose, onUpdate }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus>(pkg?.status ?? 'registered');
  const [location, setLocation] = useState(pkg?.destination ?? '');
  const [comment, setComment] = useState('');
  const [agentName, setAgentName] = useState('Thomas Lefèvre (Gestionnaire)');
  const [notifyClient, setNotifyClient] = useState(true);
  const [errors, setErrors] = useState<StatusFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: StatusFormErrors = {};
    if (!location.trim()) {
      nextErrors.location = 'Indiquez où se trouve le colis, par exemple « Port d’Abidjan ».';
    }
    if (!agentName.trim()) {
      nextErrors.agentName = 'Indiquez le nom de l’agent qui fait la mise à jour.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
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
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="package-status"
            className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
          >
            Nouveau statut du colis *
          </label>
          <SearchableSelect
            id="package-status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
          />
        </div>

        <div>
          <label
            htmlFor="status-location"
            className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
          >
            Emplacement / Étape géographique *
          </label>
          <Input
            id="status-location"
            value={location}
            error={errors.location}
            onChange={(e) => {
              setErrors((previous) => ({ ...previous, location: undefined }));
              setLocation(e.target.value);
            }}
            placeholder="Ex: Entrepôt Abidjan Treichville, Port d'Abidjan..."
          />
        </div>

        <div>
          <label
            htmlFor="status-comment"
            className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
          >
            Commentaire opérationnel / Observation
          </label>
          <textarea
            id="status-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Ex: Dédouanement terminé sans incident. Colis prêt pour remise en agence."
            className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 shadow-xs focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-hidden"
          />
        </div>

        <div>
          <label
            htmlFor="status-agent"
            className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
          >
            Agent responsable *
          </label>
          <Input
            id="status-agent"
            value={agentName}
            error={errors.agentName}
            onChange={(e) => {
              setErrors((previous) => ({ ...previous, agentName: undefined }));
              setAgentName(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            id="notifyClient"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            className="h-4 w-4 rounded-sm border-slate-300 text-[#003366] focus:ring-[#003366]"
          />
          <label htmlFor="notifyClient" className="cursor-pointer">
            Notifier le client par e-mail ({pkg.client_name || 'Client'})
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t pt-3">
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
