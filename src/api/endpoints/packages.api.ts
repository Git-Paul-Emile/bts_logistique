// Colis : appels à /packages et traduction des réponses vers le type Package du front.
import { getData, getPage, http, type Page } from '@/api/client';
import type {
  Package,
  PackageStatus,
  PackageUpdateInput,
  PaymentMethod,
  PaymentStatus,
  StatusUpdateInput,
  TransportMode,
} from '@/types';

type Place = { code: string; name: string };

interface PackageDto {
  id: string;
  tracking_number: string;
  client: { id: string; name: string };
  agency: Place;
  collector: { id: string; name: string } | null;
  shipment_id: string | null;
  description: string | null;
  transport_mode: TransportMode;
  origin: Place;
  destination: Place;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  cubic_meter: number;
  rate_per_cbm: number;
  final_price: number;
  collector_margin: number;
  status: PackageStatus;
  payment_status: PaymentStatus;
  amount_paid: number;
  created_at: string;
  updated_at: string;
}

interface PackageEventDto {
  id: string;
  status: PackageStatus;
  location: Place | null;
  location_detail: string | null;
  comment: string | null;
  agent: { id: string; name: string } | null;
  created_at: string;
}

type PackageDetailDto = PackageDto & { events: PackageEventDto[] };

/** Étape enregistrée sans agent : créée par le système (enregistrement, import). */
const SYSTEM_AGENT = 'Système';

function toPackage(dto: PackageDto | PackageDetailDto): Package {
  return {
    id: dto.id,
    tracking_number: dto.tracking_number,
    client_id: dto.client.id,
    client_name: dto.client.name,
    description: dto.description ?? undefined,
    origin: dto.origin.name,
    destination: dto.destination.name,
    origin_code: dto.origin.code,
    destination_code: dto.destination.code,
    agency_name: dto.agency.name,
    collector_name: dto.collector?.name,
    shipment_id: dto.shipment_id ?? undefined,
    length_cm: dto.length_cm,
    width_cm: dto.width_cm,
    height_cm: dto.height_cm,
    weight_kg: dto.weight_kg,
    cubic_meter: dto.cubic_meter,
    coefficient: dto.rate_per_cbm,
    final_price: dto.final_price,
    transport_mode: dto.transport_mode,
    collector_margin: dto.collector_margin,
    status: dto.status,
    payment_status: dto.payment_status,
    amount_paid: dto.amount_paid,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    events:
      'events' in dto
        ? dto.events.map((event) => ({
            id: event.id,
            status: event.status,
            location: event.location_detail ?? event.location?.name,
            comment: event.comment ?? undefined,
            agent_name: event.agent?.name ?? SYSTEM_AGENT,
            created_at: event.created_at,
          }))
        : undefined,
  };
}

export type PackageSort =
  | 'created_at'
  | '-created_at'
  | 'final_price'
  | '-final_price'
  | 'tracking_number'
  | '-tracking_number';

export interface PackageListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PackageStatus;
  payment_status?: PaymentStatus;
  transport_mode?: TransportMode;
  client_id?: string;
  sort?: PackageSort;
}

export interface NewPackageInput {
  client_id: string;
  origin_code: string;
  destination_code: string;
  transport_mode: TransportMode;
  description?: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  /** Tarif personnalisé : équipe seulement. */
  rate_per_cbm?: number;
  initial_payment?: { amount: number; method: PaymentMethod; reference?: string };
}

export const packagesApi = {
  async list(params: PackageListParams): Promise<Page<Package>> {
    const page = await getPage<PackageDto>(http.get('/packages', { params }));
    return { items: page.items.map(toPackage), meta: page.meta };
  },

  async get(id: string): Promise<Package> {
    return toPackage(await getData<PackageDetailDto>(http.get(`/packages/${id}`)));
  },

  async create(input: NewPackageInput): Promise<Package> {
    return toPackage(await getData<PackageDto>(http.post('/packages', input)));
  },

  async update(id: string, changes: PackageUpdateInput): Promise<Package> {
    return toPackage(await getData<PackageDto>(http.patch(`/packages/${id}`, changes)));
  },

  async addEvent(id: string, input: StatusUpdateInput): Promise<Package> {
    const body = {
      status: input.status,
      location: input.location,
      comment: input.comment ?? '',
      notify_client: input.notifyClient,
    };
    return toPackage(await getData<PackageDetailDto>(http.post(`/packages/${id}/events`, body)));
  },

  /** L'e-mail part en différé : le serveur l'a mis dans sa boîte d'envoi. */
  async sendTrackingEmail(id: string): Promise<void> {
    await http.post(`/packages/${id}/tracking-email`);
  },
};
