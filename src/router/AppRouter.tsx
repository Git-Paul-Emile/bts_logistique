import { useMemo, useState } from 'react';
import { AccessDenied } from '@/components/common/AccessDenied';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/context/useAuth';
import { canAccessView } from '@/features/auth/permissions';
import type { BackOfficeNavigation } from '@/features/backoffice/NavigationContext';
import { NavigationContext } from '@/features/backoffice/NavigationContext';
import { NotifyContext } from '@/features/backoffice/NotifyContext';
import type { View } from '@/types';
import { BackOfficeView } from './BackOfficeView';

/** Espace de gestion : menu, en-tête, page courante et messages de confirmation. */
export function AppRouter() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const { user } = useAuth();

  const navigation = useMemo<BackOfficeNavigation>(
    () => ({
      navigate: setView,
      openPackage: (packageId) => {
        setSelectedPackageId(packageId);
        setView('package-detail');
      },
    }),
    []
  );

  return (
    <NotifyContext.Provider value={setToastMessage}>
      <NavigationContext.Provider value={navigation}>
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
              onOpenPackage={navigation.openPackage}
              onOpenProfile={() => setView('profile')}
            />

            <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
              <div className="mx-auto max-w-[1400px]">
                {user && !canAccessView(user.role, view) ? (
                  <AccessDenied onBack={() => setView('dashboard')} />
                ) : (
                  <BackOfficeView
                    view={view}
                    selectedPackageId={selectedPackageId}
                    onBackToPackages={() => setView('packages')}
                    onOpenPackage={navigation.openPackage}
                  />
                )}
              </div>
            </main>

            <Footer />
          </div>

          <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        </div>
      </NavigationContext.Provider>
    </NotifyContext.Provider>
  );
}
