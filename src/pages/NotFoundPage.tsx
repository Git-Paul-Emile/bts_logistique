import { Link } from 'react-router';
import { PublicLayout } from '@/features/portal/components/PublicLayout';
import { PATHS } from '@/router/paths';

export function NotFoundPage() {
  return (
    <PublicLayout title="Page introuvable" noIndex>
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="font-display text-6xl font-extrabold text-bts-green">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-bts-blue">
          Cette page n’existe pas
        </h1>
        <p className="mt-3 text-base text-slate-600">
          L’adresse est peut-être incomplète, ou la page a été déplacée.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to={PATHS.home}
            className="inline-flex h-12 items-center rounded-md bg-bts-green px-5 text-sm font-semibold text-white hover:bg-bts-green-700"
          >
            Retour à l’accueil
          </Link>
          <Link
            to={PATHS.tracking}
            className="inline-flex h-12 items-center rounded-md border-2 border-bts-blue px-5 text-sm font-semibold text-bts-blue hover:bg-bts-blue hover:text-white"
          >
            Suivre un colis
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
