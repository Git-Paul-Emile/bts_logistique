import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { LoginRedirectState } from '@/router/ProtectedRoute';
import { PATHS } from '@/router/paths';

function isLoginRedirectState(state: unknown): state is LoginRedirectState {
  return typeof state === 'object' && state !== null && typeof (state as LoginRedirectState).from === 'string';
}

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = isLoginRedirectState(location.state) ? location.state.from : PATHS.admin;

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  return (
    <AuthLayout title="Connexion à l’espace gestion" description="Réservé au personnel et aux collecteurs BTS Logistique.">
      <LoginForm onSuccess={() => navigate(destination, { replace: true })} />
      <p className="mt-5 text-center text-sm">
        <Link to={PATHS.forgotPassword} className="font-medium text-bts-blue hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
    </AuthLayout>
  );
}
