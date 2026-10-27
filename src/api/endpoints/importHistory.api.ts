// Empreintes des lignes déjà importées, gardées par le serveur : un même fichier importé
// deux fois, depuis n'importe quel poste, ne crée pas de doublons.
import { getData, http } from '@/api/client';

export const importHistoryApi = {
  async getFingerprints(entity: string): Promise<Set<string>> {
    const request = http.get('/import-fingerprints', { params: { entity } });
    return new Set(await getData<string[]>(request));
  },

  async addFingerprints(entity: string, fingerprints: readonly string[]): Promise<void> {
    if (fingerprints.length === 0) return;
    await http.post('/import-fingerprints', { entity, fingerprints });
  },
};
