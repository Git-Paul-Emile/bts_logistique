import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { Pagination } from '@/components/ui/Pagination';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { ArchivedUsersTable } from '@/features/users/components/ArchivedUsersTable';
import { CurrentUsersTable } from '@/features/users/components/CurrentUsersTable';
import { useUserActions, useUserList } from '@/features/users/hooks/useUsers';
import type { AppUser } from '@/types';
import { useAuth } from '@/context/useAuth';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import { usersImport } from '@/features/import/definitions/users.import';
import { loadUserImportContext } from '@/features/import/importContexts';
import { useImportHandlers } from '@/features/import/useImportHandlers';
import { useLocations } from '@/features/locations/useLocations';
import { errorMessage } from '@/lib/errorMessage';

const PAGE_SIZE = 25;

type UsersTab = 'current' | 'archived';

// null = fermé ; 'new' = création ; AppUser = modification de ce compte.
type EditorState = null | 'new' | AppUser;

export function UsersPage() {
  const [tab, setTab] = useState<UsersTab>('current');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>(null);
  const users = useUserList({ page, limit: PAGE_SIZE, archived: tab === 'archived' });
  const { inviteUser, updateUser, setUserActive, restoreUser } = useUserActions();
  const { agencies } = useLocations();
  const { importUsers } = useImportHandlers();
  const { user: currentUser } = useAuth();
  const notify = useNotify();

  const handleToggle = async (user: AppUser) => {
    try {
      const updated = await setUserActive(user.id, !user.active);
      notify(
        updated.active
          ? `Compte de ${updated.name} réactivé.`
          : `Compte de ${updated.name} désactivé.`
      );
    } catch (error) {
      notify(errorMessage(error, 'Le compte n’a pas pu être modifié. Réessayez.'));
    }
  };

  const changeTab = (next: UsersTab) => {
    setTab(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">
            Utilisateurs & collecteurs
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Comptes du personnel et des collecteurs. Un compte désactivé ou archivé ne peut plus se
            connecter.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExcelButton
            definition={usersImport}
            getContext={loadUserImportContext}
            onImport={importUsers}
          />
          <Button
            icon={<UserPlus size={16} />}
            disabled={agencies.length === 0}
            onClick={() => setEditor('new')}
          >
            Ajouter un utilisateur
          </Button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Type de comptes"
        className="flex gap-1 border-b border-slate-200"
      >
        {(
          [
            { value: 'current', label: 'Comptes' },
            { value: 'archived', label: 'Archivés' },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => changeTab(item.value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === item.value
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
            {tab === item.value && users.data ? ` (${users.data.meta.total})` : ''}
          </button>
        ))}
      </div>

      {users.isPending && <Loader label="Chargement des comptes..." />}
      {users.isError && (
        <LoadError
          message="Les comptes n’ont pas pu être chargés."
          onRetry={() => void users.refetch()}
        />
      )}

      {users.data && tab === 'archived' && (
        <ArchivedUsersTable
          users={users.data.items}
          onRestore={async (user) => {
            try {
              await restoreUser(user.id);
              notify(`Compte de ${user.name} restauré. La personne peut de nouveau se connecter.`);
            } catch (error) {
              notify(errorMessage(error, 'Le compte n’a pas pu être restauré. Réessayez.'));
            }
          }}
        />
      )}

      {users.data && tab === 'current' && (
        <CurrentUsersTable
          users={users.data.items}
          currentUserId={currentUser?.id}
          onEdit={setEditor}
          onToggle={handleToggle}
        />
      )}

      <Pagination meta={users.data?.meta} onPageChange={setPage} itemLabel="comptes" />

      {editor && (
        <UserFormModal
          key={editor === 'new' ? 'new' : editor.id}
          user={editor === 'new' ? null : editor}
          agencies={agencies}
          isOpen
          onClose={() => setEditor(null)}
          onSubmit={async (input) => {
            if (editor === 'new') {
              const created = await inviteUser(input);
              notify(`Invitation envoyée à ${created.email}.`);
            } else {
              await updateUser(editor.id, input);
              notify('Compte mis à jour.');
            }
          }}
        />
      )}
    </div>
  );
}
