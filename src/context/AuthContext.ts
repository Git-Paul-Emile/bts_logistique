import { createContext } from 'react';
import type { ProfileUpdateInput, UserSession } from '@/types';

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (changes: ProfileUpdateInput) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  /** Message à afficher sur la page de connexion après une déconnexion imposée (compte supprimé). */
  signOutNotice: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
