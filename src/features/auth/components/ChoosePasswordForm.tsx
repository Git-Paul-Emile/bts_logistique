import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { errorMessage } from '@/lib/errorMessage';
import { getPasswordError, PASSWORD_MIN_LENGTH } from '@/utils/validators';

interface FieldErrors {
  password?: string;
  confirmation?: string;
  form?: string;
}

interface ChoosePasswordFormProps {
  submitLabel: string;
  /** Message affiché quand le serveur refuse sans en donner un plus précis. */
  failureMessage: string;
  onSubmit: (password: string) => Promise<void>;
}

/** Choix d'un mot de passe avec confirmation : réinitialisation et activation de compte. */
export function ChoosePasswordForm({
  submitLabel,
  failureMessage,
  onSubmit,
}: ChoosePasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {
      password: getPasswordError(password) || undefined,
      confirmation:
        password === confirmation ? undefined : 'Les deux mots de passe ne sont pas identiques.',
    };
    if (nextErrors.password || nextErrors.confirmation) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(password);
    } catch (error) {
      setErrors({ form: errorMessage(error, failureMessage) });
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.form && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
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
        onBlur={() =>
          password &&
          setErrors((previous) => ({
            ...previous,
            password: getPasswordError(password) || undefined,
          }))
        }
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
        {submitLabel}
      </Button>
    </form>
  );
}
