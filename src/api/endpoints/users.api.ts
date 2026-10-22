import type { AppUser, AppUserInput } from '@/types';
import { reportError } from '@/lib/reportError';

// Version incrémentée à chaque changement des comptes de démonstration, pour qu'ils apparaissent
// aussi dans les navigateurs qui avaient déjà une liste enregistrée.
const USERS_STORAGE_KEY = 'bts_users_v3';

// Comptes de démonstration : un par rôle (administrateur, gestionnaire, collecteur).
const initialUsers: AppUser[] = [
  {
    id: 'usr_admin',
    name: 'Administrateur BTS',
    email: 'admin@bts-logistique.fr',
    role: 'admin',
    agency: "Abidjan (Côte d'Ivoire)",
    active: true,
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'usr_default',
    name: 'Thomas Lefèvre',
    email: 'thomas.lefevre@bts-logistique.fr',
    role: 'manager',
    agency: "Abidjan (Côte d'Ivoire)",
    active: true,
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'usr_collector',
    name: 'Collecteur Guangzhou',
    email: 'collecteur@bts-logistique.fr',
    role: 'collector',
    agency: 'Guangzhou (Chine)',
    active: true,
    created_at: '2026-10-01T08:00:00Z',
  },
];

function loadStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser[]) : initialUsers;
  } catch (error) {
    reportError('users.api : loadStoredUsers', error);
    return initialUsers;
  }
}

function saveUsers(users: AppUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export const LAST_ADMIN_ERROR = 'LAST_ADMIN';

function canSignIn(user: AppUser): boolean {
  return user.active && !user.archived_at;
}

function findUserOrThrow(users: AppUser[], id: string): { index: number; user: AppUser } {
  const index = users.findIndex((user) => user.id === id);
  const user = users[index];
  if (!user) throw new Error(`Utilisateur introuvable : ${id}`);
  return { index, user };
}

// Simulation en attendant le back. Côté serveur, la création enverra l'e-mail
// d'invitation et l'unicité de l'adresse sera garantie par la base.
export const usersApi = {
  async getUsers(): Promise<AppUser[]> {
    return loadStoredUsers();
  },

  async findActiveUserByEmail(email: string): Promise<AppUser | null> {
    const normalized = email.trim().toLowerCase();
    return (
      loadStoredUsers().find(
        (user) => canSignIn(user) && user.email.toLowerCase() === normalized
      ) ?? null
    );
  },

  async countOtherActiveAdmins(userId: string): Promise<number> {
    return loadStoredUsers().filter(
      (user) => user.id !== userId && user.role === 'admin' && canSignIn(user)
    ).length;
  },

  /** Suppression demandée par la personne elle-même : le compte est archivé, jamais effacé. */
  async archiveOwnAccount(userId: string): Promise<AppUser> {
    const users = loadStoredUsers();
    const { index, user } = findUserOrThrow(users, userId);
    if (user.role === 'admin' && (await usersApi.countOtherActiveAdmins(userId)) === 0) {
      throw new Error(LAST_ADMIN_ERROR);
    }
    const archived: AppUser = { ...user, archived_at: new Date().toISOString() };
    users[index] = archived;
    saveUsers(users);
    return archived;
  },

  async restoreUser(userId: string): Promise<AppUser> {
    const users = loadStoredUsers();
    const { index, user } = findUserOrThrow(users, userId);
    const { archived_at, ...restored } = user;
    void archived_at;
    users[index] = restored;
    saveUsers(users);
    return restored;
  },

  async getUserById(id: string): Promise<AppUser | null> {
    return loadStoredUsers().find((user) => user.id === id) ?? null;
  },

  async createUser(input: AppUserInput): Promise<AppUser> {
    const users = loadStoredUsers();
    if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('EMAIL_ALREADY_USED');
    }
    const created: AppUser = {
      ...input,
      id: `usr-${crypto.randomUUID()}`,
      active: true,
      created_at: new Date().toISOString(),
    };
    saveUsers([created, ...users]);
    return created;
  },

  async updateUser(id: string, input: AppUserInput): Promise<AppUser> {
    const users = loadStoredUsers();
    const { index, user } = findUserOrThrow(users, id);
    if (
      users.some(
        (other) => other.id !== id && other.email.toLowerCase() === input.email.toLowerCase()
      )
    ) {
      throw new Error('EMAIL_ALREADY_USED');
    }
    const updated: AppUser = { ...user, ...input };
    users[index] = updated;
    saveUsers(users);
    return updated;
  },

  async setUserActive(id: string, active: boolean): Promise<AppUser> {
    const users = loadStoredUsers();
    const { index, user } = findUserOrThrow(users, id);
    const updated: AppUser = { ...user, active };
    users[index] = updated;
    saveUsers(users);
    return updated;
  },
};
