import { ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PortalHeader } from './PortalHeader';
import { PortalFooter } from './PortalFooter';

interface PublicLayoutProps {
  title: string;
  children: ReactNode;
}

export function PublicLayout({ title, children }: PublicLayoutProps) {
  useDocumentTitle(title);

  return (
    <div className="flex min-h-screen flex-col bg-white text-bts-dark">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-bts-green focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>
      <PortalHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <PortalFooter />
    </div>
  );
}
