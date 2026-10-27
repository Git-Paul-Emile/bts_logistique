// Comptes du personnel : appels à /users (administrateur seulement).
import { getData, getPage, http, type Page } from '@/api/client';
import type { AppUser, AppUserInput, UserRole } from '@/types';

interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  agency: { code: string; name: string };
  active: boolean;
  invitation_pending: boolean;
  created_at: string;
  archived_at: string | null;
}

function toAppUser(dto: UserDto): AppUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? undefined,
    role: dto.role,
    agency: dto.agency.name,
    agency_code: dto.agency.code,
    active: dto.active,
    invitation_pending: dto.invitation_pending,
    created_at: dto.created_at,
    archived_at: dto.archived_at ?? undefined,
  };
}

/**
 * Seuls les champs fournis sont envoyés (un import ne complète que des cases vides).
 * Une chaîne vide efface le téléphone côté serveur.
 */
function toUserBody(input: Partial<AppUserInput>) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  archived?: boolean;
  role?: UserRole;
}

export const usersApi = {
  async list(params: UserListParams): Promise<Page<AppUser>> {
    const page = await getPage<UserDto>(http.get('/users', { params }));
    return { items: page.items.map(toAppUser), meta: page.meta };
  },

  /** Crée le compte et envoie l'e-mail d'invitation : la personne choisit son mot de passe. */
  async invite(input: AppUserInput): Promise<AppUser> {
    return toAppUser(await getData<UserDto>(http.post('/users', toUserBody(input))));
  },

  async update(id: string, input: Partial<AppUserInput>): Promise<AppUser> {
    return toAppUser(await getData<UserDto>(http.patch(`/users/${id}`, toUserBody(input))));
  },

  async setActive(id: string, active: boolean): Promise<AppUser> {
    return toAppUser(await getData<UserDto>(http.patch(`/users/${id}/status`, { active })));
  },

  async restore(id: string): Promise<AppUser> {
    return toAppUser(await getData<UserDto>(http.post(`/users/${id}/restore`)));
  },
};
