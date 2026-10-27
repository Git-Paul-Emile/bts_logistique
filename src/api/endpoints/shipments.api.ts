// Conteneurs et lots : appels à /shipments.
import { getData, getPage, http, type Page } from '@/api/client';
import type { Shipment, ShipmentStatus, TransportMode } from '@/types';

type Place = { code: string; name: string };

interface ShipmentDto {
  id: string;
  container_number: string;
  transport_mode: TransportMode;
  carrier: string;
  status: ShipmentStatus;
  origin: Place;
  destination: Place;
  max_volume_cbm: number;
  current_volume_cbm: number;
  package_count: number;
  departure_date: string | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  notes: string | null;
  created_at: string;
}

function toShipment(dto: ShipmentDto): Shipment {
  return {
    id: dto.id,
    container_number: dto.container_number,
    type: dto.transport_mode,
    origin: dto.origin.name,
    destination: dto.destination.name,
    origin_code: dto.origin.code,
    destination_code: dto.destination.code,
    status: dto.status,
    carrier: dto.carrier,
    departure_date: dto.departure_date ?? undefined,
    estimated_arrival: dto.estimated_arrival ?? undefined,
    actual_arrival: dto.actual_arrival ?? undefined,
    max_volume_cbm: dto.max_volume_cbm,
    current_volume_cbm: dto.current_volume_cbm,
    package_count: dto.package_count,
    notes: dto.notes ?? undefined,
    created_at: dto.created_at,
  };
}

export interface ShipmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShipmentStatus;
  transport_mode?: TransportMode;
  sort?: 'created_at' | '-created_at' | 'departure_date' | '-departure_date';
}

export interface NewShipmentInput {
  container_number: string;
  transport_mode: TransportMode;
  carrier: string;
  origin_code: string;
  destination_code: string;
  max_volume_cbm: number;
  departure_date?: string;
  estimated_arrival?: string;
  notes?: string;
}

/** Compléments apportés par un import Excel : seules des cases vides sont remplies. */
export type ShipmentUpdateInput = Partial<
  Pick<NewShipmentInput, 'departure_date' | 'estimated_arrival' | 'notes'>
>;

export const shipmentsApi = {
  async list(params: ShipmentListParams): Promise<Page<Shipment>> {
    const page = await getPage<ShipmentDto>(http.get('/shipments', { params }));
    return { items: page.items.map(toShipment), meta: page.meta };
  },

  async create(input: NewShipmentInput): Promise<Shipment> {
    return toShipment(await getData<ShipmentDto>(http.post('/shipments', input)));
  },

  async update(id: string, changes: ShipmentUpdateInput): Promise<Shipment> {
    return toShipment(await getData<ShipmentDto>(http.patch(`/shipments/${id}`, changes)));
  },
};
