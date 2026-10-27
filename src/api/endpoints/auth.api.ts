// Session et profil de la personne connectée. Les jetons vivent dans des cookies HttpOnly que
// le front ne lit jamais : il ne garde que le jeton CSRF, en mémoire (api/client.ts).
import type {
  ChangePasswordPayload,
  LoginCredentials,
  SessionDto,
  SessionUserDto,
  TokenPasswordPayload,
} from '@/api/types/auth.types';
import { ApiError, getData, http, setCsrfToken } from '@/api/client';
import type { ProfileUpdateInput, UserSession } from '@/types';

export function toUserSession(dto: SessionUserDto): UserSession {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? undefined,
    role: dto.role,
    agency: dto.agency.name,
    agency_code: dto.agency.code,
    initials: dto.initials,
  };
}

function openSession(session: SessionDto): UserSession {
  setCsrfToken(session.csrf_token);
  return toUserSession(session.user);
}

export interface ProfileUpdateResult {
  user: UserSession;
  /** Nouvelle adresse en attente de confirmation : un lien vient d'y être envoyé. */
  pendingEmail: string | null;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<UserSession> {
    return openSession(await getData(http.post('/auth/login', credentials)));
  },

  /** Session en cours après un rechargement ; null si personne n'est connecté. */
  async getCurrentUser(): Promise<UserSession | null> {
    try {
      return openSession(await getData(http.get('/auth/me')));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await http.post('/auth/logout');
    } finally {
      setCsrfToken(null);
    }
  },

  async updateProfile(changes: ProfileUpdateInput): Promise<ProfileUpdateResult> {
    const body = await getData<{ user: SessionUserDto; pending_email: string | null }>(
      http.patch('/me', { name: changes.name, email: changes.email, phone: changes.phone ?? '' })
    );
    return { user: toUserSession(body.user), pendingEmail: body.pending_email };
  },

  /** Archive le compte : le serveur vérifie le mot de passe et ferme la session. */
  async deleteOwnAccount(password: string): Promise<void> {
    await http.delete('/me', { data: { password } });
    setCsrfToken(null);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await http.post('/me/password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    });
  },

  /** Le serveur répond de la même façon que l'adresse existe ou non. */
  async requestPasswordReset(email: string): Promise<void> {
    await http.post('/auth/password/forgot', { email });
  },

  async resetPassword(payload: TokenPasswordPayload): Promise<void> {
    await http.post('/auth/password/reset', payload);
  },

  async acceptInvitation(payload: TokenPasswordPayload): Promise<void> {
    await http.post('/auth/invitation/accept', payload);
  },

  async confirmEmail(token: string): Promise<void> {
    await http.post('/auth/email/confirm', { token });
  },
};
