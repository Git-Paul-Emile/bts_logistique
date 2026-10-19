import { UserSession } from '@/types';

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
