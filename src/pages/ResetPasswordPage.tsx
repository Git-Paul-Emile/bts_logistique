import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { ChoosePasswordForm } from '@/features/auth/components/ChoosePasswordForm';
import { useResetPassword } from '@/features/auth/hooks/useAccountMutations';
import { PATHS } from '@/router/paths';

const RESET_TOKEN_PARAM = 'token';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get(RESET_TOKEN_PARAM);
  const [done, setDone] = useState(false);
  const resetPassword = useResetPassword();

  if (!token) {
    return (
      <AuthLayout
        title="Lien invalide"
        description="Ce lien de réinitialisation est incomplet ou a expiré."
      >
        <Link
          to={PATHS.forgotPassword}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-bts-blue text-sm font-semibold text-white hover:bg-bts-blue-900"
        >
          Demander un nouveau lien
        </Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout
        title="Mot de passe modifié"
        description="Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
      >
        <Button className="w-full" onClick={() => navigate(PATHS.login)}>
          Se connecter
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choisir un nouveau mot de passe"
      description="Ce mot de passe remplacera l’ancien."
    >
      <ChoosePasswordForm
        submitLabel="Enregistrer le mot de passe"
        failureMessage="Le lien a expiré ou a déjà été utilisé. Demandez un nouveau lien."
        onSubmit={async (password) => {
          await resetPassword.mutateAsync({ token, password });
          setDone(true);
        }}
      />
    </AuthLayout>
  );
}
