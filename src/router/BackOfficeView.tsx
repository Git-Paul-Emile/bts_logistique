import { ClientsPage } from '@/pages/ClientsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { PackageDetailPage } from '@/pages/PackageDetailPage';
import { PackageNewPage } from '@/pages/PackageNewPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ShipmentsPage } from '@/pages/ShipmentsPage';
import { UsersPage } from '@/pages/UsersPage';
import type { View } from '@/types';

interface BackOfficeViewProps {
  view: View;
  selectedPackageId: string | null;
  onBackToPackages: () => void;
  onOpenPackage: (packageId: string) => void;
}

/**
 * Affiche la page de l'espace de gestion qui correspond à la vue choisie dans le menu. Chaque
 * page charge ses propres données depuis l'API.
 */
export function BackOfficeView({
  view,
  selectedPackageId,
  onBackToPackages,
  onOpenPackage,
}: BackOfficeViewProps) {
  switch (view) {
    case 'packages':
      return <PackagesPage />;
    case 'package-new':
      return <PackageNewPage />;
    case 'package-detail':
      return (
        <PackageDetailPage
          key={selectedPackageId}
          packageId={selectedPackageId}
          onBack={onBackToPackages}
        />
      );
    case 'shipments':
      return <ShipmentsPage />;
    case 'clients':
      return <ClientsPage />;
    case 'payments':
      return <PaymentsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'notifications':
      return <NotificationsPage onOpenPackage={onOpenPackage} />;
    case 'profile':
      return <ProfilePage />;
    case 'users':
      return <UsersPage />;
    default:
      return <DashboardPage />;
  }
}
