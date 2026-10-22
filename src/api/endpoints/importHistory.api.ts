import { reportError } from '@/lib/reportError';

const HISTORY_STORAGE_KEY = 'bts_import_history_v1';

type History = Record<string, string[]>;

function loadHistory(): History {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as History) : {};
  } catch (error) {
    reportError('importHistory.api : loadHistory', error);
    return {};
  }
}

// Simulation en attendant le back : le serveur gardera la trace des lignes importées,
// pour qu'un même fichier importé deux fois ne crée pas de doublons.
export const importHistoryApi = {
  async getFingerprints(entity: string): Promise<Set<string>> {
    return new Set(loadHistory()[entity] ?? []);
  },

  async addFingerprints(entity: string, fingerprints: readonly string[]): Promise<void> {
    if (fingerprints.length === 0) return;
    const history = loadHistory();
    history[entity] = [...new Set([...(history[entity] ?? []), ...fingerprints])];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  },
};
