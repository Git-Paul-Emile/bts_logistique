import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/context/useAuth';
import { errorMessage } from '@/lib/errorMessage';

export function DeleteAccountSection() {
  const { user, deleteAccount } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPassword('');
    setError('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!password) {
      setError('Saisissez votre mot de passe pour confirmer la suppression.');
      return;
    }
    setDeleting(true);
    try {
      // La session vidée, la protection des routes renvoie vers la connexion, qui affiche le message.
      await deleteAccount(password);
    } catch (deleteError) {
      // Le serveur refuse aussi la suppression du dernier administrateur actif, avec son message.
      setError(
        errorMessage(
          deleteError,
          'La suppression a échoué. Vérifiez votre mot de passe et réessayez.'
        )
      );
      setDeleting(false);
    }
  };

  return (
    <section
      className="rounded-xl border border-red-200 bg-white p-6 shadow-xs"
      aria-labelledby="delete-account-title"
    >
      <h3
        id="delete-account-title"
        className="font-['Space_Grotesk'] text-base font-bold text-red-700"
      >
        Supprimer mon compte
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Votre compte sera supprimé et vous ne pourrez plus vous connecter.
      </p>
      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Supprimer mon compte
        </Button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={closeConfirm}
        title="Supprimer votre compte ?"
        description="Vous serez déconnecté immédiatement."
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          )}
          <PasswordInput
            id="delete-account-password"
            label="Mot de passe"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setError('');
              setPassword(event.target.value);
            }}
          />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={closeConfirm}>
              Annuler
            </Button>
            <Button type="submit" variant="danger" loading={deleting}>
              Supprimer définitivement mon accès
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
