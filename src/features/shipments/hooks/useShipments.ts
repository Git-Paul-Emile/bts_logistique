import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  shipmentsApi,
  type NewShipmentInput,
  type ShipmentListParams,
} from '@/api/endpoints/shipments.api';
import { queryKeys } from '@/api/queryKeys';

export function useShipmentList(params: ShipmentListParams) {
  return useQuery({
    queryKey: [...queryKeys.shipments, 'list', params],
    queryFn: () => shipmentsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewShipmentInput) => shipmentsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.shipments }),
  });
}
