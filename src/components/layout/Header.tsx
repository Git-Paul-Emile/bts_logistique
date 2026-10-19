import { Bell, Menu } from 'lucide-react';
import { View } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export interface HeaderProps {
  view: View;
  onOpenMobileMenu: () => void;
  onOpenNotifications: () => void;
}

const titles: Record<View, string> = {
  dashboard: 'Tableau de bord',
  packages: 'Gestion des Colis & Expéditions',
  'package-new': 'Enregistrer un nouveau colis',
  'package-detail': 'Fiche détaillée du colis',
  shipments: 'Conteneurs & Lots d’expédition',
  clients: 'Gestion des Clients',
  payments: 'Gestion des Règlements & Paiements',
  calculator: 'Calculateur de devis rapide',
  history: 'Historique des calculs & archives',
  settings: 'Tarifs & marges collecteurs',
  users: 'Utilisateurs & collecteurs',
  notifications: 'Journal des notifications',
};

export function Header({ view, onOpenMobileMenu, onOpenNotifications }: HeaderProps) {
  const { user } = useAuth();
  useDocumentTitle(`${titles[view]} (gestion)`);
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
        <button
          type="button"
          onClick={onOpenNotifications}
          className="p-2 text-slate-500 hover:text-slate-800 transition"
          aria-label="Ouvrir le journal des notifications"
        >
          <Bell size={18} />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {user && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#003366] text-xs font-bold text-white">
              {user.initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[#1d1d1b]">{user.name}</p>
              <p className="text-[11px] text-slate-500">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
