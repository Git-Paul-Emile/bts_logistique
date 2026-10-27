import type { FormEvent } from 'react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { errorMessage } from '@/lib/errorMessage';
import type { Client, ClientUpdateInput } from '@/types';
import { CLIENT_ERRORS, isValidEmail, isValidPhone, validateClientInput } from '@/utils/validators';

interface EditClientModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, changes: ClientUpdateInput) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof ClientUpdateInput | 'form', string>>;

export function EditClientModal({ client, isOpen, onClose, onSave }: EditClientModalProps) {
  const [values, setValues] = useState<ClientUpdateInput>({
    name: client.name,
    phone: client.phone,
    email: client.email ?? '',
    address: client.address ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (key: keyof ClientUpdateInput, value: string) => {
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateClientInput(values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setSaving(true);
    try {
      await onSave(client.id, { ...values, name: values.name.trim(), phone: values.phone.trim() });
      onClose();
    } catch (error) {
      setErrors({ form: errorMessage(error, 'La fiche n’a pas pu être enregistrée. Réessayez.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le client"
      description="L’adresse e-mail sert à envoyer les notifications de suivi."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {errors.form}
          </p>
        )}
        <Input
          id="client-name"
          label="Nom ou raison sociale"
          value={values.name}
          error={errors.name}
          onChange={(event) => update('name', event.target.value)}
        />
        <Input
          id="client-phone"
          label="Téléphone"
          type="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => update('phone', event.target.value)}
          onBlur={() =>
            values.phone.trim() &&
            !isValidPhone(values.phone) &&
            setErrors((previous) => ({ ...previous, phone: CLIENT_ERRORS.phoneInvalid }))
          }
        />
        <Input
          id="client-email"
          label="Adresse e-mail (facultatif)"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(event) => update('email', event.target.value)}
          onBlur={() =>
            values.email &&
            !isValidEmail(values.email) &&
            setErrors((previous) => ({ ...previous, email: CLIENT_ERRORS.emailInvalid }))
          }
        />
        <Input
          id="client-address"
          label="Adresse (facultatif)"
          value={values.address}
          onChange={(event) => update('address', event.target.value)}
        />
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={saving}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
