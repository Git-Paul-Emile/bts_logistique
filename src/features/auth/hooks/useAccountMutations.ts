// Actions de compte qui ne passent pas par la session en cours : mot de passe oublié,
// réinitialisation, activation d'un compte invité, confirmation d'adresse, changement de mot de
// passe. Les composants les appellent par ces hooks, jamais l'API directement.
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth.api';
import type { ChangePasswordPayload, TokenPasswordPayload } from '@/api/types/auth.types';

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: (email: string) => authApi.requestPasswordReset(email) });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: TokenPasswordPayload) => authApi.resetPassword(payload),
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (payload: TokenPasswordPayload) => authApi.acceptInvitation(payload),
  });
}

export function useConfirmEmail() {
  return useMutation({ mutationFn: (token: string) => authApi.confirmEmail(token) });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
  });
}
