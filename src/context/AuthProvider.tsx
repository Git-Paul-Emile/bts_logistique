import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { ProfileUpdateInput, UserSession } from '@/types';
import { AuthContext } from './AuthContext';
import { authApi, AUTH_TOKEN_KEY } from '@/api/endpoints/auth.api';
import { reportError } from '@/lib/reportError';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [signOutNotice, setSignOutNotice] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        reportError('Impossible de charger l’utilisateur connecté', err);
      } finally {
        setIsLoading(false);
      }
    }
    void initAuth();
  }, []);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password: '' });
      setSignOutNotice(null);
      setUser(response.user);
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (changes: ProfileUpdateInput) => {
      if (!user) return;
      setUser(await authApi.updateProfile(user.id, changes));
    },
    [user]
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      if (!user) return;
      await authApi.deleteOwnAccount(user.id, password);
      setSignOutNotice('Votre compte a été supprimé.');
      setUser(null);
    },
    [user]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        updateProfile,
        deleteAccount,
        signOutNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
