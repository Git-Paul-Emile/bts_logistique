import { useState } from 'react';
import { AccessDenied } from '@/components/common/AccessDenied';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/context/useAuth';
import { canAccessView } from '@/features/auth/permissions';
import { useOperationsData } from '@/features/backoffice/useOperationsData';
import { useImportHandlers } from '@/features/import/useImportHandlers';
import { useQuotes } from '@/features/quotes/hooks/useQuotes';
import { usePricingGrid } from '@/features/settings/hooks/usePricingGrid';
import type { Package, PricingGrid, Quote, View } from '@/types';
import { BackOfficeView } from './BackOfficeView';

/** Espace de gestion : menu, en-tête, page courante et messages de confirmation. */
export function AppRouter() {
  const [view, setView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const { user } = useAuth();

  const data = useOperationsData(setToastMessage);
  const quotes = useQuotes();
  const imports = useImportHandlers({ data, saveQuote: quotes.saveQuote, notify: setToastMessage });

  // Le tarif maritime sert de coefficient par défaut tant que le colis n'a pas de mode de transport.
  const { grid, loading: isPricingLoading, saveRates } = usePricingGrid();
  const coefficient = grid.rates.sea.client_rate_per_cbm;

  const saveQuote = async (quote: Quote) => {
    const success = await quotes.saveQuote(quote);
    setToastMessage(
      success
        ? 'Calcul de transport enregistré avec succès.'
        : 'Calcul conservé dans la session (synchronisation différée).'
    );
  };

  const savePricing = async (rates: PricingGrid['rates']) => {
    await saveRates(rates);
    setToastMessage('Tarifs et marges enregistrés.');
  };

  const openPackage = (pkg: Package) => {
    data.setSelectedPackage(pkg);
    setView('package-detail');
  };

  const openPackageById = (packageId: string) => {
    const pkg = data.packages.find((candidate) => candidate.id === packageId);
    if (!pkg) {
      setToastMessage('Ce colis n’existe plus ou n’est pas encore chargé.');
      return;
    }
    openPackage(pkg);
  };

  return (
    <div className="flex min-h-screen bg-bts-canvas text-bts-dark">
      <Sidebar
        view={view}
        onNavigate={setView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          view={view}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNotifications={() => setView('notifications')}
          onOpenPackage={openPackageById}
          onOpenProfile={() => setView('profile')}
        />

        <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-[1400px]">
            {user && !canAccessView(user.role, view) ? (
              <AccessDenied onBack={() => setView('dashboard')} />
            ) : (
              <BackOfficeView
                view={view}
                data={data}
                imports={imports}
                quotes={quotes}
                pricing={{ grid, loading: isPricingLoading, coefficient, onSave: savePricing }}
                onNavigate={setView}
                onOpenPackage={openPackage}
                onOpenPackageById={openPackageById}
                onSaveQuote={saveQuote}
                notify={setToastMessage}
              />
            )}
          </div>
        </main>

        <Footer />
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
