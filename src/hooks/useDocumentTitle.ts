import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { absoluteUrl } from '@/lib/siteUrl';

const SITE_NAME = 'BTS Logistique';
// Reprise de index.html : évite qu'une page sans description garde celle de la page précédente.
const DEFAULT_DESCRIPTION =
  'BTS Logistique transporte vos colis de Chine, Dubaï et Turquie vers Abidjan, Dakar et Bamako : groupage maritime, fret aérien, dédouanement et suivi en ligne.';

interface PageMetaOptions {
  description?: string;
  /** Pages privées ou sans intérêt pour les moteurs de recherche (admin, connexion, 404). */
  noIndex?: boolean;
}

function upsertMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

/**
 * URL canonique : l'adresse de référence de la page, sans paramètres ni ancre, pour que les
 * moteurs ne comptent pas deux fois la même page. Retirée sur les pages non indexées.
 */
function updateCanonical(href: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function useDocumentTitle(
  pageTitle: string,
  { description, noIndex = false }: PageMetaOptions = {}
) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `${pageTitle} | ${SITE_NAME}`;
    upsertMeta('description', description ?? DEFAULT_DESCRIPTION);
    upsertMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    updateCanonical(noIndex ? null : absoluteUrl(pathname));
  }, [pageTitle, description, noIndex, pathname]);
}
