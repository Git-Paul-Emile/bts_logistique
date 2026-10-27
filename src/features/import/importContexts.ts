// Données enregistrées, lues sur le serveur au moment de vérifier un fichier Excel : doublons,
// fiches à compléter, clients et colis cités par les lignes. L'import est une opération
// ponctuelle de l'équipe ; il lit toutes les pages, les écrans n'en affichent qu'une.
import { clientsApi } from '@/api/endpoints/clients.api';
import { fetchAllPages } from '@/api/client';
import { locationsApi } from '@/api/endpoints/locations.api';
import { packagesApi } from '@/api/endpoints/packages.api';
import { pricingApi } from '@/api/endpoints/pricing.api';
import { shipmentsApi } from '@/api/endpoints/shipments.api';
import { usersApi } from '@/api/endpoints/users.api';
import { agenciesOf } from '@/features/locations/useLocations';
import { clientImportContext } from './definitions/clients.import';
import { packageImportContext } from './definitions/packages.import';
import { paymentImportContext } from './definitions/payments.import';
import { shipmentImportContext } from './definitions/shipments.import';
import { userImportContext } from './definitions/users.import';

const allClients = () => fetchAllPages((page, limit) => clientsApi.list({ page, limit }));
const allPackages = () => fetchAllPages((page, limit) => packagesApi.list({ page, limit }));

export async function loadClientImportContext() {
  return clientImportContext(await allClients());
}

export async function loadShipmentImportContext() {
  const [shipments, locations] = await Promise.all([
    fetchAllPages((page, limit) => shipmentsApi.list({ page, limit })),
    locationsApi.list(),
  ]);
  return shipmentImportContext(
    shipments,
    locations.filter((location) => location.is_origin),
    locations.filter((location) => location.is_destination)
  );
}

export async function loadPackageImportContext() {
  const [clients, packages, pricing, locations] = await Promise.all([
    allClients(),
    allPackages(),
    pricingApi.getPublic(),
    locationsApi.list(),
  ]);
  return packageImportContext({
    clients,
    packages,
    rates: pricing.rates,
    origins: locations.filter((location) => location.is_origin),
    destinations: locations.filter((location) => location.is_destination),
  });
}

export async function loadPaymentImportContext() {
  return paymentImportContext(await allPackages());
}

export async function loadUserImportContext() {
  const [current, archived, locations] = await Promise.all([
    fetchAllPages((page, limit) => usersApi.list({ page, limit })),
    fetchAllPages((page, limit) => usersApi.list({ page, limit, archived: true })),
    locationsApi.list(),
  ]);
  return userImportContext([...current, ...archived], agenciesOf(locations));
}
