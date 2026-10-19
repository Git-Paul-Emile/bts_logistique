import { LoginCredentials, AuthResponse, ResetPasswordPayload } from '@/api/types/auth.types';
import { UserSession } from '@/types';

const AUTH_TOKEN_KEY = 'bts_auth_token';
const SIMULATED_LATENCY_MS = 300;

const DEFAULT_USER: UserSession = {
  id: 'usr_default',
  name: 'Thomas Lefèvre',
  email: 'thomas.lefevre@bts-logistique.fr',
  role: 'Gestionnaire transport',
  initials: 'TL',
};

function simulateLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
}

// Simulation en attendant le back : les mêmes signatures seront branchées sur l'API réelle.
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await simulateLatency();
    return {
      user: { ...DEFAULT_USER, email: credentials.email || DEFAULT_USER.email },
      token: 'jwt_mock_token_bts_logistique',
    };
  },

  async getCurrentUser(): Promise<UserSession | null> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token ? DEFAULT_USER : null;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  // Le serveur répond toujours de la même façon, que l'adresse existe ou non,
  // pour ne pas révéler quels comptes existent.
  async requestPasswordReset(email: string): Promise<void> {
    void email;
    await simulateLatency();
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    void payload;
    await simulateLatency();
  },
};

export { AUTH_TOKEN_KEY };
