import { ReactNode } from 'react';
import { PublicLayout } from '@/features/portal/components/PublicLayout';
import { formatDate } from '@/utils/formatters';

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  children: ReactNode;
}

export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  return (
    <PublicLayout title={title}>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <h1 className="font-display text-3xl font-bold text-bts-blue sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Dernière mise à jour : <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-700 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-bts-blue [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </PublicLayout>
  );
}
