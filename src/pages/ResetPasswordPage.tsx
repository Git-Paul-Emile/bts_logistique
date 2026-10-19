import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { authApi } from '@/api/endpoints/auth.api';
import { getPasswordError, PASSWORD_MIN_LENGTH } from '@/utils/validators';
import { PATHS } from '@/router/paths';

const RESET_TOKEN_PARAM = 'token';

interface FieldErrors {
  password?: string;
  confirmation?: string;
  form?: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get(RESET_TOKEN_PARAM);

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Lien invalide" description="Ce lien de réinitialisation est incomplet ou a expiré.">
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
      <AuthLayout title="Mot de passe modifié" description="Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.">
        <Button className="w-full" onClick={() => navigate(PATHS.login)}>
          Se connecter
        </Button>
      </AuthLayout>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {
      password: getPasswordError(password) || undefined,
      confirmation: password === confirmation ? undefined : 'Les deux mots de passe ne sont pas identiques.',
    };
    if (nextErrors.password || nextErrors.confirmation) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch {
      setErrors({ form: 'Le lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Choisir un nouveau mot de passe" description="Ce mot de passe remplacera l’ancien.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {errors.form}
          </p>
        )}
        <PasswordInput
          label="Nouveau mot de passe"
          autoComplete="new-password"
          value={password}
          error={errors.password}
          helperText={`Au moins ${PASSWORD_MIN_LENGTH} caractères.`}
          onChange={(event) => {
            setErrors((previous) => ({ ...previous, password: undefined }));
            setPassword(event.target.value);
          }}
          onBlur={() => password && setErrors((previous) => ({ ...previous, password: getPasswordError(password) || undefined }))}
        />
        <PasswordInput
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          value={confirmation}
          error={errors.confirmation}
          onChange={(event) => {
            setErrors((previous) => ({ ...previous, confirmation: undefined }));
            setConfirmation(event.target.value);
          }}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Enregistrer le mot de passe
        </Button>
      </form>
    </AuthLayout>
  );
}
