import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ProfileUpdateInput, UserSession } from '@/types';
import { errorMessage } from '@/lib/errorMessage';
import { isValidEmail, isValidPhone } from '@/utils/validators';

interface ProfileInfoFormProps {
  user: UserSession;
  onSave: (changes: ProfileUpdateInput) => Promise<void>;
}

const PHONE_ERROR =
  'Saisissez un numéro valide, avec l’indicatif du pays, par exemple +225 07 11 22 33 44, ou laissez le champ vide.';

type FieldErrors = Partial<Record<keyof ProfileUpdateInput | 'form', string>>;

const EMAIL_ERROR =
  'Saisissez une adresse e-mail complète, par exemple prenom.nom@bts-logistique.fr.';

export function ProfileInfoForm({ user, onSave }: ProfileInfoFormProps) {
  const [values, setValues] = useState<ProfileUpdateInput>({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const isDirty =
    values.name !== user.name ||
    values.email !== user.email ||
    (values.phone ?? '') !== (user.phone ?? '');

  const update = (key: keyof ProfileUpdateInput, value: string) => {
    setErrors((previous) => ({ ...previous, [key]: undefined, form: undefined }));
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Saisissez votre nom et prénom.';
    if (!isValidEmail(values.email)) nextErrors.email = EMAIL_ERROR;
    if (values.phone?.trim() && !isValidPhone(values.phone)) nextErrors.phone = PHONE_ERROR;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim(),
      });
    } catch (error) {
      setErrors({ form: errorMessage(error, 'L’enregistrement a échoué. Réessayez.') });
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
      <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#003366]">
        Informations personnelles
      </h3>
      <p className="mt-0.5 text-xs text-slate-500">
        L’adresse e-mail sert à vous connecter. Une nouvelle adresse est enregistrée après
        confirmation, par le lien qui lui est envoyé.
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
        <Input
          id="profile-name"
          label="Nom et prénom"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(event) => update('name', event.target.value)}
        />
        <Input
          id="profile-email"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(event) => update('email', event.target.value)}
          onBlur={() =>
            values.email &&
            !isValidEmail(values.email) &&
            setErrors((previous) => ({ ...previous, email: EMAIL_ERROR }))
          }
        />
        <Input
          id="profile-phone"
          label="Téléphone (facultatif)"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => update('phone', event.target.value)}
          onBlur={() =>
            values.phone?.trim() &&
            !isValidPhone(values.phone) &&
            setErrors((previous) => ({ ...previous, phone: PHONE_ERROR }))
          }
        />
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
        <Button type="submit" loading={saving} disabled={!isDirty}>
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
