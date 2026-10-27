// ─── Navigation ─────────────────────────────────────────────────────────────
export type View =
  | 'dashboard'
  | 'packages'
  | 'package-new'
  | 'package-detail'
  | 'shipments'
  | 'clients'
  | 'payments'
  | 'settings'
  | 'users'
  | 'notifications'
  | 'profile';

// ─── Package statuses ────────────────────────────────────────────────────────
export type PackageStatus =
  'registered' | 'in_transit' | 'arrived' | 'delivered' | 'returned' | 'on_hold' | 'cancelled';

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  registered: 'Enregistré',
  in_transit: 'En transit',
  arrived: 'Arrivé à destination',
  delivered: 'Livré au client',
  returned: 'Retourné',
  on_hold: 'En attente douane',
  cancelled: 'Annulé',
};

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'transfer' | 'mobile_money' | 'other';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Non payé',
  partial: 'Partiellement payé',
  paid: 'Payé',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  transfer: 'Virement bancaire',
  mobile_money: 'Mobile Money (Wave/Orange/MTN)',
  other: 'Autre',
};

// ─── Shipment / Container statuses ───────────────────────────────────────────
export type ShipmentStatus =
  'planned' | 'loading' | 'in_transit' | 'customs' | 'arrived' | 'unloaded';

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  planned: 'Planifié',
  loading: 'En cours de chargement',
  in_transit: 'En mer / En vol',
  customs: 'En dédouanement',
  arrived: 'Arrivé au port / aéroport',
  unloaded: 'Dépoté / Prêt pour retrait',
};

// ─── Package ─────────────────────────────────────────────────────────────────
export interface PackageEvent {
  id: string;
  status: PackageStatus;
  /** Lieu tel que l'agent l'a décrit, ou à défaut la ville du réseau. */
  location?: string;
  comment?: string;
  /** Personne qui a enregistré l'étape ; « Système » pour une étape automatique. */
  agent_name: string;
  created_at: string;
}

export interface Package {
  id: string;
  tracking_number: string;
  client_id: string;
  client_name?: string;
  description?: string;
  /** Libellés affichés ; les codes servent aux formulaires et à l'API. */
  origin: string;
  destination: string;
  origin_code: string;
  destination_code: string;
  agency_name: string;
  collector_name?: string;
  shipment_id?: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  cubic_meter: number;
  coefficient: number;
  final_price: number;
  /** Absent sur les colis créés avant l'ajout du mode : ils sont traités comme maritimes. */
  transport_mode?: TransportMode;
  /** Marge collecteur figée à l'enregistrement, en F CFA, comprise dans final_price. */
  collector_margin?: number;
  status: PackageStatus;
  payment_status: PaymentStatus;
  amount_paid: number;
  created_at: string;
  updated_at: string;
  events?: PackageEvent[];
}

/** Champs modifiables après l'enregistrement. Le serveur recalcule volume, prix et marge. */
export interface PackageUpdateInput {
  description?: string | null;
  origin_code?: string;
  destination_code?: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
  /** Tarif personnalisé : réservé à l'équipe. */
  rate_per_cbm?: number;
}

/** Nouvelle étape de suivi. L'agent est la personne connectée, enregistrée par le serveur. */
export interface StatusUpdateInput {
  status: PackageStatus;
  location: string;
  comment?: string;
  notifyClient: boolean;
}

// ─── Client ──────────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  agency_code: string;
  agency_name: string;
  /** Montants calculés par le serveur ; absents pour un collecteur, qui ne les voit pas. */
  total_billed: number;
  amount_paid: number;
  /** Reste à payer ; négatif quand le client a versé une avance. */
  balance: number;
  has_debt: boolean;
  package_count: number;
  created_at: string;
}

export type ClientUpdateInput = Pick<Client, 'name' | 'phone' | 'email' | 'address'>;

export interface NewClientInput extends ClientUpdateInput {
  /** Équipe seulement ; un collecteur enregistre toujours dans son agence. */
  agency_code?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export interface PaymentAllocation {
  package_id: string;
  tracking_number: string;
  amount: number;
}

export interface Payment {
  id: string;
  client_id: string;
  client_name?: string;
  /** Premier colis réglé, pour les écrans qui n'en montrent qu'un. */
  package_id?: string;
  tracking_number?: string;
  /** Répartition du versement sur les colis du client. */
  allocations: PaymentAllocation[];
  /** Négatif sur une écriture d'annulation. */
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  author_name: string;
  reverses_payment_id?: string;
  reversed_by_payment_id?: string;
  created_at: string;
}

/** Personne connectée : son compte, sans les champs d'administration. */
export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  agency: string;
  agency_code: string;
  initials: string;
}

export type ProfileUpdateInput = Pick<AppUser, 'name' | 'email' | 'phone'>;

// ─── Shipment / Container (Groupage) ─────────────────────────────────────────
export interface Shipment {
  id: string;
  container_number: string;
  type: 'sea' | 'air';
  origin: string;
  destination: string;
  origin_code: string;
  destination_code: string;
  status: ShipmentStatus;
  carrier: string;
  departure_date?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  max_volume_cbm: number;
  current_volume_cbm: number;
  package_count: number;
  notes?: string;
  created_at: string;
}

// ─── Pricing grid ────────────────────────────────────────────────────────────
export type TransportMode = 'sea' | 'air';

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  sea: 'Maritime',
  air: 'Aérien',
};

/**
 * Tarif d'un mode de transport. La marge collecteur est un montant fixe par m³,
 * comprise dans le prix client : la part BTS est la différence des deux.
 */
export interface ModeRate {
  client_rate_per_cbm: number;
  collector_margin_per_cbm: number;
}

export interface PricingGrid {
  rates: Record<TransportMode, ModeRate>;
  updated_at: string;
}

// ─── Staff accounts ──────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'manager' | 'collector';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  collector: 'Collecteur',
};

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Accès complet, y compris tarifs et comptes.',
  manager: 'Gère colis, clients, paiements et conteneurs.',
  collector: 'Enregistre les colis de son agence et voit sa marge.',
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Libellé de l'agence ; son code sert aux formulaires. */
  agency: string;
  agency_code: string;
  active: boolean;
  /** Vrai tant que la personne invitée n'a pas choisi son mot de passe. */
  invitation_pending: boolean;
  created_at: string;
  /**
   * Renseigné quand la personne a supprimé son compte. Le compte n'est jamais effacé :
   * les colis et paiements qui y sont liés restent rattachés, et un administrateur peut le restaurer.
   */
  archived_at?: string;
}

export interface AppUserInput {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  agency_code: string;
}

// ─── Staff notifications ─────────────────────────────────────────────────────
export type NotificationCategory = 'package' | 'payment' | 'email';

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  package: 'Colis',
  payment: 'Paiements',
  email: 'E-mails clients',
};

export type NotificationDelivery = 'queued' | 'sent' | 'failed' | 'skipped';

export const NOTIFICATION_DELIVERY_LABELS: Record<NotificationDelivery, string> = {
  queued: 'En attente d’envoi',
  sent: 'Envoyé',
  failed: 'Échec',
  skipped: 'Non envoyé',
};

/** Événement affiché au personnel dans la cloche et sur la page des notifications. */
export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  package_id?: string;
  tracking_number?: string;
  /** Renseigné seulement pour les e-mails envoyés aux clients. */
  delivery?: NotificationDelivery;
  read: boolean;
  created_at: string;
}

// ─── Lieux du réseau ─────────────────────────────────────────────────────────
export interface NetworkLocation {
  code: string;
  name: string;
  country_code: string;
  is_origin: boolean;
  is_destination: boolean;
  agency: { code: string; name: string } | null;
}
