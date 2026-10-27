import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth.api';
import { setSessionExpiredHandler } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { LoginCredentials } from '@/api/types/auth.types';
import type { ProfileUpdateInput, UserSession } from '@/types';
import { AuthContext } from './AuthContext';

const SESSION_EXPIRED_NOTICE = 'Votre session a expiré. Reconnectez-vous pour continuer.';
const ACCOUNT_DELETED_NOTICE = 'Votre compte a été supprimé.';

/**
 * Session de la personne connectée. Elle est lue une fois par GET /auth/me puis gardée dans le
 * cache de TanStack Query ; les jetons restent dans des cookies que le front ne lit jamais.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [signOutNotice, setSignOutNotice] = useState<string | null>(null);
  const session = useQuery({
    queryKey: queryKeys.session,
    queryFn: authApi.getCurrentUser,
    staleTime: Infinity,
  });

  /** Ferme la session côté front : plus aucune donnée de l'espace de gestion en cache. */
  const endSession = useCallback(
    (notice: string | null) => {
      setSignOutNotice(notice);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== queryKeys.session[0],
      });
      queryClient.setQueryData<UserSession | null>(queryKeys.session, null);
    },
    [queryClient]
  );

  useEffect(() => {
    // Un visiteur jamais connecté n'a pas de session à voir expirer : pas de message pour lui.
    setSessionExpiredHandler(() => {
      if (queryClient.getQueryData(queryKeys.session)) endSession(SESSION_EXPIRED_NOTICE);
    });
    return () => setSessionExpiredHandler(null);
  }, [endSession, queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const user = await authApi.login(credentials);
      setSignOutNotice(null);
      queryClient.setQueryData(queryKeys.session, user);
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      endSession(null);
    }
  }, [endSession]);

  const updateProfile = useCallback(
    async (changes: ProfileUpdateInput) => {
      const result = await authApi.updateProfile(changes);
      queryClient.setQueryData(queryKeys.session, result.user);
      return result;
    },
    [queryClient]
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      await authApi.deleteOwnAccount(password);
      endSession(ACCOUNT_DELETED_NOTICE);
    },
    [endSession]
  );

  const user = session.data ?? null;
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: session.isPending,
      login,
      logout,
      updateProfile,
      deleteAccount,
      signOutNotice,
    }),
    [user, session.isPending, login, logout, updateProfile, deleteAccount, signOutNotice]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
