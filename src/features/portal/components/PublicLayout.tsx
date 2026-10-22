import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PortalHeader } from './PortalHeader';
import { PortalFooter } from './PortalFooter';

interface PublicLayoutProps {
  title: string;
  description?: string;
  noIndex?: boolean;
  children: ReactNode;
}

export function PublicLayout({ title, description, noIndex, children }: PublicLayoutProps) {
  useDocumentTitle(title, { description, noIndex });

  return (
    <div className="flex min-h-screen flex-col bg-white text-bts-dark">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-bts-green focus:px-4 focus:py-2 focus:text-white"
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
