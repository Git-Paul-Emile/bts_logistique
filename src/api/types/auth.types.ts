import type { UserRole } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Jeton reçu par e-mail et mot de passe choisi (réinitialisation ou invitation). */
export interface TokenPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/** Personne connectée, telle que l'API la renvoie. */
export interface SessionUserDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  agency: { code: string; name: string };
  initials: string;
}

export interface SessionDto {
  user: SessionUserDto;
  csrf_token: string;
}
