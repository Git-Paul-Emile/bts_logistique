import type { FormEvent } from 'react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Agency } from '@/features/locations/useLocations';
import { agencyOptions } from '@/features/locations/useLocations';
import { errorMessage } from '@/lib/errorMessage';
import type { AppUser, AppUserInput } from '@/types';
import { USER_ROLE_DESCRIPTIONS, USER_ROLE_LABELS } from '@/types';
import { isValidEmail, isValidPhone } from '@/utils/validators';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { labelsToOptions } from '@/utils/selectOptions';

interface UserFormModalProps {
  user: AppUser | null;
  agencies: readonly Agency[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: AppUserInput) => Promise<void>;
}

const PHONE_ERROR =
  'Saisissez un numéro valide, avec l’indicatif du pays, par exemple +225 07 11 22 33 44, ou laissez le champ vide.';

type FieldErrors = Partial<Record<keyof AppUserInput | 'form', string>>;

function toInput(user: AppUser | null, agencies: readonly Agency[]): AppUserInput {
  if (!user) {
    return {
      name: '',
      email: '',
      phone: '',
      role: 'collector',
      agency_code: agencies[0]?.code ?? '',
    };
  }
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    agency_code: user.agency_code,
  };
}

export function UserFormModal({ user, agencies, isOpen, onClose, onSubmit }: UserFormModalProps) {
  const [values, setValues] = useState<AppUserInput>(() => toInput(user, agencies));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(user);

  const update = <K extends keyof AppUserInput>(key: K, value: AppUserInput[K]) => {
    setErrors((previous) => ({ ...previous, [key]: undefined, form: undefined }));
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Saisissez le nom et le prénom.';
    if (!isValidEmail(values.email))
      nextErrors.email =
        'Saisissez une adresse e-mail complète, par exemple nom@bts-logistique.fr.';
    if (values.phone?.trim() && !isValidPhone(values.phone)) nextErrors.phone = PHONE_ERROR;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim() });
      onClose();
    } catch (error) {
      setErrors({ form: errorMessage(error, 'L’enregistrement a échoué. Réessayez.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier le compte' : 'Ajouter un utilisateur'}
      description={
        isEdit ? undefined : 'Un e-mail d’invitation lui permettra de choisir son mot de passe.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            {errors.form}
          </p>
        )}
        <Input
          id="user-name"
          label="Nom et prénom"
          value={values.name}
          error={errors.name}
          onChange={(event) => update('name', event.target.value)}
        />
        <Input
          id="user-email"
          label="Adresse e-mail"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(event) => update('email', event.target.value)}
          onBlur={() =>
            values.email &&
            !isValidEmail(values.email) &&
            setErrors((previous) => ({
              ...previous,
              email: 'Saisissez une adresse e-mail complète, par exemple nom@bts-logistique.fr.',
            }))
          }
        />
        <Input
          id="user-phone"
          label="Téléphone (facultatif)"
          type="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => update('phone', event.target.value)}
          onBlur={() =>
            values.phone?.trim() &&
            !isValidPhone(values.phone) &&
            setErrors((previous) => ({ ...previous, phone: PHONE_ERROR }))
          }
        />

        <div>
          <label htmlFor="user-role" className="mb-1.5 block text-xs font-semibold text-slate-700">
            Rôle
          </label>
          <SearchableSelect
            id="user-role"
            value={values.role}
            onChange={(role) => update('role', role)}
            options={labelsToOptions(USER_ROLE_LABELS)}
          />
          <p className="mt-1 text-xs text-slate-500">{USER_ROLE_DESCRIPTIONS[values.role]}</p>
        </div>

        <div>
          <label
            htmlFor="user-agency"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Agence de rattachement
          </label>
          <SearchableSelect
            id="user-agency"
            value={values.agency_code}
            onChange={(code) => update('agency_code', code)}
            options={agencyOptions(agencies)}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Enregistrer' : 'Créer et inviter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
