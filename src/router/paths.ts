export const PATHS = {
  home: '/',
  tracking: '/suivi',
  privacy: '/confidentialite',
  terms: '/cgu',
  login: '/connexion',
  forgotPassword: '/mot-de-passe-oublie',
  resetPassword: '/reinitialiser-mot-de-passe',
  admin: '/admin',
} as const;

export function trackingPath(trackingNumber: string): string {
  return `${PATHS.tracking}/${encodeURIComponent(trackingNumber.trim().toUpperCase())}`;
}
