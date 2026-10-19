import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PortalNavLinkProps {
  href: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

// Une ancre (/#services) reste un lien natif : sur l'accueil le navigateur fait défiler
// la page, ailleurs il charge l'accueil puis défile. Les autres liens passent par le routeur.
export function PortalNavLink({ href, className, onClick, children }: PortalNavLinkProps) {
  if (href.includes('#')) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
