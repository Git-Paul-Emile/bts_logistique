import { useEffect, useState } from 'react';
import { clientsApi } from '@/api/endpoints/clients.api';
import { packagesApi } from '@/api/endpoints/packages.api';
import { paymentsApi } from '@/api/endpoints/payments.api';
import { shipmentsApi } from '@/api/endpoints/shipments.api';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import {
  clientEmailNotification,
  packageCreatedNotification,
  paymentReceivedNotification,
  statusChangedNotification,
} from '@/features/notifications/notificationBuilders';
import type {
  Client,
  ClientUpdateInput,
  Package,
  PackageUpdateInput,
  Payment,
  PaymentMethod,
  Shipment,
  StatusUpdateHandler,
} from '@/types';
import { PACKAGE_STATUS_LABELS } from '@/types';

export type NewPackageInput = Omit<Package, 'id' | 'created_at' | 'updated_at' | 'events'>;
export type NewClientInput = Omit<
  Client,
  'id' | 'created_at' | 'total_billed' | 'amount_paid' | 'package_count'
>;
export type NewShipmentInput = Omit<Shipment, 'id' | 'created_at'>;

/**
 * Données de l'espace de gestion (colis, clients, conteneurs, paiements) et actions qui les
 * modifient. `notify` affiche le message de confirmation de chaque action.
 */
export function useOperationsData(notify: (message: string) => void) {
  const { push: pushNotification } = useNotifications();
  const [packages, setPackages] = useState<Package[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      packagesApi.getPackages(),
      clientsApi.getClients(),
      shipmentsApi.getShipments(),
      paymentsApi.getPayments(),
    ])
      .then(([loadedPackages, loadedClients, loadedShipments, loadedPayments]) => {
        if (cancelled) return;
        setPackages(loadedPackages);
        setClients(loadedClients);
        setShipments(loadedShipments);
        setPayments(loadedPayments);
      })
      .finally(() => {
        if (!cancelled) setIsDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Remplace un colis modifié dans la liste et dans la fiche ouverte. */
  const replacePackages = (updatedById: ReadonlyMap<string, Package>) => {
    setPackages((previous) => previous.map((pkg) => updatedById.get(pkg.id) ?? pkg));
    setSelectedPackage((current) => (current ? (updatedById.get(current.id) ?? current) : current));
  };

  // Met l'e-mail de suivi en file (ou signale l'absence d'adresse) et l'inscrit dans les notifications.
  const emailClient = (pkg: Package, clientList: Client[] = clients) =>
    pushNotification(
      clientEmailNotification(
        pkg,
        clientList.find((client) => client.id === pkg.client_id)
      )
    );

  const createPackage = async (input: NewPackageInput): Promise<Package> => {
    const created = await packagesApi.createPackage(input);
    setPackages((previous) => [created, ...previous]);

    // Un nouveau client a pu être créé avec le colis : la liste est rechargée.
    const updatedClients = await clientsApi.getClients();
    setClients(updatedClients);

    if (created.amount_paid > 0) {
      const payment = await paymentsApi.recordPayment({
        client_id: created.client_id,
        client_name: created.client_name,
        package_id: created.id,
        tracking_number: created.tracking_number,
        amount: created.amount_paid,
        payment_method: 'mobile_money',
        reference: `REG-${created.tracking_number}`,
        notes: "Paiement initial lors de l'enregistrement",
      });
      setPayments((previous) => [payment, ...previous]);
    }

    await pushNotification(packageCreatedNotification(created));
    const email = await emailClient(created, updatedClients);
    notify(`Colis ${created.tracking_number} enregistré. ${email.message}`);
    return created;
  };

  const sendTracking = async (pkg: Package) => {
    const email = await emailClient(pkg);
    notify(`Suivi de ${pkg.tracking_number} : ${email.message}`);
  };

  const updateStatus: StatusUpdateHandler = async (
    id,
    newStatus,
    location,
    comment,
    agentName,
    notifyClient
  ) => {
    const updated = await packagesApi.updatePackageStatus(
      id,
      newStatus,
      location,
      comment,
      agentName
    );
    if (!updated) return;
    replacePackages(new Map([[updated.id, updated]]));
    await pushNotification(statusChangedNotification(updated));
    if (!notifyClient) {
      notify(
        `Statut mis à jour : ${updated.tracking_number}, ${PACKAGE_STATUS_LABELS[newStatus]}.`
      );
      return;
    }
    const email = await emailClient(updated);
    notify(`Statut mis à jour. ${email.message}`);
  };

  const updatePackage = async (id: string, changes: PackageUpdateInput) => {
    const updated = await packagesApi.updatePackage(id, changes);
    if (!updated) return;
    replacePackages(new Map([[updated.id, updated]]));
    notify(`Colis ${updated.tracking_number} modifié.`);
  };

  const updateClient = async (id: string, changes: ClientUpdateInput) => {
    const updated = await clientsApi.updateClient(id, changes);
    if (!updated) return;
    setClients((previous) => previous.map((client) => (client.id === id ? updated : client)));
    notify(`Fiche de ${updated.name} mise à jour.`);
  };

  const recordPayment = async (
    packageId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string
  ) => {
    const updated = await packagesApi.recordPayment(packageId, amount, method, reference);
    if (!updated) return;
    replacePackages(new Map([[updated.id, updated]]));
    const payment = await paymentsApi.recordPayment({
      client_id: updated.client_id,
      client_name: updated.client_name,
      package_id: updated.id,
      tracking_number: updated.tracking_number,
      amount,
      payment_method: method,
      reference: reference || `PAY-${Date.now()}`,
    });
    setPayments((previous) => [payment, ...previous]);
    await pushNotification(paymentReceivedNotification(updated, amount));
    notify(`Paiement de ${amount.toLocaleString('fr-FR')} F CFA enregistré.`);
  };

  const createClient = async (input: NewClientInput): Promise<Client> => {
    const created = await clientsApi.createClient(input);
    setClients((previous) => [created, ...previous]);
    notify(`Client ${created.name} créé avec succès.`);
    return created;
  };

  const createShipment = async (input: NewShipmentInput): Promise<Shipment> => {
    const created = await shipmentsApi.createShipment(input);
    setShipments((previous) => [created, ...previous]);
    notify(`Conteneur ${created.container_number} planifié.`);
    return created;
  };

  return {
    packages,
    clients,
    shipments,
    payments,
    selectedPackage,
    isDataLoading,
    setPackages,
    setClients,
    setShipments,
    setPayments,
    setSelectedPackage,
    replacePackages,
    createPackage,
    sendTracking,
    updateStatus,
    updatePackage,
    updateClient,
    recordPayment,
    createClient,
    createShipment,
  };
}

export type OperationsData = ReturnType<typeof useOperationsData>;
