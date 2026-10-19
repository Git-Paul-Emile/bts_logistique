import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/endpoints/auth.api';
import { isValidEmail } from '@/utils/validators';
import { PATHS } from '@/router/paths';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (value: string): string =>
    isValidEmail(value) ? '' : 'Saisissez une adresse e-mail complète, par exemple prenom.nom@bts-logistique.fr.';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      setError('La demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Vérifiez votre boîte e-mail" description="La demande a bien été prise en compte.">
        <div className="flex gap-3 rounded-md border border-bts-green-200 bg-bts-green-50 p-4 text-sm text-bts-green-900">
          <MailCheck size={20} aria-hidden="true" className="shrink-0" />
          <p>
            Si un compte existe pour <strong>{email.trim()}</strong>, vous recevrez un lien pour choisir un
            nouveau mot de passe. Le lien est valable pour une durée limitée.
          </p>
        </div>
        <p className="mt-5 text-center text-sm">
          <Link to={PATHS.login} className="font-medium text-bts-blue hover:underline">
            Revenir à la connexion
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Indiquez l’adresse e-mail de votre compte. Nous vous enverrons un lien de réinitialisation."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          value={email}
          error={error}
          onChange={(event) => {
            setError('');
            setEmail(event.target.value);
          }}
          onBlur={() => email && setError(validateEmail(email))}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Envoyer le lien
        </Button>
      </form>
      <p className="mt-5 text-center text-sm">
        <Link to={PATHS.login} className="font-medium text-bts-blue hover:underline">
          Revenir à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
