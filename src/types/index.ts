// ─── Navigation ─────────────────────────────────────────────────────────────
export type View =
  | 'dashboard'
  | 'packages'
  | 'package-new'
  | 'package-detail'
  | 'shipments'
  | 'clients'
  | 'payments'
  | 'calculator'
  | 'history'
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
  package_id: string;
  status: PackageStatus;
  location?: string;
  comment?: string;
  agent_name: string;
  created_at: string;
}

export interface Package {
  id: string;
  tracking_number: string;
  client_id: string;
  client_name?: string;
  description?: string;
  origin: string;
  destination: string;
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

/** Champs modifiables après l'enregistrement. Le volume et le prix sont recalculés. */
export type PackageUpdateInput = Pick<
  Package,
  | 'description'
  | 'origin'
  | 'destination'
  | 'length_cm'
  | 'width_cm'
  | 'height_cm'
  | 'weight_kg'
  | 'coefficient'
>;

export type StatusUpdateHandler = (
  id: string,
  status: PackageStatus,
  location: string,
  comment: string,
  agentName: string,
  notifyClient: boolean
) => Promise<void>;

// ─── Client ──────────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_billed: number;
  amount_paid: number;
  package_count: number;
  created_at: string;
}

export type ClientUpdateInput = Pick<Client, 'name' | 'phone' | 'email' | 'address'>;

// ─── Payment ─────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  client_id: string;
  client_name?: string;
  package_id?: string;
  tracking_number?: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  created_at: string;
}

// ─── Legacy (calculator quotes) ──────────────────────────────────────────────
export interface Quote {
  id: string;
  recipient_name: string;
  destination: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  cubic_meter: number;
  coefficient: number;
  final_price: number;
  created_at: string;
}

export interface CalculationInput {
  recipient_name: string;
  destination: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
}

export interface PricingSettings {
  id: number;
  coefficient: number;
  updated_at?: string;
}

/** Personne connectée : son compte, sans les champs d'administration. */
export interface UserSession extends Omit<AppUser, 'active' | 'created_at' | 'archived_at'> {
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
  status: ShipmentStatus;
  carrier: string;
  departure_date?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  max_volume_cbm: number;
  current_volume_cbm: number;
  package_ids: string[];
  notes?: string;
  created_at: string;
}

export const BTS_ORIGINS: readonly [string, ...string[]] = [
  'Guangzhou (Chine)',
  'Yiwu (Chine)',
  'Dubaï (EAU)',
  'Istanbul (Turquie)',
  'Paris / Le Havre (France)',
];

export const BTS_DESTINATIONS: readonly [string, ...string[]] = [
  "Abidjan (Côte d'Ivoire)",
  'Dakar (Sénégal)',
  'Bamako (Mali)',
  'Ouagadougou (Burkina Faso)',
  'Douala (Cameroun)',
  'Lomé (Togo)',
  'Cotonou (Bénin)',
];

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
  agency: string;
  active: boolean;
  created_at: string;
  /**
   * Renseigné quand la personne a supprimé son compte. Le compte n'est jamais effacé :
   * les colis et paiements qui y sont liés restent rattachés, et un administrateur peut le restaurer.
   */
  archived_at?: string;
}

export type AppUserInput = Omit<AppUser, 'id' | 'created_at' | 'active' | 'archived_at'>;

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

export type NewNotification = Omit<AppNotification, 'id' | 'read' | 'created_at'>;
