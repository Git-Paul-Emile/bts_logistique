/**
 * Adresse publique du site (https://domaine, sans « / » final), donnée au build par VITE_SITE_URL.
 * null tant que le domaine définitif n'est pas configuré : pas d'URL canonique dans ce cas.
 */
export const SITE_URL: string | null = import.meta.env.VITE_SITE_URL?.replace(/\/+$/, '') || null;

/** URL absolue d'un chemin du site, ou null sans domaine configuré. */
export function absoluteUrl(path: string): string | null {
  return SITE_URL ? `${SITE_URL}${path}` : null;
}
