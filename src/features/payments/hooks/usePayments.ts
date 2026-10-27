import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  paymentsApi,
  type NewPaymentInput,
  type PaymentListParams,
} from '@/api/endpoints/payments.api';
import { queryKeys } from '@/api/queryKeys';
import { refreshAfterPackageChange } from '@/features/packages/hooks/usePackages';

export function usePaymentList(params: PaymentListParams) {
  return useQuery({
    queryKey: [...queryKeys.payments, 'list', params],
    queryFn: () => paymentsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Un paiement change le reste à payer des colis réglés et le solde du client. */
export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPaymentInput) => paymentsApi.record(input),
    onSuccess: (payment) => {
      for (const allocation of payment.allocations) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.package(allocation.package_id) });
      }
      refreshAfterPackageChange(queryClient);
    },
  });
}

export function useReversePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => paymentsApi.reverse(id, reason),
    onSuccess: (reversal) => {
      for (const allocation of reversal.allocations) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.package(allocation.package_id) });
      }
      refreshAfterPackageChange(queryClient);
    },
  });
}
