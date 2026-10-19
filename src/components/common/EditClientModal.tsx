import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Client, ClientUpdateInput } from '@/types';
import { isValidEmail } from '@/utils/validators';

interface EditClientModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, changes: ClientUpdateInput) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof ClientUpdateInput, string>>;

const EMAIL_ERROR = 'Saisissez une adresse e-mail complète, par exemple nom@exemple.com, ou laissez le champ vide.';

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
    const nextErrors: FieldErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Saisissez le nom du client ou de la société.';
    if (!values.phone.trim()) nextErrors.phone = 'Saisissez un numéro de téléphone pour joindre le client.';
    if (values.email && !isValidEmail(values.email)) nextErrors.email = EMAIL_ERROR;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave(client.id, { ...values, name: values.name.trim(), phone: values.phone.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le client" description="L’adresse e-mail sert à envoyer les notifications de suivi." maxWidth="lg">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input id="client-name" label="Nom ou raison sociale" value={values.name} error={errors.name} onChange={(event) => update('name', event.target.value)} />
        <Input id="client-phone" label="Téléphone" type="tel" value={values.phone} error={errors.phone} onChange={(event) => update('phone', event.target.value)} />
        <Input
          id="client-email"
          label="Adresse e-mail (facultatif)"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(event) => update('email', event.target.value)}
          onBlur={() => values.email && !isValidEmail(values.email) && setErrors((previous) => ({ ...previous, email: EMAIL_ERROR }))}
        />
        <Input id="client-address" label="Adresse (facultatif)" value={values.address} onChange={(event) => update('address', event.target.value)} />
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}
