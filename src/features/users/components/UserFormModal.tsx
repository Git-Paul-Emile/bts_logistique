import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  AppUser,
  AppUserInput,
  BTS_DESTINATIONS,
  BTS_ORIGINS,
  USER_ROLE_DESCRIPTIONS,
  USER_ROLE_LABELS,
  UserRole,
} from '@/types';
import { isValidEmail } from '@/utils/validators';

interface UserFormModalProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: AppUserInput) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof AppUserInput | 'form', string>>;

const AGENCIES = [...BTS_ORIGINS, ...BTS_DESTINATIONS];
const ROLES = Object.keys(USER_ROLE_LABELS) as UserRole[];
const EMPTY_INPUT: AppUserInput = { name: '', email: '', phone: '', role: 'collector', agency: AGENCIES[0] };
const SELECT_CLASS =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]';

function toInput(user: AppUser | null): AppUserInput {
  if (!user) return EMPTY_INPUT;
  return { name: user.name, email: user.email, phone: user.phone ?? '', role: user.role, agency: user.agency };
}

export function UserFormModal({ user, isOpen, onClose, onSubmit }: UserFormModalProps) {
  const [values, setValues] = useState<AppUserInput>(() => toInput(user));
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
    if (!isValidEmail(values.email)) nextErrors.email = 'Saisissez une adresse e-mail complète, par exemple nom@bts-logistique.fr.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim() });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'EMAIL_ALREADY_USED'
          ? 'Cette adresse e-mail est déjà utilisée par un autre compte.'
          : 'L’enregistrement a échoué. Réessayez.';
      setErrors({ form: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier le compte' : 'Ajouter un utilisateur'}
      description={isEdit ? undefined : 'Un e-mail d’invitation lui permettra de choisir son mot de passe.'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {errors.form}
          </p>
        )}
        <Input id="user-name" label="Nom et prénom" value={values.name} error={errors.name} onChange={(event) => update('name', event.target.value)} />
        <Input
          id="user-email"
          label="Adresse e-mail"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(event) => update('email', event.target.value)}
          onBlur={() => values.email && !isValidEmail(values.email) && setErrors((previous) => ({ ...previous, email: 'Saisissez une adresse e-mail complète, par exemple nom@bts-logistique.fr.' }))}
        />
        <Input id="user-phone" label="Téléphone (facultatif)" type="tel" value={values.phone} onChange={(event) => update('phone', event.target.value)} />

        <div>
          <label htmlFor="user-role" className="mb-1.5 block text-xs font-semibold text-slate-700">
            Rôle
          </label>
          <select id="user-role" className={SELECT_CLASS} value={values.role} onChange={(event) => update('role', event.target.value as UserRole)}>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {USER_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">{USER_ROLE_DESCRIPTIONS[values.role]}</p>
        </div>

        <div>
          <label htmlFor="user-agency" className="mb-1.5 block text-xs font-semibold text-slate-700">
            Agence de rattachement
          </label>
          <select id="user-agency" className={SELECT_CLASS} value={values.agency} onChange={(event) => update('agency', event.target.value)}>
            {AGENCIES.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>
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
