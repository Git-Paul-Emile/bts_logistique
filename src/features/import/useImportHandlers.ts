import { clientsApi } from '@/api/endpoints/clients.api';
import { packagesApi } from '@/api/endpoints/packages.api';
import { paymentsApi } from '@/api/endpoints/payments.api';
import { shipmentsApi } from '@/api/endpoints/shipments.api';
import type { OperationsData } from '@/features/backoffice/useOperationsData';
import type { Client, Package, Payment, Quote, Shipment } from '@/types';
import { generateUniqueTrackingNumber } from '@/utils/trackingNumber';
import type { ClientImportItem, ClientImportPatch } from './definitions/clients.import';
import { clientsImport } from './definitions/clients.import';
import type { PackageImportItem, PackageImportPatch } from './definitions/packages.import';
import { packagesImport } from './definitions/packages.import';
import type { PaymentImportItem } from './definitions/payments.import';
import { paymentsImport } from './definitions/payments.import';
import type { QuoteImportItem } from './definitions/quotes.import';
import { quotesImport } from './definitions/quotes.import';
import type { ShipmentImportItem, ShipmentImportPatch } from './definitions/shipments.import';
import { shipmentsImport } from './definitions/shipments.import';
import { importedMessage } from './importMessage';
import type { ImportBatch } from './importTypes';

interface ImportHandlersOptions {
  data: OperationsData;
  saveQuote: (quote: Quote) => Promise<boolean>;
  notify: (message: string) => void;
}

/** Place les éléments créés en tête de liste et remplace ceux qui ont été complétés. */
function mergeImported<Item extends { id: string }>(
  created: Item[],
  updatedById: ReadonlyMap<string, Item>
) {
  return (previous: Item[]) => [
    ...created,
    ...previous.map((item) => updatedById.get(item.id) ?? item),
  ];
}

/**
 * Enregistrement des lignes Excel déjà vérifiées. Chaque élément passe par la même API que la
 * saisie manuelle ; les compléments ne remplissent que des cases vides.
 */
export function useImportHandlers({ data, saveQuote, notify }: ImportHandlersOptions) {
  const importClients = async ({
    creates,
    completions,
  }: ImportBatch<ClientImportItem, ClientImportPatch>) => {
    const created: Client[] = [];
    for (const item of creates) created.push(await clientsApi.createClient(item));
    const updatedById = new Map<string, Client>();
    for (const { targetId, changes } of completions) {
      const target = data.clients.find((client) => client.id === targetId);
      if (!target) continue;
      const { name, phone, email, address } = { ...target, ...changes };
      const updated = await clientsApi.updateClient(targetId, { name, phone, email, address });
      if (updated) updatedById.set(updated.id, updated);
    }
    data.setClients(mergeImported(created, updatedById));
    notify(importedMessage(clientsImport, created.length, updatedById.size));
  };

  const importShipments = async ({
    creates,
    completions,
  }: ImportBatch<ShipmentImportItem, ShipmentImportPatch>) => {
    const created: Shipment[] = [];
    for (const item of creates) created.push(await shipmentsApi.createShipment(item));
    const updatedById = new Map<string, Shipment>();
    for (const { targetId, changes } of completions) {
      const updated = await shipmentsApi.updateShipment(targetId, changes);
      if (updated) updatedById.set(updated.id, updated);
    }
    data.setShipments(mergeImported(created, updatedById));
    notify(importedMessage(shipmentsImport, created.length, updatedById.size));
  };

  /** Crée un colis importé, et le paiement déjà versé s'il y en a un. */
  const createImportedPackage = async (item: PackageImportItem, takenNumbers: Set<string>) => {
    const created = await packagesApi.createPackage({
      ...item,
      tracking_number:
        item.tracking_number || generateUniqueTrackingNumber(item.destination, takenNumbers),
    });
    if (created.amount_paid <= 0) return { created, payment: null };
    const payment = await paymentsApi.recordPayment({
      client_id: created.client_id,
      client_name: created.client_name,
      package_id: created.id,
      tracking_number: created.tracking_number,
      amount: created.amount_paid,
      payment_method: 'cash',
      reference: `IMPORT-${created.tracking_number}`,
      notes: 'Montant déjà payé, repris lors de l’import Excel',
    });
    return { created, payment };
  };

  /** Complète la description d'un colis existant ; le reste de la fiche est conservé. */
  const completeImportedPackage = (target: Package, changes: PackageImportPatch) =>
    packagesApi.updatePackage(target.id, {
      description: changes.description ?? target.description,
      origin: target.origin,
      destination: target.destination,
      length_cm: target.length_cm,
      width_cm: target.width_cm,
      height_cm: target.height_cm,
      weight_kg: target.weight_kg,
      coefficient: target.coefficient,
    });

  const importPackages = async ({
    creates,
    completions,
  }: ImportBatch<PackageImportItem, PackageImportPatch>) => {
    const takenNumbers = new Set(data.packages.map((pkg) => pkg.tracking_number));
    const createdPackages: Package[] = [];
    const createdPayments: Payment[] = [];
    for (const item of creates) {
      const { created, payment } = await createImportedPackage(item, takenNumbers);
      createdPackages.push(created);
      if (payment) createdPayments.push(payment);
    }
    const updatedById = new Map<string, Package>();
    for (const { targetId, changes } of completions) {
      const target = data.packages.find((pkg) => pkg.id === targetId);
      const updated = target ? await completeImportedPackage(target, changes) : null;
      if (updated) updatedById.set(updated.id, updated);
    }
    data.setPackages(mergeImported(createdPackages, updatedById));
    data.setPayments((previous) => [...createdPayments, ...previous]);
    data.setClients(await clientsApi.getClients());
    notify(importedMessage(packagesImport, createdPackages.length, updatedById.size));
  };

  const importPayments = async ({ creates }: ImportBatch<PaymentImportItem, never>) => {
    const updatedById = new Map<string, Package>();
    const createdPayments: Payment[] = [];
    for (const item of creates) {
      const updated = await packagesApi.recordPayment(
        item.packageId,
        item.amount,
        item.method,
        item.reference
      );
      if (!updated) continue;
      updatedById.set(updated.id, updated);
      createdPayments.push(
        await paymentsApi.recordPayment({
          client_id: updated.client_id,
          client_name: updated.client_name,
          package_id: updated.id,
          tracking_number: updated.tracking_number,
          amount: item.amount,
          payment_method: item.method,
          reference: item.reference || `IMPORT-${updated.tracking_number}`,
        })
      );
    }
    data.replacePackages(updatedById);
    data.setPayments((previous) => [...createdPayments, ...previous]);
    notify(importedMessage(paymentsImport, createdPayments.length));
  };

  const importQuotes = async ({ creates }: ImportBatch<QuoteImportItem, never>) => {
    for (const item of creates) {
      await saveQuote({ ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    }
    notify(importedMessage(quotesImport, creates.length));
  };

  return { importClients, importShipments, importPackages, importPayments, importQuotes };
}

export type ImportHandlers = ReturnType<typeof useImportHandlers>;
