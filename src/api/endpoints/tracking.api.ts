// Suivi public d'un colis : ce qu'un visiteur qui connaît le numéro peut voir, sans connexion.
import { ApiError, getData, http } from '@/api/client';
import type { PackageStatus, TransportMode } from '@/types';

type Place = { code: string; name: string };

export interface PublicTrackingEvent {
  status: PackageStatus;
  /** Lieu décrit par l'agent, ou à défaut la ville du réseau. */
  location?: string;
  date: string;
}

export interface PublicTracking {
  tracking_number: string;
  status: PackageStatus;
  transport_mode: TransportMode;
  /** Initiales seulement : le nom complet du destinataire n'est pas public. */
  recipient_initials: string;
  origin: string;
  destination: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  cubic_meter: number;
  created_at: string;
  /** Du plus récent au plus ancien. */
  events: PublicTrackingEvent[];
}

interface PublicTrackingDto extends Omit<PublicTracking, 'origin' | 'destination' | 'events'> {
  origin: Place;
  destination: Place;
  events: {
    status: PackageStatus;
    location: Place | null;
    location_detail: string | null;
    date: string;
  }[];
}

export const trackingApi = {
  /** null quand aucun colis ne porte ce numéro. */
  async find(trackingNumber: string): Promise<PublicTracking | null> {
    try {
      const dto = await getData<PublicTrackingDto>(
        http.get(`/tracking/${encodeURIComponent(trackingNumber)}`)
      );
      return {
        ...dto,
        origin: dto.origin.name,
        destination: dto.destination.name,
        events: dto.events.map((event) => ({
          status: event.status,
          location: event.location_detail ?? event.location?.name,
          date: event.date,
        })),
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
