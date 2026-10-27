// Clients : appels à /clients et traduction des réponses vers le type Client du front.
import { getData, getPage, http, type Page } from '@/api/client';
import type {
  Client,
  ClientUpdateInput,
  NewClientInput,
  PackageStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/types';

type Place = { code: string; name: string };

interface ClientDto {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  agency: Place;
  created_at: string;
  /** Absents pour un collecteur : le serveur ne lui envoie aucune donnée financière. */
  total_billed?: number;
  amount_paid?: number;
  balance?: number;
  has_debt?: boolean;
  package_count?: number;
}

export interface ClientPackageSummary {
  id: string;
  tracking_number: string;
  status: PackageStatus;
  payment_status: PaymentStatus;
  final_price: number;
  amount_paid: number;
  origin: Place;
  destination: Place;
  created_at: string;
}

export interface ClientPaymentSummary {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  reverses_payment_id: string | null;
  allocations: { package_id: string; tracking_number: string; amount: number }[];
  created_at: string;
}

export interface ClientDetail {
  client: Client;
  recentPackages: ClientPackageSummary[];
  recentPayments: ClientPaymentSummary[];
}

function toClient(dto: ClientDto): Client {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    email: dto.email ?? undefined,
    address: dto.address ?? undefined,
    agency_code: dto.agency.code,
    agency_name: dto.agency.name,
    total_billed: dto.total_billed ?? 0,
    amount_paid: dto.amount_paid ?? 0,
    balance: dto.balance ?? 0,
    has_debt: dto.has_debt ?? false,
    package_count: dto.package_count ?? 0,
    created_at: dto.created_at,
  };
}

/**
 * Seuls les champs fournis sont envoyés (un import ne complète que des cases vides).
 * Une chaîne vide efface un champ facultatif côté serveur.
 */
function toClientBody(input: Partial<ClientUpdateInput>) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

export type ClientSort = 'name' | '-name' | 'created_at' | '-created_at' | 'balance' | '-balance';

export interface ClientListParams {
  page?: number;
  limit?: number;
  search?: string;
  has_debt?: boolean;
  sort?: ClientSort;
}

export const clientsApi = {
  async list(params: ClientListParams): Promise<Page<Client>> {
    const page = await getPage<ClientDto>(http.get('/clients', { params }));
    return { items: page.items.map(toClient), meta: page.meta };
  },

  /** Fiche détaillée : équipe seulement (montants, colis et paiements récents). */
  async get(id: string): Promise<ClientDetail> {
    const body = await getData<{
      client: ClientDto;
      recent_packages: ClientPackageSummary[];
      recent_payments: ClientPaymentSummary[];
    }>(http.get(`/clients/${id}`));
    return {
      client: toClient(body.client),
      recentPackages: body.recent_packages,
      recentPayments: body.recent_payments,
    };
  },

  async create(input: NewClientInput): Promise<Client> {
    return toClient(await getData<ClientDto>(http.post('/clients', toClientBody(input))));
  },

  async update(id: string, changes: Partial<ClientUpdateInput>): Promise<Client> {
    return toClient(await getData<ClientDto>(http.patch(`/clients/${id}`, toClientBody(changes))));
  },
};
