import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { ChoosePasswordForm } from '@/features/auth/components/ChoosePasswordForm';
import { useAcceptInvitation } from '@/features/auth/hooks/useAccountMutations';
import { PATHS } from '@/router/paths';

const INVITATION_TOKEN_PARAM = 'token';

/** Lien reçu dans l'e-mail d'invitation : la personne choisit son mot de passe. */
export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get(INVITATION_TOKEN_PARAM);
  const [done, setDone] = useState(false);
  const acceptInvitation = useAcceptInvitation();

  if (!token) {
    return (
      <AuthLayout
        title="Lien invalide"
        description="Ce lien d’invitation est incomplet. Demandez à votre administrateur de vous en renvoyer un."
      >
        <Button className="w-full" onClick={() => navigate(PATHS.login)}>
          Aller à la connexion
        </Button>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout
        title="Compte activé"
        description="Votre mot de passe est enregistré. Connectez-vous pour accéder à l’espace de gestion."
      >
        <Button className="w-full" onClick={() => navigate(PATHS.login)}>
          Se connecter
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Activer mon compte"
      description="Choisissez le mot de passe qui vous servira à vous connecter."
    >
      <ChoosePasswordForm
        submitLabel="Activer mon compte"
        failureMessage="Ce lien a expiré ou a déjà servi. Demandez à votre administrateur une nouvelle invitation."
        onSubmit={async (password) => {
          await acceptInvitation.mutateAsync({ token, password });
          setDone(true);
        }}
      />
    </AuthLayout>
  );
}
