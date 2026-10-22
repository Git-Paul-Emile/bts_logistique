import type { UserSession } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserSession;
  token: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
