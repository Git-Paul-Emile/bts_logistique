import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PATHS } from '@/router/paths';
import { PORTAL_NAV_LINKS } from '../portal.content';
import { PortalNavLink } from './PortalNavLink';

const QUOTE_ANCHOR = '/#contact';

export function PortalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-bts-blue-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link to={PATHS.home} aria-label="BTS Logistique, page d’accueil">
          <Logo variant="horizontal" theme="dark" size="sm" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium text-white/85">
            {PORTAL_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <PortalNavLink
                  href={link.href}
                  className="transition-colors hover:text-bts-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {link.label}
                </PortalNavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={PATHS.admin}
            className="hidden h-10 items-center rounded-md px-3 text-sm font-medium text-white/85 transition-colors hover:text-white xl:inline-flex"
          >
            Espace gestion
          </Link>
          <a
            href={QUOTE_ANCHOR}
            className="hidden h-10 items-center rounded-md bg-bts-green px-4 text-sm font-semibold text-white transition-colors hover:bg-bts-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
          >
            Demander un devis
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="portal-mobile-menu"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="portal-mobile-menu" aria-label="Navigation mobile" className="border-t border-white/10 lg:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
            {PORTAL_NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-white/10">
                <PortalNavLink href={link.href} onClick={closeMenu} className="block py-3 font-display text-base font-semibold">
                  {link.label}
                </PortalNavLink>
              </li>
            ))}
            <li className="flex flex-col gap-2 py-4">
              <a
                href={QUOTE_ANCHOR}
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-md bg-bts-green text-sm font-semibold sm:hidden"
              >
                Demander un devis
              </a>
              <Link
                to={PATHS.admin}
                className="flex h-11 items-center justify-center rounded-md border border-white/30 text-sm font-semibold"
              >
                Espace gestion
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
