import { Shipment } from '@/types';

const SHIPMENTS_STORAGE_KEY = 'bts_shipments_v1';

export const initialShipments: Shipment[] = [
  {
    id: 'shp-1',
    container_number: 'MSKU-820491-0 (Conteneur 40HQ)',
    type: 'sea',
    origin: 'Guangzhou (Chine)',
    destination: 'Abidjan (Côte d\'Ivoire)',
    status: 'in_transit',
    carrier: 'Maersk Line / Navire Maersk Mc-Kinney',
    departure_date: '2026-10-12',
    estimated_arrival: '2026-11-14',
    max_volume_cbm: 68,
    current_volume_cbm: 54.8,
    package_ids: ['pkg-1', 'pkg-4'],
    notes: 'Lot maritime N°26-OCT-GZ-ABJ. Scellé douanier N°CN984214.',
    created_at: '2026-10-08T10:00:00Z',
  },
  {
    id: 'shp-2',
    container_number: 'EK-CARGO-704 (Fret Aérien Express)',
    type: 'air',
    origin: 'Dubaï (EAU)',
    destination: 'Dakar (Sénégal)',
    status: 'arrived',
    carrier: 'Emirates SkyCargo EK9832',
    departure_date: '2026-10-08',
    estimated_arrival: '2026-10-10',
    actual_arrival: '2026-10-10',
    max_volume_cbm: 15,
    current_volume_cbm: 11.2,
    package_ids: ['pkg-2'],
    notes: 'Vol cargo direct avec escale technique. Marchandises sensibles.',
    created_at: '2026-10-04T12:00:00Z',
  },
  {
    id: 'shp-3',
    container_number: 'CMA-U781290-3 (Conteneur 20FT)',
    type: 'sea',
    origin: 'Istanbul (Turquie)',
    destination: 'Bamako (Mali) via Dakar',
    status: 'loading',
    carrier: 'CMA CGM',
    departure_date: '2026-10-24',
    estimated_arrival: '2026-11-28',
    max_volume_cbm: 33,
    current_volume_cbm: 18.5,
    package_ids: ['pkg-3'],
    notes: 'Groupage en cours au hub d\'Istanbul. Remplissage à 56%.',
    created_at: '2026-10-16T08:00:00Z',
  },
];

function loadStoredShipments(): Shipment[] {
  try {
    const raw = localStorage.getItem(SHIPMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SHIPMENTS_STORAGE_KEY, JSON.stringify(initialShipments));
      return initialShipments;
    }
    return JSON.parse(raw);
  } catch {
    return initialShipments;
  }
}

function saveShipmentsToStorage(shipments: Shipment[]) {
  try {
    localStorage.setItem(SHIPMENTS_STORAGE_KEY, JSON.stringify(shipments));
  } catch {
    // ignore
  }
}

export const shipmentsApi = {
  async getShipments(): Promise<Shipment[]> {
    return loadStoredShipments();
  },

  async getShipmentById(id: string): Promise<Shipment | null> {
    const list = loadStoredShipments();
    return list.find((s) => s.id === id) || null;
  },

  async createShipment(data: Omit<Shipment, 'id' | 'created_at'>): Promise<Shipment> {
    const list = loadStoredShipments();
    const newShipment: Shipment = {
      ...data,
      id: `shp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const nextList = [newShipment, ...list];
    saveShipmentsToStorage(nextList);
    return newShipment;
  },
};
