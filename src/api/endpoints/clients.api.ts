import type { Client, ClientUpdateInput } from '@/types';
import { reportError } from '@/lib/reportError';

const CLIENTS_STORAGE_KEY = 'bts_clients_v1';

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Électro Abidjan SARL (M. Koffi)',
    phone: '+225 07 48 92 10 33',
    email: 'koffi.electro@afnet.ci',
    address: "Zone 4C, Rue des Carrossiers, Abidjan, Côte d'Ivoire",
    total_billed: 729600,
    amount_paid: 564800,
    package_count: 2,
    created_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'Boutique Touba Textile (Mme Diop)',
    phone: '+221 77 654 32 10',
    email: 'fatou.diop.textile@gmail.com',
    address: 'Marché HLM, Allée centrale, Dakar, Sénégal',
    total_billed: 154980,
    amount_paid: 154980,
    package_count: 1,
    created_at: '2026-09-01T14:30:00Z',
  },
  {
    id: 'cli-3',
    name: 'Quincaillerie du Fleuve (M. Traoré)',
    phone: '+223 66 12 45 78',
    email: 'traore.quincaillerie@orangemali.com',
    address: 'Badalabougou, Près du Palais de la Culture, Bamako, Mali',
    total_billed: 533250,
    amount_paid: 0,
    package_count: 1,
    created_at: '2026-10-02T09:15:00Z',
  },
  {
    id: 'cli-4',
    name: 'Mme Awa Sanogo (Importatrice Cosmétiques)',
    phone: '+225 05 88 14 20 01',
    email: 'awa.sanogo.import@yahoo.fr',
    address: "Angré 8ème Tranche, Cocody, Abidjan, Côte d'Ivoire",
    total_billed: 280000,
    amount_paid: 280000,
    package_count: 3,
    created_at: '2026-07-10T12:00:00Z',
  },
];

function loadStoredClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(initialClients));
      return initialClients;
    }
    return JSON.parse(raw);
  } catch (error) {
    reportError('clients.api : loadStoredClients', error);
    return initialClients;
  }
}

function saveClientsToStorage(clients: Client[]) {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    reportError('clients.api : saveClientsToStorage', error);
  }
}

export const clientsApi = {
  async getClients(): Promise<Client[]> {
    return loadStoredClients();
  },

  async getClientById(id: string): Promise<Client | null> {
    const list = loadStoredClients();
    return list.find((c) => c.id === id) || null;
  },

  async createClient(
    data: Omit<Client, 'id' | 'created_at' | 'total_billed' | 'amount_paid' | 'package_count'>
  ): Promise<Client> {
    const list = loadStoredClients();
    const newClient: Client = {
      ...data,
      id: `cli-${crypto.randomUUID()}`,
      total_billed: 0,
      amount_paid: 0,
      package_count: 0,
      created_at: new Date().toISOString(),
    };
    const nextList = [newClient, ...list];
    saveClientsToStorage(nextList);
    return newClient;
  },

  async updateClient(id: string, changes: ClientUpdateInput): Promise<Client | null> {
    const list = loadStoredClients();
    const index = list.findIndex((c) => c.id === id);
    const current = list[index];
    if (!current) return null;
    const updated: Client = { ...current, ...changes };
    list[index] = updated;
    saveClientsToStorage(list);
    return updated;
  },
};
