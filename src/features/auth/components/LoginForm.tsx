import type { FormEvent } from 'react';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { isValidEmail } from '@/utils/validators';

interface LoginFormProps {
  onSuccess?: () => void;
}

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

function getEmailError(value: string): string | undefined {
  if (!value.trim()) return 'Saisissez votre adresse e-mail.';
  if (!isValidEmail(value)) {
    return 'Saisissez une adresse complète, par exemple prenom.nom@bts-logistique.fr.';
  }
  return undefined;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('thomas.lefevre@bts-logistique.fr');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: LoginFieldErrors = {
      email: getEmailError(email),
      password: password ? undefined : 'Saisissez votre mot de passe.',
    };
    setFieldErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    setError('');
    try {
      await login(email);
      if (onSuccess) onSuccess();
    } catch {
      // Même message pour un compte inconnu ou un mot de passe faux : on ne révèle pas quels comptes existent.
      setError('Adresse e-mail ou mot de passe incorrect.');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        value={email}
        error={fieldErrors.email}
        onChange={(e) => {
          setError('');
          setFieldErrors((previous) => ({ ...previous, email: undefined }));
          setEmail(e.target.value);
        }}
        onBlur={() => setFieldErrors((previous) => ({ ...previous, email: getEmailError(email) }))}
        placeholder="prenom.nom@bts-logistique.fr"
      />

      <PasswordInput
        label="Mot de passe"
        autoComplete="current-password"
        value={password}
        error={fieldErrors.password}
        onChange={(e) => {
          setError('');
          setFieldErrors((previous) => ({ ...previous, password: undefined }));
          setPassword(e.target.value);
        }}
      />

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        className="w-full"
        icon={<LogIn size={16} />}
      >
        Se connecter
      </Button>
    </form>
  );
}
