import { useNavigate } from 'react-router-dom';
import { trackingPath } from '@/router/paths';
import { SectionHeading } from './SectionHeading';
import { TrackingForm } from './TrackingForm';

export function TrackingSection() {
  const navigate = useNavigate();

  return (
    <section id="suivi" className="scroll-mt-20 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10 lg:grid-cols-2 lg:items-end lg:gap-12">
          <SectionHeading
            title="Où se trouve"
            highlight="votre colis ?"
            intro="Saisissez le numéro inscrit sur le reçu remis au dépôt de votre colis."
          />
          <TrackingForm onSubmit={(trackingNumber) => navigate(trackingPath(trackingNumber))} />
        </div>
      </div>
    </section>
  );
}
