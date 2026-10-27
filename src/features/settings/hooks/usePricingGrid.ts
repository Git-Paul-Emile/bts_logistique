import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '@/api/endpoints/pricing.api';
import { queryKeys } from '@/api/queryKeys';
import type { PricingGrid } from '@/types';

/** Grille complète (prix et marges collecteurs) : administrateur seulement. */
export function useAdminPricing() {
  return useQuery({ queryKey: queryKeys.adminPricing, queryFn: pricingApi.getAdmin });
}

/** Prix au m³ sans les marges : site public, simulateur et formulaires de colis. */
export function usePublicPricing() {
  return useQuery({ queryKey: queryKeys.publicPricing, queryFn: pricingApi.getPublic });
}

export function useSavePricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rates: PricingGrid['rates']) => pricingApi.update(rates),
    onSuccess: (grid) => {
      queryClient.setQueryData(queryKeys.adminPricing, grid);
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicPricing });
    },
  });
}
