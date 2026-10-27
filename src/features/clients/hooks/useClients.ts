import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsApi, type ClientListParams } from '@/api/endpoints/clients.api';
import { queryKeys } from '@/api/queryKeys';
import type { ClientUpdateInput, NewClientInput } from '@/types';

export function useClientList(params: ClientListParams, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.clients, 'list', params],
    queryFn: () => clientsApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Fiche détaillée d'un client : équipe seulement. */
export function useClientDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.client(id ?? ''),
    queryFn: () => clientsApi.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewClientInput) => clientsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clients }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: ClientUpdateInput }) =>
      clientsApi.update(id, changes),
    // Le nom du client apparaît aussi sur ses colis et ses paiements.
    onSuccess: () => {
      for (const queryKey of [queryKeys.clients, queryKeys.packages, queryKeys.payments]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
