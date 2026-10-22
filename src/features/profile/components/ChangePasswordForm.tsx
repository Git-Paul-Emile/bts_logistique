import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { authApi } from '@/api/endpoints/auth.api';
import { getPasswordError, PASSWORD_MIN_LENGTH } from '@/utils/validators';

interface ChangePasswordFormProps {
  onDone: () => void;
}

interface FieldErrors {
  current?: string;
  next?: string;
  confirmation?: string;
  form?: string;
}

const EMPTY = { current: '', next: '', confirmation: '' };

export function ChangePasswordForm({ onDone }: ChangePasswordFormProps) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof EMPTY, value: string) => {
    setErrors((previous) => ({ ...previous, [key]: undefined, form: undefined }));
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {
      current: values.current ? undefined : 'Saisissez votre mot de passe actuel.',
      next:
        getPasswordError(values.next) ||
        (values.next && values.next === values.current
          ? 'Choisissez un mot de passe différent de l’actuel.'
          : undefined),
      confirmation:
        values.next === values.confirmation
          ? undefined
          : 'Les deux mots de passe ne sont pas identiques.',
    };
    if (nextErrors.current || nextErrors.next || nextErrors.confirmation) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: values.current, newPassword: values.next });
      setValues(EMPTY);
      onDone();
    } catch {
      setErrors({ form: 'Le mot de passe actuel est incorrect.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#003366]">Mot de passe</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Votre mot de passe actuel est demandé pour confirmer qu’il s’agit bien de vous.
      </p>

      {errors.form && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
        >
          {errors.form}
        </p>
      )}

      <div className="mt-5 space-y-4">
        <PasswordInput
          id="current-password"
          label="Mot de passe actuel"
          autoComplete="current-password"
          value={values.current}
          error={errors.current}
          onChange={(event) => update('current', event.target.value)}
        />
        <PasswordInput
          id="new-password"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          value={values.next}
          error={errors.next}
          helperText={`Au moins ${PASSWORD_MIN_LENGTH} caractères.`}
          onChange={(event) => update('next', event.target.value)}
        />
        <PasswordInput
          id="confirm-password"
          label="Confirmer le nouveau mot de passe"
          autoComplete="new-password"
          value={values.confirmation}
          error={errors.confirmation}
          onChange={(event) => update('confirmation', event.target.value)}
        />
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
        <Button type="submit" loading={saving}>
          Changer le mot de passe
        </Button>
      </div>
    </form>
  );
}
