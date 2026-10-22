import { useState } from 'react';
import type { Shipment } from '@/types';
import { BTS_DESTINATIONS, BTS_ORIGINS } from '@/types';
import { validateShipmentInput } from '@/utils/validators';

/** Capacité proposée à la création : conteneur maritime 40 pieds HQ, ou lot de fret aérien. */
export const DEFAULT_CAPACITY_CBM: Record<Shipment['type'], number> = { sea: 68, air: 15 };

export type NewShipmentData = Omit<Shipment, 'id' | 'created_at'>;

/** État, validation et enregistrement du formulaire « Nouveau conteneur / lot ». */
export function useNewShipmentForm(
  onCreate: (data: NewShipmentData) => Promise<Shipment>,
  onClose: () => void
) {
  const [containerNumber, setContainerNumber] = useState('');
  const [type, setType] = useState<Shipment['type']>('sea');
  const [origin, setOrigin] = useState(BTS_ORIGINS[0]);
  const [destination, setDestination] = useState(BTS_DESTINATIONS[0]);
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
        type,
        origin,
        destination,
        status: 'loading',
        carrier: carrier.trim(),
        departure_date: departureDate || undefined,
        estimated_arrival: estimatedArrival || undefined,
        max_volume_cbm: maxVolume,
        current_volume_cbm: 0,
        package_ids: [],
        notes,
      });
      onClose();
      setContainerNumber('');
      setCarrier('');
      setNotes('');
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
