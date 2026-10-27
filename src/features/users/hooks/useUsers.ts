import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserListParams } from '@/api/endpoints/users.api';
import { queryKeys } from '@/api/queryKeys';
import type { AppUserInput } from '@/types';

export function useUserList(params: UserListParams) {
  return useQuery({
    queryKey: [...queryKeys.users, 'list', params],
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Création (avec e-mail d'invitation), modification, activation et restauration des comptes. */
export function useUserActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: queryKeys.users });

  const invite = useMutation({
    mutationFn: (input: AppUserInput) => usersApi.invite(input),
    onSuccess,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AppUserInput }) => usersApi.update(id, input),
    onSuccess,
  });
  const setActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => usersApi.setActive(id, active),
    onSuccess,
  });
  const restore = useMutation({ mutationFn: (id: string) => usersApi.restore(id), onSuccess });

  return {
    inviteUser: invite.mutateAsync,
    updateUser: (id: string, input: AppUserInput) => update.mutateAsync({ id, input }),
    setUserActive: (id: string, active: boolean) => setActive.mutateAsync({ id, active }),
    restoreUser: restore.mutateAsync,
  };
}
