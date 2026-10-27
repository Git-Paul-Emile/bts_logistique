import { useState } from 'react';
import type { NewShipmentInput } from '@/api/endpoints/shipments.api';
import { errorMessage } from '@/lib/errorMessage';
import type { NetworkLocation, Shipment } from '@/types';
import { validateShipmentInput } from '@/utils/validators';

/** Capacité proposée à la création : conteneur maritime 40 pieds HQ, ou lot de fret aérien. */
export const DEFAULT_CAPACITY_CBM: Record<Shipment['type'], number> = { sea: 68, air: 15 };

interface NewShipmentFormOptions {
  origins: readonly NetworkLocation[];
  destinations: readonly NetworkLocation[];
  onCreate: (input: NewShipmentInput) => Promise<unknown>;
  onClose: () => void;
}

/** État, validation et enregistrement du formulaire « Nouveau conteneur / lot ». */
export function useNewShipmentForm({
  origins,
  destinations,
  onCreate,
  onClose,
}: NewShipmentFormOptions) {
  const [containerNumber, setContainerNumber] = useState('');
  const [type, setType] = useState<Shipment['type']>('sea');
  const [origin, setOrigin] = useState(origins[0]?.code ?? '');
  const [destination, setDestination] = useState(destinations[0]?.code ?? '');
  const [carrier, setCarrier] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [maxVolume, setMaxVolume] = useState<number>(DEFAULT_CAPACITY_CBM.sea);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) => setErrors((previous) => ({ ...previous, [field]: '' }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateShipmentInput({
      container_number: containerNumber,
      carrier,
      max_volume_cbm: maxVolume,
      departure_date: departureDate,
      estimated_arrival: estimatedArrival,
    });
    setErrors(validation.errors);
    if (!validation.isValid) return;
    setIsSubmitting(true);
    try {
      await onCreate({
        container_number: containerNumber.trim(),
        transport_mode: type,
        origin_code: origin,
        destination_code: destination,
        carrier: carrier.trim(),
        departure_date: departureDate || undefined,
        estimated_arrival: estimatedArrival || undefined,
        max_volume_cbm: maxVolume,
        notes: notes.trim() || undefined,
      });
      onClose();
      setContainerNumber('');
      setCarrier('');
      setNotes('');
    } catch (error) {
      setErrors({ form: errorMessage(error, 'Le lot n’a pas pu être créé. Réessayez.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    containerNumber,
    setContainerNumber,
    type,
    setType,
    origin,
    setOrigin,
    destination,
    setDestination,
    carrier,
    setCarrier,
    departureDate,
    setDepartureDate,
    estimatedArrival,
    setEstimatedArrival,
    maxVolume,
    setMaxVolume,
    notes,
    setNotes,
    isSubmitting,
    errors,
    clearError,
    handleCreate,
  };
}
