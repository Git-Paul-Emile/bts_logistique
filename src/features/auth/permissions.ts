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
  settings: ADMIN_ONLY,
  users: ADMIN_ONLY,
};

export function canAccessView(role: UserRole, view: View): boolean {
  return VIEW_ACCESS[view].includes(role);
}

/** Import Excel : réservé à l'équipe, comme le suivi des lignes déjà importées côté serveur. */
export function canImport(role: UserRole): boolean {
  return STAFF.includes(role);
}

/** Tarif au m³ personnalisé sur un colis : réservé à l'équipe, le serveur le refuse aux autres. */
export function canOverrideRate(role: UserRole): boolean {
  return STAFF.includes(role);
}
