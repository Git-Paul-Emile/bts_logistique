import type { Package, PackageStatus, PackageUpdateInput, PaymentMethod } from '@/types';
import { computeCubicMeter, computePaymentStatus, computePrice } from '@/utils/packagePricing';
import { reportError } from '@/lib/reportError';

const PACKAGES_STORAGE_KEY = 'bts_packages_v1';

export const initialPackages: Package[] = [
  {
    id: 'pkg-1',
    tracking_number: 'BTS-CI-2026-0089',
    client_id: 'cli-1',
    client_name: 'Électro Abidjan SARL (M. Koffi)',
    description: 'Cartons composants électroniques & accessoires smartphones',
    origin: 'Guangzhou (Chine)',
    destination: "Abidjan (Côte d'Ivoire)",
    length_cm: 120,
    width_cm: 80,
    height_cm: 100,
    weight_kg: 145,
    cubic_meter: 0.96,
    coefficient: 380000,
    final_price: 364800,
    status: 'in_transit',
    payment_status: 'partial',
    amount_paid: 200000,
    created_at: '2026-10-10T08:30:00Z',
    updated_at: '2026-10-14T14:15:00Z',
    events: [
      {
        id: 'evt-101',
        package_id: 'pkg-1',
        status: 'registered',
        location: 'Entrepôt Guangzhou Hub A',
        comment: 'Réceptionné, mesuré et étiqueté. Emballage consolidé.',
        agent_name: 'Chen Wei (Agent Guangzhou)',
        created_at: '2026-10-10T08:30:00Z',
      },
      {
        id: 'evt-102',
        package_id: 'pkg-1',
        status: 'in_transit',
        location: 'Port de Nansha / Conteneur MSC-78901',
        comment: "Chargé à bord du navire en partance pour le Port Autonome d'Abidjan.",
        agent_name: 'Logistique Export BTS',
        created_at: '2026-10-14T14:15:00Z',
      },
    ],
  },
  {
    id: 'pkg-2',
    tracking_number: 'BTS-SN-2026-0042',
    client_id: 'cli-2',
    client_name: 'Boutique Touba Textile (Mme Diop)',
    description: 'Rouleaux de tissus wax et dentelles de luxe',
    origin: 'Dubaï (EAU)',
    destination: 'Dakar (Sénégal)',
    length_cm: 90,
    width_cm: 70,
    height_cm: 60,
    weight_kg: 68,
    cubic_meter: 0.378,
    coefficient: 410000,
    final_price: 154980,
    status: 'arrived',
    payment_status: 'paid',
    amount_paid: 154980,
    created_at: '2026-10-05T10:00:00Z',
    updated_at: '2026-10-17T11:20:00Z',
    events: [
      {
        id: 'evt-201',
        package_id: 'pkg-2',
        status: 'registered',
        location: 'Agence BTS Deira Dubaï',
        comment: 'Dépôt client et pesée effectuée.',
        agent_name: 'Tariq Al-Mansoor',
        created_at: '2026-10-05T10:00:00Z',
      },
      {
        id: 'evt-202',
        package_id: 'pkg-2',
        status: 'in_transit',
        location: 'Aéroport International de Dubaï (DXB)',
        comment: 'Vol cargo fret express à destination de DSS Dakar.',
        agent_name: 'Fret Aérien BTS',
        created_at: '2026-10-08T16:40:00Z',
      },
      {
        id: 'evt-203',
        package_id: 'pkg-2',
        status: 'arrived',
        location: 'Entrepôt BTS Dakar Bel-Air',
        comment: 'Colis réceptionné, dédouané et prêt pour retrait ou livraison.',
        agent_name: 'Amadou Fall (Dakar)',
        created_at: '2026-10-17T11:20:00Z',
      },
    ],
  },
  {
    id: 'pkg-3',
    tracking_number: 'BTS-ML-2026-0015',
    client_id: 'cli-3',
    client_name: 'Quincaillerie du Fleuve (M. Traoré)',
    description: 'Outillage électroportatif et pièces mécaniques',
    origin: 'Istanbul (Turquie)',
    destination: 'Bamako (Mali)',
    length_cm: 150,
    width_cm: 100,
    height_cm: 90,
    weight_kg: 210,
    cubic_meter: 1.35,
    coefficient: 395000,
    final_price: 533250,
    status: 'registered',
    payment_status: 'unpaid',
    amount_paid: 0,
    created_at: '2026-10-18T09:10:00Z',
    updated_at: '2026-10-18T09:10:00Z',
    events: [
      {
        id: 'evt-301',
        package_id: 'pkg-3',
        status: 'registered',
        location: 'Plateforme BTS Istanbul Laleli',
        comment: 'Colis enregistré au comptoir. En attente de groupage conteneur.',
        agent_name: 'Murat Yilmaz',
        created_at: '2026-10-18T09:10:00Z',
      },
    ],
  },
  {
    id: 'pkg-4',
    tracking_number: 'BTS-CI-2026-0094',
    client_id: 'cli-1',
    client_name: 'Électro Abidjan SARL (M. Koffi)',
    description: 'Écrans LED industriels & transformateurs',
    origin: 'Guangzhou (Chine)',
    destination: "Abidjan (Côte d'Ivoire)",
    length_cm: 200,
    width_cm: 60,
    height_cm: 80,
    weight_kg: 110,
    cubic_meter: 0.96,
    coefficient: 380000,
    final_price: 364800,
    status: 'delivered',
    payment_status: 'paid',
    amount_paid: 364800,
    created_at: '2026-09-20T11:00:00Z',
    updated_at: '2026-10-12T16:00:00Z',
    events: [
      {
        id: 'evt-401',
        package_id: 'pkg-4',
        status: 'registered',
        location: 'Guangzhou Hub',
        comment: 'Prise en charge entrepôt.',
        agent_name: 'Chen Wei',
        created_at: '2026-09-20T11:00:00Z',
      },
      {
        id: 'evt-402',
        package_id: 'pkg-4',
        status: 'delivered',
        location: 'Abidjan - Magasin Treichville',
        comment: 'Livré au destinataire en mains propres contre signature de décharge.',
        agent_name: 'Thomas Lefèvre',
        created_at: '2026-10-12T16:00:00Z',
      },
    ],
  },
];

function loadStoredPackages(): Package[] {
  try {
    const raw = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(initialPackages));
      return initialPackages;
    }
    return JSON.parse(raw);
  } catch (error) {
    reportError('packages.api : loadStoredPackages', error);
    return initialPackages;
  }
}

function savePackagesToStorage(packages: Package[]) {
  try {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
  } catch (error) {
    reportError('packages.api : savePackagesToStorage', error);
  }
}

export const packagesApi = {
  async getPackages(): Promise<Package[]> {
    return loadStoredPackages();
  },

  async getPackageById(id: string): Promise<Package | null> {
    const list = loadStoredPackages();
    return list.find((p) => p.id === id) || null;
  },

  async getPackageByTracking(tracking: string): Promise<Package | null> {
    const normalized = tracking.trim().toUpperCase();
    const list = loadStoredPackages();
    return list.find((p) => p.tracking_number.toUpperCase() === normalized) || null;
  },

  async createPackage(
    data: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'events'>
  ): Promise<Package> {
    const list = loadStoredPackages();
    const now = new Date().toISOString();
    const id = `pkg-${crypto.randomUUID()}`;
    const initialEvent = {
      id: `evt-${crypto.randomUUID()}`,
      package_id: id,
      status: data.status || 'registered',
      location: data.origin,
      comment: 'Colis enregistré en entrepôt et étiqueté pour expédition.',
      agent_name: 'Gestionnaire BTS',
      created_at: now,
    };

    const newPackage: Package = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
      events: [initialEvent],
    };

    const nextList = [newPackage, ...list];
    savePackagesToStorage(nextList);
    return newPackage;
  },

  async updatePackageStatus(
    id: string,
    newStatus: PackageStatus,
    location: string,
    comment: string,
    agentName: string
  ): Promise<Package | null> {
    const list = loadStoredPackages();
    const index = list.findIndex((p) => p.id === id);
    const current = list[index];
    if (!current) return null;
    const now = new Date().toISOString();
    const newEvent = {
      id: `evt-${crypto.randomUUID()}`,
      package_id: id,
      status: newStatus,
      location: location || current.destination,
      comment: comment || `Mise à jour du statut : ${newStatus}`,
      agent_name: agentName || 'Agent Logistique',
      created_at: now,
    };

    const updated: Package = {
      ...current,
      status: newStatus,
      updated_at: now,
      events: [newEvent, ...(current.events || [])],
    };

    list[index] = updated;
    savePackagesToStorage(list);
    return updated;
  },

  async updatePackage(id: string, changes: PackageUpdateInput): Promise<Package | null> {
    const list = loadStoredPackages();
    const index = list.findIndex((p) => p.id === id);
    const current = list[index];
    if (!current) return null;
    const cubicMeter = computeCubicMeter(changes.length_cm, changes.width_cm, changes.height_cm);
    const finalPrice = computePrice(cubicMeter, changes.coefficient);
    const updated: Package = {
      ...current,
      ...changes,
      cubic_meter: cubicMeter,
      final_price: finalPrice,
      payment_status: computePaymentStatus(current.amount_paid, finalPrice),
      updated_at: new Date().toISOString(),
    };

    list[index] = updated;
    savePackagesToStorage(list);
    return updated;
  },

  async recordPayment(
    id: string,
    amount: number,
    _method: PaymentMethod,
    _reference?: string
  ): Promise<Package | null> {
    const list = loadStoredPackages();
    const index = list.findIndex((p) => p.id === id);
    const current = list[index];
    if (!current) return null;
    const newAmountPaid = (current.amount_paid || 0) + amount;
    const paymentStatus = computePaymentStatus(newAmountPaid, current.final_price);

    const updated: Package = {
      ...current,
      amount_paid: newAmountPaid,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    list[index] = updated;
    savePackagesToStorage(list);
    return updated;
  },
};
