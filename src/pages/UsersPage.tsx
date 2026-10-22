import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/common/Loader';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { ArchivedUsersTable } from '@/features/users/components/ArchivedUsersTable';
import { CurrentUsersTable } from '@/features/users/components/CurrentUsersTable';
import { useUsers } from '@/features/users/hooks/useUsers';
import type { AppUser, AppUserInput } from '@/types';
import { useAuth } from '@/context/useAuth';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import type { UserImportPatch } from '@/features/import/definitions/users.import';
import { userImportContext, usersImport } from '@/features/import/definitions/users.import';
import { importedMessage } from '@/features/import/importMessage';
import type { ImportBatch } from '@/features/import/importTypes';

interface UsersPageProps {
  onNotify: (message: string) => void;
}

type UsersTab = 'current' | 'archived';

// null = fermé ; 'new' = création ; AppUser = modification de ce compte.
type EditorState = null | 'new' | AppUser;

export function UsersPage({ onNotify }: UsersPageProps) {
  const { users, loading, createUser, updateUser, toggleActive, restoreUser } = useUsers();
  const [tab, setTab] = useState<UsersTab>('current');
  const currentUsers = users.filter((user) => !user.archived_at);
  const archivedUsers = users.filter((user) => user.archived_at);
  const { user: currentUser } = useAuth();

  const handleImport = async ({
    creates,
    completions,
  }: ImportBatch<AppUserInput, UserImportPatch>) => {
    for (const item of creates) await createUser(item);
    for (const { targetId, changes } of completions) {
      const target = users.find((user) => user.id === targetId);
      if (!target) continue;
      const { name, email, phone, role, agency } = { ...target, ...changes };
      await updateUser(targetId, { name, email, phone, role, agency });
    }
    onNotify(importedMessage(usersImport, creates.length, completions.length));
  };
  const [editor, setEditor] = useState<EditorState>(null);

  const handleToggle = async (user: AppUser) => {
    const updated = await toggleActive(user);
    onNotify(
      updated.active
        ? `Compte de ${updated.name} réactivé.`
        : `Compte de ${updated.name} désactivé.`
    );
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
            getContext={() => userImportContext(users)}
            onImport={handleImport}
          />
          <Button icon={<UserPlus size={16} />} onClick={() => setEditor('new')}>
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
            { value: 'current', label: `Comptes (${currentUsers.length})` },
            { value: 'archived', label: `Archivés (${archivedUsers.length})` },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === item.value
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <Loader label="Chargement des comptes..." />}

      {!loading && tab === 'archived' && (
        <ArchivedUsersTable
          users={archivedUsers}
          onRestore={async (user) => {
            await restoreUser(user);
            onNotify(`Compte de ${user.name} restauré. La personne peut de nouveau se connecter.`);
          }}
        />
      )}

      {!loading && tab === 'current' && (
        <CurrentUsersTable
          users={currentUsers}
          currentUserId={currentUser?.id}
          onEdit={setEditor}
          onToggle={handleToggle}
        />
      )}

      {editor && (
        <UserFormModal
          key={editor === 'new' ? 'new' : editor.id}
          user={editor === 'new' ? null : editor}
          isOpen
          onClose={() => setEditor(null)}
          onSubmit={async (input) => {
            if (editor === 'new') {
              const created = await createUser(input);
              onNotify(`Invitation envoyée à ${created.email}.`);
            } else {
              await updateUser(editor.id, input);
              onNotify('Compte mis à jour.');
            }
          }}
        />
      )}
    </div>
  );
}
