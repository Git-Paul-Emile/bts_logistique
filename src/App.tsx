import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { PATHS } from '@/router/paths';

// Une route = un fichier chargé à la demande : le visiteur du site public
// ne télécharge pas le code de l'espace de gestion.
const PublicPortalPage = lazy(() =>
  import('@/pages/PublicPortalPage').then((module) => ({ default: module.PublicPortalPage }))
);
const TrackingPage = lazy(() =>
  import('@/pages/TrackingPage').then((module) => ({ default: module.TrackingPage }))
);
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage').then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage').then((module) => ({ default: module.TermsPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage }))
);
const AppRouter = lazy(() => import('@/router/AppRouter').then((module) => ({ default: module.AppRouter })));
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader fullScreen />}>
            <Routes>
              <Route path={PATHS.home} element={<PublicPortalPage />} />
              <Route path={PATHS.tracking} element={<TrackingPage />} />
              <Route path={`${PATHS.tracking}/:trackingNumber`} element={<TrackingPage />} />
              <Route path={PATHS.privacy} element={<PrivacyPage />} />
              <Route path={PATHS.terms} element={<TermsPage />} />
              <Route path={PATHS.login} element={<LoginPage />} />
              <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage />} />
              <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />
              <Route
                path={`${PATHS.admin}/*`}
                element={
                  <ProtectedRoute>
                    <AppRouter />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
