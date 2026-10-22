import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { CONTACT, LEGAL_LINKS, PORTAL_NAV_LINKS, SERVICES } from '../portal.content';
import { PortalNavLink } from './PortalNavLink';

export function PortalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="scroll-mt-20 bg-bts-blue-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo variant="horizontal" theme="dark" size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Transport de colis par voie maritime et aérienne de la Chine, de Dubaï et de la Turquie
            vers l’Afrique de l’Ouest.
          </p>
        </div>

        <nav aria-label="Liens rapides" className="lg:col-span-2">
          <h2 className="font-display text-sm font-bold">Liens rapides</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {PORTAL_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <PortalNavLink href={link.href} className="hover:text-bts-green-400">
                  {link.label}
                </PortalNavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="font-display text-sm font-bold">Nos services</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {SERVICES.map((service) => (
              <li key={service.title}>{service.title}</li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="font-display text-sm font-bold">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex gap-3">
              <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-bts-green-400" />
              <address className="not-italic">{CONTACT.address}</address>
            </li>
            <li>
              <a href={CONTACT.phoneHref} className="flex gap-3 hover:text-bts-green-400">
                <Phone
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-bts-green-400"
                />
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex gap-3 break-all hover:text-bts-green-400"
              >
                <Mail size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-bts-green-400" />
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {currentYear} BTS Logistique. Tous droits réservés.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <PortalNavLink href={link.href} className="hover:text-white hover:underline">
                  {link.label}
                </PortalNavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
