import { Button } from '@/components/ui/Button';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { SelectOption } from '@/components/ui/SearchableSelect';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import type { NewShipmentInput } from '@/api/endpoints/shipments.api';
import { locationOptions } from '@/features/locations/useLocations';
import type { NetworkLocation, Shipment } from '@/types';
import { DEFAULT_CAPACITY_CBM, useNewShipmentForm } from '../hooks/useNewShipmentForm';

const FREIGHT_TYPE_OPTIONS: SelectOption<Shipment['type']>[] = [
  { value: 'sea', label: 'Maritime (Conteneur)' },
  { value: 'air', label: 'Aérien (Vol Cargo)' },
];

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NewShipmentInput) => Promise<unknown>;
  origins: readonly NetworkLocation[];
  destinations: readonly NetworkLocation[];
}

/** Fenêtre « Nouveau conteneur / lot ». La saisie est conservée si la fenêtre est fermée. */
export function NewShipmentModal({
  isOpen,
  onClose,
  onCreate,
  origins,
  destinations,
}: NewShipmentModalProps) {
  const form = useNewShipmentForm({ origins, destinations, onCreate, onClose });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un nouveau lot de groupage / Conteneur"
      maxWidth="xl"
    >
      <form onSubmit={form.handleCreate} noValidate className="space-y-4">
        {form.errors.form && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {form.errors.form}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="shipment-type">Type de fret *</FieldLabel>
            <SearchableSelect
              id="shipment-type"
              value={form.type}
              onChange={(t) => {
                form.setType(t);
                form.setMaxVolume(DEFAULT_CAPACITY_CBM[t]);
              }}
              options={FREIGHT_TYPE_OPTIONS}
            />
          </div>
          <div>
            <FieldLabel htmlFor="shipment-number">N° Conteneur / Vol *</FieldLabel>
            <Input
              id="shipment-number"
              value={form.containerNumber}
              error={form.errors.container_number}
              onChange={(e) => {
                form.clearError('container_number');
                form.setContainerNumber(e.target.value);
              }}
              placeholder="Ex: MSKU-998811-4"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="shipment-origin">Hub de Départ *</FieldLabel>
            <SearchableSelect
              id="shipment-origin"
              value={form.origin}
              onChange={form.setOrigin}
              options={locationOptions(origins)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="shipment-destination">Port / Hub d'Arrivée *</FieldLabel>
            <SearchableSelect
              id="shipment-destination"
              value={form.destination}
              onChange={form.setDestination}
              options={locationOptions(destinations)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="shipment-carrier">Compagnie / Transporteur *</FieldLabel>
            <Input
              id="shipment-carrier"
              value={form.carrier}
              error={form.errors.carrier}
              onChange={(e) => {
                form.clearError('carrier');
                form.setCarrier(e.target.value);
              }}
              placeholder="Ex: Maersk, CMA CGM, Ethiopian..."
            />
          </div>
          <div>
            <FieldLabel htmlFor="shipment-capacity">Capacité Max (m³) *</FieldLabel>
            <Input
              id="shipment-capacity"
              type="number"
              inputMode="decimal"
              value={form.maxVolume}
              error={form.errors.max_volume_cbm}
              onChange={(e) => {
                form.clearError('max_volume_cbm');
                form.setMaxVolume(Number(e.target.value));
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="shipment-departure">Date départ prévue</FieldLabel>
            <Input
              id="shipment-departure"
              type="date"
              value={form.departureDate}
              onChange={(e) => form.setDepartureDate(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="shipment-arrival">Date d'arrivée estimée</FieldLabel>
            <Input
              id="shipment-arrival"
              type="date"
              value={form.estimatedArrival}
              error={form.errors.estimated_arrival}
              onChange={(e) => {
                form.clearError('estimated_arrival');
                form.setEstimatedArrival(e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="shipment-notes">Notes & Scellés</FieldLabel>
          <textarea
            id="shipment-notes"
            value={form.notes}
            onChange={(e) => form.setNotes(e.target.value)}
            rows={2}
            placeholder="Numéro de scellé, instructions spéciales..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={form.isSubmitting}>
            {form.isSubmitting ? 'Création...' : 'Créer le lot'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
