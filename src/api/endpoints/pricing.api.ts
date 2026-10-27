// Grille tarifaire : prix publics pour le site, prix et marges pour l'administrateur.
import { getData, http } from '@/api/client';
import type { PricingGrid, TransportMode } from '@/types';

export interface PublicPricing {
  rates: Record<TransportMode, { client_rate_per_cbm: number }>;
  updated_at: string;
}

export const pricingApi = {
  /** Prix au m³ affichés aux visiteurs, sans les marges. */
  async getPublic(): Promise<PublicPricing> {
    return getData(http.get('/pricing'));
  },

  async getAdmin(): Promise<PricingGrid> {
    return getData(http.get('/pricing/admin'));
  },

  async update(rates: PricingGrid['rates']): Promise<PricingGrid> {
    return getData(http.put('/pricing', { rates }));
  },
};
