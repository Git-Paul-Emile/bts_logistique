import { createContext } from 'react';
import type { ProfileUpdateResult } from '@/api/endpoints/auth.api';
import type { LoginCredentials } from '@/api/types/auth.types';
import type { ProfileUpdateInput, UserSession } from '@/types';

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  /** Vrai pendant la vérification de la session au chargement de l'application. */
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (changes: ProfileUpdateInput) => Promise<ProfileUpdateResult>;
  deleteAccount: (password: string) => Promise<void>;
  /** Message à afficher sur la page de connexion après une déconnexion imposée. */
  signOutNotice: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
