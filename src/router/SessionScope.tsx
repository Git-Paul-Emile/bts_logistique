import { Outlet } from 'react-router';
import { AuthProvider } from '@/context/AuthProvider';

/**
 * Pages qui ont besoin de la session (connexion, espace de gestion). Le site public n'en fait pas
 * partie : un visiteur ne déclenche aucun appel de vérification de session.
 */
export function SessionScope() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
