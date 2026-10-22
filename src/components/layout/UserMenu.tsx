import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useDismiss } from '@/hooks/useDismiss';
import { PATHS } from '@/router/paths';
import { USER_ROLE_LABELS } from '@/types';

const MENU_ID = 'user-menu';

interface UserMenuProps {
  onOpenProfile: () => void;
}

export function UserMenu({ onOpenProfile }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, containerRef, buttonRef);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate(PATHS.login, { replace: true });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-label={`Menu du compte de ${user.name}`}
        className="flex items-center gap-2.5 rounded-md p-1 pr-2 transition hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#003366] text-xs font-bold text-[#003366]">
          {user.initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-semibold text-bts-dark">{user.name}</span>
          <span className="block text-[11px] text-slate-500">{USER_ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown size={14} aria-hidden="true" className="hidden text-slate-400 sm:block" />
      </button>

      {open && (
        <div
          id={MENU_ID}
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <ul className="py-1 text-sm">
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenProfile();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"
              >
                <UserRound size={16} aria-hidden="true" className="text-slate-400" /> Mon profil
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-red-700 hover:bg-red-50"
              >
                <LogOut size={16} aria-hidden="true" /> Se déconnecter
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
