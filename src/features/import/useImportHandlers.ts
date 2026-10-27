import { useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/api/endpoints/clients.api';
import { packagesApi } from '@/api/endpoints/packages.api';
import { paymentsApi } from '@/api/endpoints/payments.api';
import { shipmentsApi } from '@/api/endpoints/shipments.api';
import { usersApi } from '@/api/endpoints/users.api';
import { queryKeys } from '@/api/queryKeys';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { refreshAfterPackageChange } from '@/features/packages/hooks/usePackages';
import type { AppUserInput } from '@/types';
import type { ClientImportItem, ClientImportPatch } from './definitions/clients.import';
import { clientsImport } from './definitions/clients.import';
import type { PackageImportItem, PackageImportPatch } from './definitions/packages.import';
import { packagesImport } from './definitions/packages.import';
import type { PaymentImportItem } from './definitions/payments.import';
import { paymentsImport } from './definitions/payments.import';
import type { ShipmentImportItem, ShipmentImportPatch } from './definitions/shipments.import';
import { shipmentsImport } from './definitions/shipments.import';
import type { UserImportPatch } from './definitions/users.import';
import { usersImport } from './definitions/users.import';
import { importedMessage } from './importMessage';
import type { ImportBatch } from './importTypes';

/** Crée un colis importé, avec le montant déjà versé comme paiement initial. */
function createImportedPackage({ tracking_number, amount_paid, ...item }: PackageImportItem) {
  void tracking_number;
  return packagesApi.create({
    ...item,
    initial_payment: amount_paid > 0 ? { amount: amount_paid, method: 'cash' } : undefined,
  });
}

/**
 * Enregistrement des lignes Excel déjà vérifiées. Chaque élément passe par la même API que la
 * saisie manuelle, l'un après l'autre ; les compléments ne remplissent que des cases vides.
 * En cas d'interruption, un nouvel import du même fichier ignore les lignes déjà enregistrées.
 */
export function useImportHandlers() {
  const queryClient = useQueryClient();
  const notify = useNotify();

  const importClients = async ({
    creates,
    completions,
    markImported,
  }: ImportBatch<ClientImportItem, ClientImportPatch>) => {
    for (const item of creates) {
      await clientsApi.create(item);
      await markImported(item);
    }
    for (const { targetId, changes } of completions) await clientsApi.update(targetId, changes);
    await queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    notify(importedMessage(clientsImport, creates.length, completions.length));
  };

  const importShipments = async ({
    creates,
    completions,
    markImported,
  }: ImportBatch<ShipmentImportItem, ShipmentImportPatch>) => {
    for (const item of creates) {
      await shipmentsApi.create(item);
      await markImported(item);
    }
    for (const { targetId, changes } of completions) await shipmentsApi.update(targetId, changes);
    await queryClient.invalidateQueries({ queryKey: queryKeys.shipments });
    notify(importedMessage(shipmentsImport, creates.length, completions.length));
  };

  const importPackages = async ({
    creates,
    completions,
    markImported,
  }: ImportBatch<PackageImportItem, PackageImportPatch>) => {
    for (const item of creates) {
      await createImportedPackage(item);
      await markImported(item);
    }
    for (const { targetId, changes } of completions) await packagesApi.update(targetId, changes);
    refreshAfterPackageChange(queryClient);
    notify(importedMessage(packagesImport, creates.length, completions.length));
  };

  const importPayments = async ({
    creates,
    markImported,
  }: ImportBatch<PaymentImportItem, never>) => {
    for (const item of creates) {
      await paymentsApi.record({
        client_id: item.clientId,
        amount: item.amount,
        method: item.method,
        reference: item.reference,
        allocations: [{ package_id: item.packageId, amount: item.amount }],
      });
      await markImported(item);
    }
    refreshAfterPackageChange(queryClient);
    notify(importedMessage(paymentsImport, creates.length));
  };

  const importUsers = async ({
    creates,
    completions,
    markImported,
  }: ImportBatch<AppUserInput, UserImportPatch>) => {
    for (const item of creates) {
      await usersApi.invite(item);
      await markImported(item);
    }
    for (const { targetId, changes } of completions) await usersApi.update(targetId, changes);
    await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    notify(importedMessage(usersImport, creates.length, completions.length));
  };

  return { importClients, importShipments, importPackages, importPayments, importUsers };
}
