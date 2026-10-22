import type { UserRole, View } from '@/types';

const ALL_ROLES: UserRole[] = ['admin', 'manager', 'collector'];
const STAFF: UserRole[] = ['admin', 'manager'];
const ADMIN_ONLY: UserRole[] = ['admin'];

// Confort d'affichage uniquement : le serveur doit refuser ces actions aux rôles non autorisés.
const VIEW_ACCESS: Record<View, UserRole[]> = {
  dashboard: ALL_ROLES,
  packages: ALL_ROLES,
  'package-new': ALL_ROLES,
  'package-detail': ALL_ROLES,
  notifications: ALL_ROLES,
  profile: ALL_ROLES,
  shipments: STAFF,
  clients: STAFF,
  payments: STAFF,
  calculator: STAFF,
  history: STAFF,
  settings: ADMIN_ONLY,
  users: ADMIN_ONLY,
};

export function canAccessView(role: UserRole, view: View): boolean {
  return VIEW_ACCESS[view].includes(role);
}
