import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PATHS } from '@/router/paths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  useDocumentTitle(title);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bts-canvas p-4">
      <main className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to={PATHS.home} aria-label="Retour au site BTS Logistique">
            <Logo variant="horizontal" size="md" />
          </Link>
          <h1 className="mt-4 font-display text-xl font-bold text-bts-blue">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        {children}
      </main>
      <Link
        to={PATHS.home}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-bts-blue"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Retour au site
      </Link>
    </div>
  );
}
