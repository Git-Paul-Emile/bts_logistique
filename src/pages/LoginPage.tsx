import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useAuth } from '@/context/useAuth';
import type { LoginRedirectState } from '@/router/ProtectedRoute';
import { PATHS } from '@/router/paths';

function readRedirectState(state: unknown): LoginRedirectState {
  return typeof state === 'object' && state !== null ? (state as LoginRedirectState) : {};
}

export function LoginPage() {
  const { isAuthenticated, signOutNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { from } = readRedirectState(location.state);
  const destination = from ?? PATHS.admin;

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  return (
    <AuthLayout
      title="Connexion à l’espace gestion"
      description="Réservé au personnel et aux collecteurs BTS Logistique."
    >
      {signOutNotice && (
        <p
          role="status"
          className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
        >
          {signOutNotice}
        </p>
      )}
      <LoginForm onSuccess={() => navigate(destination, { replace: true })} />
      <p className="mt-5 text-center text-sm">
        <Link to={PATHS.forgotPassword} className="font-medium text-bts-blue hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
    </AuthLayout>
  );
}
