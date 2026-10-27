import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { useConfirmEmail } from '@/features/auth/hooks/useAccountMutations';
import { errorMessage } from '@/lib/errorMessage';
import { PATHS } from '@/router/paths';

const EMAIL_TOKEN_PARAM = 'token';
const FAILURE_MESSAGE =
  'Ce lien a expiré ou a déjà servi. Refaites le changement d’adresse depuis votre profil.';

/**
 * Lien reçu à la nouvelle adresse e-mail. La confirmation demande un clic : certains logiciels
 * de messagerie ouvrent les liens tout seuls pour les analyser, ils ne doivent pas la valider.
 */
export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get(EMAIL_TOKEN_PARAM);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const confirmEmail = useConfirmEmail();

  if (status === 'done') {
    return (
      <AuthLayout
        title="Adresse confirmée"
        description="Votre nouvelle adresse e-mail est enregistrée. Utilisez-la pour vous connecter."
      >
        <Button className="w-full" onClick={() => navigate(PATHS.login)}>
          Se connecter
        </Button>
      </AuthLayout>
    );
  }

  const confirm = async () => {
    if (!token) return;
    setStatus('sending');
    setError('');
    try {
      await confirmEmail.mutateAsync(token);
      setStatus('done');
    } catch (confirmError) {
      setError(errorMessage(confirmError, FAILURE_MESSAGE));
      setStatus('idle');
    }
  };

  return (
    <AuthLayout
      title="Confirmer ma nouvelle adresse"
      description={token ? 'Un clic suffit pour terminer le changement.' : FAILURE_MESSAGE}
    >
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}
      {token ? (
        <Button className="w-full" loading={status === 'sending'} onClick={confirm}>
          Confirmer l’adresse
        </Button>
      ) : (
        <Button className="w-full" onClick={() => navigate(PATHS.login)}>
          Aller à la connexion
        </Button>
      )}
    </AuthLayout>
  );
}
