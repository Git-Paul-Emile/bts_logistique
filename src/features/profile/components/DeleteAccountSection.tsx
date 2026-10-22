import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { authApi } from '@/api/endpoints/auth.api';
import { LAST_ADMIN_ERROR } from '@/api/endpoints/users.api';
import { useAuth } from '@/context/useAuth';

const LAST_ADMIN_MESSAGE =
  'Vous êtes le seul administrateur actif. Nommez un autre administrateur avant de supprimer votre compte.';

export function DeleteAccountSection() {
  const { user, deleteAccount } = useAuth();
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    authApi.canDeleteOwnAccount(user).then((allowed) => {
      if (!cancelled) setCanDelete(allowed);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

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
      setError(
        deleteError instanceof Error && deleteError.message === LAST_ADMIN_ERROR
          ? LAST_ADMIN_MESSAGE
          : 'La suppression a échoué. Vérifiez votre mot de passe et réessayez.'
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
      {canDelete === false && (
        <p
          role="note"
          className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800"
        >
          {LAST_ADMIN_MESSAGE}
        </p>
      )}
      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <Button variant="danger" disabled={canDelete !== true} onClick={() => setConfirmOpen(true)}>
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
