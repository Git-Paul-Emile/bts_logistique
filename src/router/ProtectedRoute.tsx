import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/context/useAuth';
import { Loader } from '@/components/common/Loader';
import { PATHS } from '@/router/paths';

interface ProtectedRouteProps {
  children: ReactNode;
}

export interface LoginRedirectState {
  /** Page demandée avant la connexion, pour y revenir ensuite. */
  from?: string;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen label="Vérification de la session..." />;
  }

  if (!isAuthenticated) {
    const state: LoginRedirectState = { from: location.pathname };
    return <Navigate to={PATHS.login} replace state={state} />;
  }

  return <>{children}</>;
}
