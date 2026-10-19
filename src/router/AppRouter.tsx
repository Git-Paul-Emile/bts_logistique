import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Toast } from '@/components/ui/Toast';

// Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { PackageNewPage } from '@/pages/PackageNewPage';
import { PackageDetailPage } from '@/pages/PackageDetailPage';
import { ShipmentsPage } from '@/pages/ShipmentsPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { UsersPage } from '@/pages/UsersPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { notificationsApi } from '@/api/endpoints/notifications.api';

// APIs & Types
import { packagesApi } from '@/api/endpoints/packages.api';
import { clientsApi } from '@/api/endpoints/clients.api';
import { shipmentsApi } from '@/api/endpoints/shipments.api';
import { paymentsApi } from '@/api/endpoints/payments.api';
import { useQuotes } from '@/features/quotes/hooks/useQuotes';
import { usePricingGrid } from '@/features/settings/hooks/usePricingGrid';
import {
  View,
  Quote,
  Package,
  Client,
  Shipment,
  Payment,
  PaymentMethod,
  PricingGrid,
  PackageUpdateInput,
  ClientUpdateInput,
  StatusUpdateHandler,
  PACKAGE_STATUS_LABELS,
} from '@/types';

export function AppRouter() {
  const [view, setView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Operational state
  const [packages, setPackages] = useState<Package[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Le tarif maritime sert de coefficient par défaut tant que le colis n'a pas de mode de transport.
  const { grid: pricingGrid, loading: isPricingLoading, saveRates } = usePricingGrid();
  const coefficient = pricingGrid.rates.sea.client_rate_per_cbm;

  // Legacy calculator hook
  const {
    filteredQuotes,
    totalVolume,
    totalRevenue,
    isLoading: isQuotesLoading,
    search,
    setSearch,
    saveQuote,
  } = useQuotes();

  // Initial load
  useEffect(() => {
    async function loadAllData() {
      setIsDataLoading(true);
      try {
        const [pkgs, cls, shps, pays] = await Promise.all([
          packagesApi.getPackages(),
          clientsApi.getClients(),
          shipmentsApi.getShipments(),
          paymentsApi.getPayments(),
        ]);
        setPackages(pkgs);
        setClients(cls);
        setShipments(shps);
        setPayments(pays);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadAllData();
  }, []);

  // Handlers
  const handleSaveQuote = async (quote: Quote) => {
    const success = await saveQuote(quote);
    if (success) {
      setToastMessage('Calcul de transport enregistré avec succès.');
    } else {
      setToastMessage('Calcul conservé dans la session (synchronisation différée).');
    }
  };

  const handleSavePricing = async (rates: PricingGrid['rates']) => {
    await saveRates(rates);
    setToastMessage('Tarifs et marges enregistrés.');
  };

  const handleCreatePackage = async (
    pkgData: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'events'>
  ): Promise<Package> => {
    const created = await packagesApi.createPackage(pkgData);
    setPackages((prev) => [created, ...prev]);

    // If client was new, refresh clients
    const updatedClients = await clientsApi.getClients();
    setClients(updatedClients);

    // If payment was made on registration
    if (created.amount_paid > 0) {
      const newPay = await paymentsApi.recordPayment({
        client_id: created.client_id,
        client_name: created.client_name,
        package_id: created.id,
        tracking_number: created.tracking_number,
        amount: created.amount_paid,
        payment_method: 'mobile_money',
        reference: `REG-${created.tracking_number}`,
        notes: 'Paiement initial lors de l\'enregistrement',
      });
      setPayments((prev) => [newPay, ...prev]);
    }

    setToastMessage(`Colis ${created.tracking_number} enregistré avec succès !`);
    return created;
  };

  const replacePackage = (updated: Package) => {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedPackage && selectedPackage.id === updated.id) {
      setSelectedPackage(updated);
    }
  };

  const handleUpdateStatus: StatusUpdateHandler = async (id, newStatus, location, comment, agentName, notifyClient) => {
    const updated = await packagesApi.updatePackageStatus(id, newStatus, location, comment, agentName);
    if (!updated) return;
    replacePackage(updated);
    if (!notifyClient) {
      setToastMessage(`Statut mis à jour : ${updated.tracking_number}, ${PACKAGE_STATUS_LABELS[newStatus]}.`);
      return;
    }
    const notification = await notificationsApi.queueStatusNotification(
      updated,
      clients.find((client) => client.id === updated.client_id)
    );
    setToastMessage(
      notification.delivery === 'skipped'
        ? `Statut mis à jour. Client non notifié : ${notification.reason}`
        : `Statut mis à jour. E-mail de suivi en attente d’envoi à ${notification.recipient_email}.`
    );
  };

  const handleUpdatePackage = async (id: string, changes: PackageUpdateInput) => {
    const updated = await packagesApi.updatePackage(id, changes);
    if (!updated) return;
    replacePackage(updated);
    setToastMessage(`Colis ${updated.tracking_number} modifié.`);
  };

  const handleUpdateClient = async (id: string, changes: ClientUpdateInput) => {
    const updated = await clientsApi.updateClient(id, changes);
    if (!updated) return;
    setClients((prev) => prev.map((client) => (client.id === id ? updated : client)));
    setToastMessage(`Fiche de ${updated.name} mise à jour.`);
  };

  const handleRecordPayment = async (
    pkgId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string
  ) => {
    const updated = await packagesApi.recordPayment(pkgId, amount, method, reference);
    if (updated) {
      setPackages((prev) => prev.map((p) => (p.id === pkgId ? updated : p)));
      if (selectedPackage && selectedPackage.id === pkgId) {
        setSelectedPackage(updated);
      }

      const newPay = await paymentsApi.recordPayment({
        client_id: updated.client_id,
        client_name: updated.client_name,
        package_id: updated.id,
        tracking_number: updated.tracking_number,
        amount,
        payment_method: method,
        reference: reference || `PAY-${Date.now()}`,
      });
      setPayments((prev) => [newPay, ...prev]);

      setToastMessage(`Paiement de ${amount.toLocaleString('fr-FR')} F CFA enregistré.`);
    }
  };

  const handleCreateClient = async (
    data: Omit<Client, 'id' | 'created_at' | 'total_billed' | 'amount_paid' | 'package_count'>
  ): Promise<Client> => {
    const created = await clientsApi.createClient(data);
    setClients((prev) => [created, ...prev]);
    setToastMessage(`Client ${created.name} créé avec succès.`);
    return created;
  };

  const handleCreateShipment = async (
    data: Omit<Shipment, 'id' | 'created_at'>
  ): Promise<Shipment> => {
    const created = await shipmentsApi.createShipment(data);
    setShipments((prev) => [created, ...prev]);
    setToastMessage(`Conteneur ${created.container_number} planifié.`);
    return created;
  };

  // Active Back-office Content
  const activeContent = useMemo(() => {
    switch (view) {
      case 'dashboard':
        return (
          <DashboardPage
            quotes={filteredQuotes}
            coefficient={coefficient}
            totalVolume={totalVolume}
            totalRevenue={totalRevenue}
            search={search}
            setSearch={setSearch}
            onNavigate={setView}
            loading={isQuotesLoading || isDataLoading}
          />
        );

      case 'packages':
        return (
          <PackagesPage
            packages={packages}
            onNavigateNew={() => setView('package-new')}
            onSelectPackage={(pkg) => {
              setSelectedPackage(pkg);
              setView('package-detail');
            }}
            onUpdateStatus={handleUpdateStatus}
            onRecordPayment={handleRecordPayment}
            loading={isDataLoading}
          />
        );

      case 'package-new':
        return (
          <PackageNewPage
            clients={clients}
            coefficient={coefficient}
            collectorMarginPerCbm={pricingGrid.rates.sea.collector_margin_per_cbm}
            onSave={handleCreatePackage}
            onCancel={() => setView('packages')}
            onDone={(created) => {
              setSelectedPackage(created);
              setView('package-detail');
            }}
          />
        );

      case 'package-detail':
        return (
          <PackageDetailPage
            pkg={selectedPackage}
            onBack={() => setView('packages')}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePackage={handleUpdatePackage}
            onRecordPayment={handleRecordPayment}
          />
        );

      case 'shipments':
        return (
          <ShipmentsPage
            shipments={shipments}
            onCreateShipment={handleCreateShipment}
          />
        );

      case 'clients':
        return (
          <ClientsPage
            clients={clients}
            packages={packages}
            onCreateClient={handleCreateClient}
            onUpdateClient={handleUpdateClient}
            onSelectPackage={(pkg) => {
              setSelectedPackage(pkg);
              setView('package-detail');
            }}
          />
        );

      case 'payments':
        return (
          <PaymentsPage
            payments={payments}
            packages={packages}
            onRecordPayment={handleRecordPayment}
          />
        );

      case 'calculator':
        return (
          <CalculatorPage
            coefficient={coefficient}
            onSave={handleSaveQuote}
            onDone={() => setView('dashboard')}
          />
        );

      case 'history':
        return (
          <HistoryPage
            quotes={filteredQuotes}
            search={search}
            setSearch={setSearch}
          />
        );

      case 'settings':
        return (
          <SettingsPage grid={pricingGrid} loading={isPricingLoading} onSave={handleSavePricing} />
        );

      case 'notifications':
        return <NotificationsPage />;

      case 'users':
        return <UsersPage onNotify={setToastMessage} />;

      default:
        return (
          <DashboardPage
            quotes={filteredQuotes}
            coefficient={coefficient}
            totalVolume={totalVolume}
            totalRevenue={totalRevenue}
            search={search}
            setSearch={setSearch}
            onNavigate={setView}
            loading={isQuotesLoading}
          />
        );
    }
  }, [
    view,
    packages,
    clients,
    shipments,
    payments,
    selectedPackage,
    filteredQuotes,
    coefficient,
    pricingGrid,
    isPricingLoading,
    totalVolume,
    totalRevenue,
    search,
    setSearch,
    isQuotesLoading,
    isDataLoading,
  ]);

  return (
    <div className="flex min-h-screen bg-[#f6f8fa] text-[#1d1d1b]">
      <Sidebar
        view={view}
        onNavigate={setView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          view={view}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNotifications={() => setView('notifications')}
        />

        <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-[1400px]">
            {activeContent}
          </div>
        </main>

        <Footer />
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
