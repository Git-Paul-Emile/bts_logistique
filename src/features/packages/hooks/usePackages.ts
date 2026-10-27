import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  packagesApi,
  type NewPackageInput,
  type PackageListParams,
} from '@/api/endpoints/packages.api';
import { queryKeys } from '@/api/queryKeys';
import type { Package, PackageUpdateInput, StatusUpdateInput } from '@/types';

export function usePackageList(params: PackageListParams) {
  return useQuery({
    queryKey: [...queryKeys.packages, 'list', params],
    queryFn: () => packagesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Fiche d'un colis, avec l'historique complet de ses étapes. */
export function usePackage(id: string | null) {
  return useQuery({
    queryKey: queryKeys.package(id ?? ''),
    queryFn: () => packagesApi.get(id ?? ''),
    enabled: Boolean(id),
  });
}

/**
 * Un colis modifié change aussi les soldes clients, le tableau de bord, les paiements, les
 * conteneurs et les notifications : tout ce qui en dépend est relu.
 */
export function refreshAfterPackageChange(queryClient: QueryClient, updated?: Package) {
  if (updated) queryClient.setQueryData(queryKeys.package(updated.id), updated);
  for (const queryKey of [
    queryKeys.packages,
    queryKeys.clients,
    queryKeys.payments,
    queryKeys.shipments,
    queryKeys.notifications,
    queryKeys.dashboardAll,
  ]) {
    void queryClient.invalidateQueries({ queryKey });
  }
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPackageInput) => packagesApi.create(input),
    onSuccess: (created) => refreshAfterPackageChange(queryClient, created),
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: PackageUpdateInput }) =>
      packagesApi.update(id, changes),
    onSuccess: (updated) => refreshAfterPackageChange(queryClient, updated),
  });
}

export function useAddPackageEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StatusUpdateInput }) =>
      packagesApi.addEvent(id, input),
    onSuccess: (updated) => refreshAfterPackageChange(queryClient, updated),
  });
}

/** L'e-mail part en différé ; sa notification apparaît dans la cloche. */
export function useSendTrackingEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packagesApi.sendTrackingEmail(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
