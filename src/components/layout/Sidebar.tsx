import {
  Bell,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  PackagePlus,
  Settings,
  Ship,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/useAuth';
import { PATHS } from '@/router/paths';
import type { View } from '@/types';
import { USER_ROLE_LABELS } from '@/types';
import { canAccessView } from '@/features/auth/permissions';

export interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavSection {
  title: string;
  items: { id: View; label: string; icon: typeof LayoutDashboard }[];
}

const navSections: NavSection[] = [
  {
    title: 'Opérations',
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'packages', label: 'Gestion des Colis', icon: Package },
      { id: 'package-new', label: 'Nouveau colis', icon: PackagePlus },
      { id: 'shipments', label: 'Conteneurs & Lots', icon: Ship },
    ],
  },
  {
    title: 'Commercial & Comptabilité',
    items: [
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'payments', label: 'Paiements & Caisse', icon: CreditCard },
    ],
  },
  {
    title: 'Administration',
    items: [
      { id: 'settings', label: 'Tarifs & marges', icon: Settings },
      { id: 'users', label: 'Utilisateurs & collecteurs', icon: UserCog },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

export function Sidebar({ view, onNavigate, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleSections = user
    ? navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => canAccessView(user.role, item.id)),
        }))
        .filter((section) => section.items.length > 0)
    : [];

  const handleSelect = (nextView: View) => {
    onNavigate(nextView);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = async () => {
    await logout();
    navigate(PATHS.login, { replace: true });
  };

  return (
    <>
      {mobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col bg-[#002244] px-4 py-6 text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Logo variant="horizontal" theme="dark" size="md" />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-md p-1 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
              <nav className="space-y-1" aria-label={section.title}>
                {section.items.map(({ id, label, icon: Icon }) => {
                  const isActive = view === id || (id === 'packages' && view === 'package-detail');
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelect(id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#e68a00] font-semibold text-white shadow-xs'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon
                        size={17}
                        className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}

          <div>
            <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Espace public
            </p>
            <Link
              to={PATHS.home}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={17} className="shrink-0 text-slate-400" />
              <span>Site vitrine BTS</span>
            </Link>
          </div>
        </div>

        {user && (
          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-2">
              <button
                type="button"
                onClick={() => handleSelect('profile')}
                aria-current={view === 'profile' ? 'page' : undefined}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left hover:bg-white/10"
                title="Mon profil"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-white">
                    {user.name}
                  </span>
                  <span className="block text-[11px] text-slate-300">
                    {USER_ROLE_LABELS[user.role]}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
