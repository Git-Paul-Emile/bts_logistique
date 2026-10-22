import type { PackageStatus } from '@/types';
import { TRANSPORT_MODE_LABELS } from '@/types';

// Les ancres pointent vers la page d'accueil pour fonctionner aussi depuis les autres pages.
export const PORTAL_NAV_LINKS = [
  { href: '/#services', label: 'Services' },
  { href: '/#reseau', label: 'Réseau' },
  { href: '/#etapes', label: 'Fonctionnement' },
  { href: '/suivi', label: 'Suivi de colis' },
  { href: '/#simulateur', label: 'Tarifs' },
  { href: '/#contact', label: 'Contact' },
] as const;

export const LEGAL_LINKS = [
  { href: '/confidentialite', label: 'Politique de confidentialité' },
  { href: '/cgu', label: 'Conditions générales d’utilisation' },
] as const;

// Photos sous licence Unsplash (usage commercial gratuit, sans attribution obligatoire).
// À remplacer par des photos des entrepôts BTS dès qu'elles sont disponibles.
const unsplash = (photoId: string, width: number) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=75`;

export const PORTAL_IMAGES = {
  hero: unsplash('photo-1590496793907-4d66e2994b4d', 2000),
  sea: unsplash('photo-1605745341112-85968b19335b', 800),
  air: unsplash('photo-1436491865332-7a61a109cc05', 800),
  customs: unsplash('photo-1631176315313-203dab297716', 800),
  warehouse: unsplash('photo-1553413077-190dd305871c', 800),
  // Visuel fourni par BTS, servi depuis public/images.
  whyUs: '/images/triptyque-transports.webp',
} as const;

export const CONTACT = {
  phoneDisplay: '+225 27 21 00 00',
  phoneHref: 'tel:+22527210000',
  email: 'contact@bts-logistique.com',
  address: 'Zone 4C, Rue des Carrossiers, Treichville, Abidjan',
} as const;

export const HIGHLIGHTS = [
  { title: 'Groupage maritime', text: 'Conteneurs 40HQ, prix au m³' },
  { title: 'Fret aérien', text: 'Livré en 5 à 7 jours ouvrés' },
  { title: 'Suivi en ligne', text: 'Chaque étape visible' },
  { title: 'Dédouanement inclus', text: 'Formalités prises en charge' },
] as const;

export const SERVICES = [
  {
    title: 'Groupage maritime',
    description: 'Départs bimensuels depuis Guangzhou et Yiwu, prix calculé au mètre cube.',
    image: PORTAL_IMAGES.sea,
    imageAlt: 'Porte-conteneurs en mer',
  },
  {
    title: 'Fret aérien express',
    description: 'Vols cargo hebdomadaires depuis Dubaï et Istanbul.',
    image: PORTAL_IMAGES.air,
    imageAlt: 'Avion en vol au-dessus des nuages',
  },
  {
    title: 'Dédouanement',
    description: 'Formalités au port et à l’aéroport assurées par nos commissionnaires.',
    image: PORTAL_IMAGES.customs,
    imageAlt: 'Conteneurs empilés sous une grue portuaire',
  },
  {
    title: 'Entreposage',
    description: 'Réception de vos achats fournisseurs dans nos entrepôts en Asie et à Dubaï.',
    image: PORTAL_IMAGES.warehouse,
    imageAlt: 'Allée d’entrepôt avec des étagères chargées de cartons',
  },
] as const;

export const ROUTE_ORIGINS = ['Guangzhou', 'Yiwu', 'Dubaï', 'Istanbul'] as const;
export const ROUTE_DESTINATIONS = ['Abidjan', 'Dakar', 'Bamako'] as const;

export const WHY_US = [
  {
    icon: 'receipt',
    title: 'Prix au mètre cube',
    text: 'Un tarif affiché, calculé sur le volume réel mesuré en entrepôt.',
  },
  {
    icon: 'radar',
    title: 'Suivi à chaque étape',
    text: 'Un numéro unique par colis, consultable en ligne à tout moment.',
  },
  {
    icon: 'shield',
    title: 'Douane gérée pour vous',
    text: 'Nos commissionnaires s’occupent des formalités à l’arrivée.',
  },
  {
    icon: 'handshake',
    title: 'Remise contre décharge',
    text: 'Votre colis est remis contre signature, sur présentation du numéro.',
  },
] as const;

export type WhyUsIcon = (typeof WHY_US)[number]['icon'];

export const PROCESS_STEPS = [
  {
    title: 'Dépôt',
    description: 'Votre colis est mesuré, étiqueté et reçoit son numéro de suivi.',
  },
  {
    title: 'Transit',
    description: 'Départ par conteneur maritime ou par vol cargo.',
  },
  {
    title: 'Douane',
    description: 'Dédouanement à l’arrivée puis transfert au hub local.',
  },
  {
    title: 'Retrait',
    description: 'Vous récupérez votre colis ou il vous est livré.',
  },
] as const;

export const TRACKING_STEPS: { key: PackageStatus; label: string }[] = [
  { key: 'registered', label: 'Enregistré' },
  { key: 'in_transit', label: 'En transit' },
  { key: 'arrived', label: 'Arrivé au hub' },
  { key: 'delivered', label: 'Livré' },
];

export const WAREHOUSES = [
  {
    city: 'Guangzhou',
    country: 'Chine',
    role: 'Hub principal Asie',
    address: 'Baiyun District, Logistics Park N°4, Guangzhou',
  },
  {
    city: 'Yiwu',
    country: 'Chine',
    role: 'Hub marchandises diverses',
    address: 'Yiwu International Trade City, Warehouse B',
  },
  {
    city: 'Dubaï',
    country: 'Émirats arabes unis',
    role: 'Plateforme fret aérien et transit',
    address: 'Deira Cargo Village, Dubaï',
  },
  {
    city: 'Abidjan',
    country: 'Côte d’Ivoire',
    role: 'Hub central Afrique de l’Ouest',
    address: 'Zone 4C, Rue des Carrossiers, Treichville',
  },
] as const;

// Chiffres déduits de l'offre ci-dessus, pas de statistiques commerciales.
export const NETWORK_FACTS = [
  { value: WAREHOUSES.length, label: 'Entrepôts' },
  { value: Object.keys(TRANSPORT_MODE_LABELS).length, label: 'Modes de transport' },
  { value: ROUTE_DESTINATIONS.length, label: 'Villes de livraison' },
] as const;
