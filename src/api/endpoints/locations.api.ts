// Villes de départ et d'arrivée du réseau BTS, et leur agence.
import { getData, http } from '@/api/client';
import type { NetworkLocation } from '@/types';

export const locationsApi = {
  async list(): Promise<NetworkLocation[]> {
    return getData(http.get('/locations'));
  },
};
