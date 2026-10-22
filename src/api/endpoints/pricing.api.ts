import type { PricingGrid } from '@/types';
import { reportError } from '@/lib/reportError';

const PRICING_STORAGE_KEY = 'bts_pricing_grid';

// Prix déjà affichés sur le site public. Les marges sont à saisir par BTS.
export const DEFAULT_PRICING_GRID: PricingGrid = {
  rates: {
    sea: { client_rate_per_cbm: 380000, collector_margin_per_cbm: 0 },
    air: { client_rate_per_cbm: 750000, collector_margin_per_cbm: 0 },
  },
  updated_at: '2026-10-19T00:00:00Z',
};

function loadStoredGrid(): PricingGrid {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PricingGrid) : DEFAULT_PRICING_GRID;
  } catch (error) {
    reportError('pricing.api : loadStoredGrid', error);
    return DEFAULT_PRICING_GRID;
  }
}

// Simulation en attendant le back : la grille sera lue et écrite par l'API.
export const pricingApi = {
  async getPricingGrid(): Promise<PricingGrid> {
    return loadStoredGrid();
  },

  async updatePricingGrid(rates: PricingGrid['rates']): Promise<PricingGrid> {
    const grid: PricingGrid = { rates, updated_at: new Date().toISOString() };
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(grid));
    return grid;
  },
};
