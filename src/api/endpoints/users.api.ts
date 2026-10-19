import { AppUser, AppUserInput } from '@/types';

const USERS_STORAGE_KEY = 'bts_users';

const initialUsers: AppUser[] = [
  {
    id: 'usr_default',
    name: 'Thomas Lefèvre',
    email: 'thomas.lefevre@bts-logistique.fr',
    role: 'manager',
    agency: 'Abidjan (Côte d\'Ivoire)',
    active: true,
    created_at: '2026-10-01T08:00:00Z',
  },
];

function loadStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser[]) : initialUsers;
  } catch {
    return initialUsers;
  }
}

function saveUsers(users: AppUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function findUserOrThrow(users: AppUser[], id: string): number {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) throw new Error(`Utilisateur introuvable : ${id}`);
  return index;
}

// Simulation en attendant le back. Côté serveur, la création enverra l'e-mail
// d'invitation et l'unicité de l'adresse sera garantie par la base.
export const usersApi = {
  async getUsers(): Promise<AppUser[]> {
    return loadStoredUsers();
  },

  async createUser(input: AppUserInput): Promise<AppUser> {
    const users = loadStoredUsers();
    if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('EMAIL_ALREADY_USED');
    }
    const created: AppUser = { ...input, id: `usr-${Date.now()}`, active: true, created_at: new Date().toISOString() };
    saveUsers([created, ...users]);
    return created;
  },

  async updateUser(id: string, input: AppUserInput): Promise<AppUser> {
    const users = loadStoredUsers();
    const index = findUserOrThrow(users, id);
    if (users.some((user) => user.id !== id && user.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('EMAIL_ALREADY_USED');
    }
    users[index] = { ...users[index], ...input };
    saveUsers(users);
    return users[index];
  },

  async setUserActive(id: string, active: boolean): Promise<AppUser> {
    const users = loadStoredUsers();
    const index = findUserOrThrow(users, id);
    users[index] = { ...users[index], active };
    saveUsers(users);
    return users[index];
  },
};
