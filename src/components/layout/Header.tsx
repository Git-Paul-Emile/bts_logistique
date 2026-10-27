import { Menu } from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import type { View } from '@/types';
import { UserMenu } from './UserMenu';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export interface HeaderProps {
  view: View;
  onOpenMobileMenu: () => void;
  onOpenNotifications: () => void;
  onOpenPackage: (packageId: string) => void;
  onOpenProfile: () => void;
}

const titles: Record<View, string> = {
  dashboard: 'Tableau de bord',
  packages: 'Gestion des Colis & Expéditions',
  'package-new': 'Enregistrer un nouveau colis',
  'package-detail': 'Fiche détaillée du colis',
  shipments: 'Conteneurs & Lots d’expédition',
  clients: 'Gestion des Clients',
  payments: 'Gestion des Règlements & Paiements',
  settings: 'Tarifs & marges collecteurs',
  users: 'Utilisateurs & collecteurs',
  notifications: 'Notifications',
  profile: 'Mon profil',
};

export function Header({
  view,
  onOpenMobileMenu,
  onOpenNotifications,
  onOpenPackage,
  onOpenProfile,
}: HeaderProps) {
  useDocumentTitle(`${titles[view]} (gestion)`, { noIndex: true });
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu size={18} />
        </button>

        <h1 className="font-['Space_Grotesk'] text-lg font-bold text-[#003366] sm:text-xl">
          {titles[view] || 'BTS Logistique'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell onOpenPackage={onOpenPackage} onOpenAll={onOpenNotifications} />

        <div className="h-6 w-px bg-slate-200" />

        <UserMenu onOpenProfile={onOpenProfile} />
      </div>
    </header>
  );
}
