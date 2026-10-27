import { SITE_URL } from '@/lib/siteUrl';
import { CONTACT } from '../portal.content';

/**
 * Données structurées schema.org de l'entreprise (JSON-LD), lues par les moteurs de recherche
 * pour la fiche de l'entreprise. Elles reprennent exactement les coordonnées affichées sur le
 * site (portal.content.ts) : les deux ne peuvent pas diverger.
 */
export function BusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'BTS Logistique',
    description:
      'Transport de colis de Chine, Dubaï et Turquie vers l’Afrique de l’Ouest : groupage maritime, fret aérien, dédouanement et suivi en ligne.',
    telephone: CONTACT.phoneHref.replace('tel:', ''),
    email: CONTACT.email,
    address: { '@type': 'PostalAddress', streetAddress: CONTACT.address, addressCountry: 'CI' },
    ...(SITE_URL ? { url: `${SITE_URL}/`, logo: `${SITE_URL}/BTS_LOGISTIQUE.png` } : {}),
  };
  // « < » échappé : le texte ne peut pas fermer la balise script, quel que soit son contenu.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
