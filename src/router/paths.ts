export const PATHS = {
  home: '/',
  tracking: '/suivi',
  privacy: '/confidentialite',
  terms: '/cgu',
  login: '/connexion',
  forgotPassword: '/mot-de-passe-oublie',
  resetPassword: '/reinitialiser-mot-de-passe',
  // Chemins des liens envoyés par e-mail : ils doivent rester identiques à ceux du back.
  acceptInvitation: '/activer-mon-compte',
  confirmEmail: '/confirmer-email',
  admin: '/admin',
} as const;

export function trackingPath(trackingNumber: string): string {
  return `${PATHS.tracking}/${encodeURIComponent(trackingNumber.trim().toUpperCase())}`;
}
