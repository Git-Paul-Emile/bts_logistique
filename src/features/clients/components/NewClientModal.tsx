import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { NewClientInput } from '@/types';
import { errorMessage } from '@/lib/errorMessage';
import { CLIENT_ERRORS, isValidEmail, isValidPhone, validateClientInput } from '@/utils/validators';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewClientInput) => Promise<void>;
}

/** Fenêtre « Ajouter un client ». La saisie est conservée si la fenêtre est fermée sans valider. */
export function NewClientModal({ isOpen, onClose, onCreate }: NewClientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => setErrors((previous) => ({ ...previous, [field]: '' }));
  const setError = (field: string, message: string) =>
    setErrors((previous) => ({ ...previous, [field]: message }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateClientInput({ name, phone, email });
    setErrors(validation.errors);
    if (!validation.isValid) return;
    setIsSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      onClose();
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
    } catch (error) {
      setError('form', errorMessage(error, 'Le client n’a pas pu être créé. Réessayez.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un nouveau client" maxWidth="md">
      <form onSubmit={handleCreate} noValidate className="space-y-4">
        {errors.form && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {errors.form}
          </p>
        )}
        <div>
          <FieldLabel htmlFor="new-client-name">Nom complet / Raison Sociale *</FieldLabel>
          <Input
            id="new-client-name"
            value={name}
            error={errors.name}
            onChange={(e) => {
              clearError('name');
              setName(e.target.value);
            }}
            placeholder="Ex: Boutique Abidjan Chic"
          />
        </div>

        <div>
          <FieldLabel htmlFor="new-client-phone">Téléphone (avec indicatif) *</FieldLabel>
          <Input
            id="new-client-phone"
            type="tel"
            value={phone}
            error={errors.phone}
            onChange={(e) => {
              clearError('phone');
              setPhone(e.target.value);
            }}
            onBlur={() =>
              phone.trim() && !isValidPhone(phone) && setError('phone', CLIENT_ERRORS.phoneInvalid)
            }
            placeholder="Ex: +225 07 11 22 33 44"
          />
        </div>

        <div>
          <FieldLabel htmlFor="new-client-email">Adresse Email</FieldLabel>
          <Input
            id="new-client-email"
            type="email"
            value={email}
            error={errors.email}
            onChange={(e) => {
              clearError('email');
              setEmail(e.target.value);
            }}
            onBlur={() =>
              email.trim() && !isValidEmail(email) && setError('email', CLIENT_ERRORS.emailInvalid)
            }
            placeholder="client@domaine.com"
          />
        </div>

        <div>
          <FieldLabel htmlFor="new-client-address">Adresse physique / Ville</FieldLabel>
          <Input
            id="new-client-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Marcory Zone 4, Abidjan"
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Enregistrer le client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
