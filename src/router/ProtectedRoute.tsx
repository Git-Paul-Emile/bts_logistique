import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/common/Loader';
import { PATHS } from '@/router/paths';

interface ProtectedRouteProps {
  children: ReactNode;
}

export interface LoginRedirectState {
  from: string;
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
