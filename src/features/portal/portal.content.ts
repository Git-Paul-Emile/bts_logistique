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
  { href: '/cgu', label: "Conditions générales d'utilisation" },
] as const;

// Photos sous licence Unsplash (usage commercial gratuit, sans attribution obligatoire).
const unsplash = (photoId: string, width: number) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=75`;

export const PORTAL_IMAGES = {
  hero: unsplash('photo-1590496793907-4d66e2994b4d', 2000),
  sea: unsplash('photo-1605745341112-85968b19335b', 800),
  air: unsplash('photo-1436491865332-7a61a109cc05', 800),
  customs: unsplash('photo-1631176315313-203dab297716', 800),
  warehouse: unsplash('photo-1553413077-190dd305871c', 800),
  whyUs: '/images/triptyque-transports.webp',
} as const;

export const CONTACT = {
  phoneDisplay: '+33 7 53 21 61 37',
  phoneHref: 'tel:+33753216137',
  email: 'contact@btslogistique.com',
  address: 'Europe - Afrique',
} as const;

export const HIGHLIGHTS = [
  { title: 'Groupage maritime', text: 'Conteneurs sécurisés, prix au m³' },
  { title: 'Fret aérien', text: 'Expéditions cargo régulières' },
  { title: 'Suivi en ligne', text: 'Chaque étape visible' },
  { title: 'Dédouanement inclus', text: 'Formalités prises en charge' },
] as const;

export const SERVICES = [
  {
    title: 'Groupage maritime',
    description: "Départs réguliers depuis l'Europe vers l'Afrique, facturation au mètre cube.",
    image: PORTAL_IMAGES.sea,
    imageAlt: 'Porte-conteneurs en mer',
  },
  {
    title: 'Fret aérien express',
    description: "Liaisons cargo rapides pour vos colis urgents de l'Europe vers l'Afrique.",
    image: PORTAL_IMAGES.air,
    imageAlt: 'Avion en vol au-dessus des nuages',
  },
  {
    title: 'Dédouanement',
    description: "Formalités portuaires et aéroportuaires prises en charge à l'arrivée.",
    image: PORTAL_IMAGES.customs,
    imageAlt: 'Conteneurs empilés sous une grue portuaire',
  },
  {
    title: 'Entreposage & Réception',
    description: "Réception, consolidation et sécurisation de vos marchandises avant expédition.",
    image: PORTAL_IMAGES.warehouse,
    imageAlt: "Allée d'entrepôt avec des étagères chargées de cartons",
  },
] as const;

export const WHY_US = [
  {
    icon: 'receipt',
    title: 'Tarifs transparents',
    text: "Un tarif clair, sans frais dissimulés à l'arrivée.",
  },
  {
    icon: 'radar',
    title: 'Suivi à chaque étape',
    text: 'Un numéro unique par colis, consultable en ligne à tout moment.',
  },
  {
    icon: 'shield',
    title: 'Douane gérée pour vous',
    text: "Nos équipes s'occupent des démarches de dédouanement à destination.",
  },
  {
    icon: 'handshake',
    title: 'Remise sécurisée',
    text: 'Remise de vos colis contre décharge et vérification de conformité.',
  },
] as const;

export type WhyUsIcon = (typeof WHY_US)[number]['icon'];

export const PROCESS_STEPS = [
  {
    title: 'Dépôt',
    description: 'Votre colis est réceptionné, mesuré et reçoit son numéro de suivi.',
  },
  {
    title: 'Transit',
    description: "Départ d'Europe par conteneur maritime ou vol cargo.",
  },
  {
    title: 'Dédouanement',
    description: "Formalités administratives et douanières à l'arrivée en Afrique.",
  },
  {
    title: 'Mise à disposition',
    description: 'Votre colis vous est remis en toute sécurité.',
  },
] as const;

export const TRACKING_STEPS: { key: PackageStatus; label: string }[] = [
  { key: 'registered', label: 'Enregistré' },
  { key: 'in_transit', label: 'En transit' },
  { key: 'arrived', label: 'Arrivé à destination' },
  { key: 'delivered', label: 'Livré' },
];

export const NETWORK_FACTS = [
  { value: 2, label: 'Continents reliés' },
  { value: Object.keys(TRANSPORT_MODE_LABELS).length, label: 'Modes de transport' },
  { value: 100, label: '% Traçabilité' },
] as const;
