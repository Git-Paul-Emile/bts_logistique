import { useNavigate, useParams } from 'react-router-dom';
import { PublicLayout } from '@/features/portal/components/PublicLayout';
import { SectionHeading } from '@/features/portal/components/SectionHeading';
import { TrackingForm } from '@/features/portal/components/TrackingForm';
import { TrackingResult } from '@/features/portal/components/TrackingResult';
import { usePackageTracking } from '@/features/portal/hooks/usePackageTracking';
import { Loader } from '@/components/common/Loader';
import { trackingPath } from '@/router/paths';

export function TrackingPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const { loading, pkg, error } = usePackageTracking(trackingNumber);

  return (
    <PublicLayout title={trackingNumber ? `Suivi du colis ${trackingNumber}` : 'Suivi de colis'}>
      <section className="bg-bts-canvas py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10 lg:grid-cols-2 lg:items-end lg:gap-12">
            <SectionHeading
              level="h1"
              title="Suivi de"
              highlight="votre colis"
              intro="Le numéro de suivi figure sur le reçu remis au dépôt et dans les e-mails de BTS Logistique."
            />
            {/* La clé réinitialise le champ quand le numéro de l'URL change. */}
            <TrackingForm
              key={trackingNumber}
              initialValue={trackingNumber}
              loading={loading}
              onSubmit={(code) => navigate(trackingPath(code))}
            />
          </div>

          <div className="mt-8">
            {loading && <Loader label="Recherche du colis..." />}
            {!loading && error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800">
                Le suivi est momentanément indisponible. Réessayez dans quelques instants.
              </p>
            )}
            {!loading && !error && trackingNumber && <TrackingResult searchedCode={trackingNumber} pkg={pkg} />}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
