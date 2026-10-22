import type {
  LoginCredentials,
  AuthResponse,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from '@/api/types/auth.types';
import type { AppUser, ProfileUpdateInput, UserSession } from '@/types';
import { usersApi } from '@/api/endpoints/users.api';

const AUTH_TOKEN_KEY = 'bts_auth_token';
const MOCK_TOKEN_PREFIX = 'mock-token:';
const SIMULATED_LATENCY_MS = 300;

export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

function simulateLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function toSession({ active, created_at, archived_at, ...account }: AppUser): UserSession {
  void active;
  void created_at;
  void archived_at;
  return { ...account, initials: getInitials(account.name) };
}

function getSessionUserId(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token?.startsWith(MOCK_TOKEN_PREFIX) ? token.slice(MOCK_TOKEN_PREFIX.length) : null;
}

// Simulation en attendant le back : les mêmes signatures seront branchées sur l'API réelle.
// Le mot de passe n'est pas vérifié ici ; le serveur le fera, avec un message identique
// pour un compte inconnu et un mot de passe faux.
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await simulateLatency();
    const account = await usersApi.findActiveUserByEmail(credentials.email);
    if (!account) throw new Error(INVALID_CREDENTIALS);
    return { user: toSession(account), token: `${MOCK_TOKEN_PREFIX}${account.id}` };
  },

  async getCurrentUser(): Promise<UserSession | null> {
    const userId = getSessionUserId();
    if (!userId) return null;
    const account = await usersApi.getUserById(userId);
    return account?.active && !account.archived_at ? toSession(account) : null;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async updateProfile(userId: string, changes: ProfileUpdateInput): Promise<UserSession> {
    await simulateLatency();
    const account = await usersApi.getUserById(userId);
    if (!account) throw new Error(INVALID_CREDENTIALS);
    const updated = await usersApi.updateUser(userId, {
      name: changes.name,
      email: changes.email,
      phone: changes.phone,
      role: account.role,
      agency: account.agency,
    });
    return toSession(updated);
  },

  // Le serveur vérifiera le mot de passe avant d'archiver le compte.
  async deleteOwnAccount(userId: string, password: string): Promise<void> {
    void password;
    await simulateLatency();
    await usersApi.archiveOwnAccount(userId);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async canDeleteOwnAccount(user: UserSession): Promise<boolean> {
    return user.role !== 'admin' || (await usersApi.countOtherActiveAdmins(user.id)) > 0;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    void payload;
    await simulateLatency();
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
