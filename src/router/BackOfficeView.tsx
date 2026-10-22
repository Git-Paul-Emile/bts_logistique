import type { OperationsData } from '@/features/backoffice/useOperationsData';
import type { ImportHandlers } from '@/features/import/useImportHandlers';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { PackageDetailPage } from '@/pages/PackageDetailPage';
import { PackageNewPage } from '@/pages/PackageNewPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ShipmentsPage } from '@/pages/ShipmentsPage';
import { UsersPage } from '@/pages/UsersPage';
import type { Package, PricingGrid, Quote, View } from '@/types';

interface QuotesState {
  filteredQuotes: Quote[];
  totalVolume: number;
  totalRevenue: number;
  isLoading: boolean;
  search: string;
  setSearch: (value: string) => void;
}

interface PricingState {
  grid: PricingGrid;
  loading: boolean;
  /** Prix du m³ maritime, utilisé par le calculateur et l'import des calculs. */
  coefficient: number;
  onSave: (rates: PricingGrid['rates']) => Promise<void>;
}

interface BackOfficeViewProps {
  view: View;
  data: OperationsData;
  imports: ImportHandlers;
  quotes: QuotesState;
  pricing: PricingState;
  onNavigate: (view: View) => void;
  onOpenPackage: (pkg: Package) => void;
  onOpenPackageById: (packageId: string) => void;
  onSaveQuote: (quote: Quote) => Promise<void>;
  notify: (message: string) => void;
}

/** Affiche la page de l'espace de gestion qui correspond à la vue choisie dans le menu. */
export function BackOfficeView({
  view,
  data,
  imports,
  quotes,
  pricing,
  onNavigate,
  onOpenPackage,
  onOpenPackageById,
  onSaveQuote,
  notify,
}: BackOfficeViewProps) {
  const dashboard = (loading: boolean) => (
    <DashboardPage
      quotes={quotes.filteredQuotes}
      coefficient={pricing.coefficient}
      totalVolume={quotes.totalVolume}
      totalRevenue={quotes.totalRevenue}
      search={quotes.search}
      setSearch={quotes.setSearch}
      onNavigate={onNavigate}
      loading={loading}
    />
  );

  switch (view) {
    case 'dashboard':
      return dashboard(quotes.isLoading || data.isDataLoading);

    case 'packages':
      return (
        <PackagesPage
          packages={data.packages}
          clients={data.clients}
          rates={pricing.grid.rates}
          onImportPackages={imports.importPackages}
          onNavigateNew={() => onNavigate('package-new')}
          onSelectPackage={onOpenPackage}
          onUpdateStatus={data.updateStatus}
          onRecordPayment={data.recordPayment}
          loading={data.isDataLoading}
        />
      );

    case 'package-new':
      return (
        <PackageNewPage
          clients={data.clients}
          rates={pricing.grid.rates}
          onSave={data.createPackage}
          onCancel={() => onNavigate('packages')}
          onDone={onOpenPackage}
        />
      );

    case 'package-detail':
      return (
        <PackageDetailPage
          pkg={data.selectedPackage}
          onBack={() => onNavigate('packages')}
          onUpdateStatus={data.updateStatus}
          onUpdatePackage={data.updatePackage}
          onSendTracking={data.sendTracking}
          onNotify={notify}
          onRecordPayment={data.recordPayment}
        />
      );

    case 'shipments':
      return (
        <ShipmentsPage
          shipments={data.shipments}
          onCreateShipment={data.createShipment}
          onImportShipments={imports.importShipments}
        />
      );

    case 'clients':
      return (
        <ClientsPage
          clients={data.clients}
          packages={data.packages}
          payments={data.payments}
          onCreateClient={data.createClient}
          onUpdateClient={data.updateClient}
          onImportClients={imports.importClients}
          onSelectPackage={onOpenPackage}
        />
      );

    case 'payments':
      return (
        <PaymentsPage
          payments={data.payments}
          packages={data.packages}
          onImportPayments={imports.importPayments}
          onRecordPayment={data.recordPayment}
        />
      );

    case 'calculator':
      return (
        <CalculatorPage
          coefficient={pricing.coefficient}
          onSave={onSaveQuote}
          onDone={() => onNavigate('dashboard')}
        />
      );

    case 'history':
      return (
        <HistoryPage
          quotes={quotes.filteredQuotes}
          search={quotes.search}
          setSearch={quotes.setSearch}
          coefficient={pricing.coefficient}
          onImportQuotes={imports.importQuotes}
        />
      );

    case 'settings':
      return <SettingsPage grid={pricing.grid} loading={pricing.loading} onSave={pricing.onSave} />;

    case 'notifications':
      return <NotificationsPage onOpenPackage={onOpenPackageById} />;

    case 'profile':
      return <ProfilePage onNotify={notify} />;

    case 'users':
      return <UsersPage onNotify={notify} />;

    default:
      return dashboard(quotes.isLoading);
  }
}
