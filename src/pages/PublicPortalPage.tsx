import { PublicLayout } from '@/features/portal/components/PublicLayout';
import { HeroSection } from '@/features/portal/components/HeroSection';
import { ServicesSection } from '@/features/portal/components/ServicesSection';
import { NetworkSection } from '@/features/portal/components/NetworkSection';
import { WhyUsSection } from '@/features/portal/components/WhyUsSection';
import { ProcessSection } from '@/features/portal/components/ProcessSection';
import { TrackingSection } from '@/features/portal/components/TrackingSection';
import { PriceSimulator } from '@/features/portal/components/PriceSimulator';
import { CtaBand } from '@/features/portal/components/CtaBand';

export function PublicPortalPage() {
  return (
    <PublicLayout title="Transport de colis Chine, Dubaï, Turquie vers l’Afrique de l’Ouest">
      <HeroSection />
      <ServicesSection />
      <NetworkSection />
      <WhyUsSection />
      <ProcessSection />
      <TrackingSection />
      <PriceSimulator />
      <CtaBand />
    </PublicLayout>
  );
}
