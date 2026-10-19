import { useState } from 'react';
import { Pencil, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/common/Loader';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { useUsers } from '@/features/users/hooks/useUsers';
import { AppUser, USER_ROLE_LABELS } from '@/types';

interface UsersPageProps {
  onNotify: (message: string) => void;
}

// null = fermé ; 'new' = création ; AppUser = modification de ce compte.
type EditorState = null | 'new' | AppUser;

export function UsersPage({ onNotify }: UsersPageProps) {
  const { users, loading, createUser, updateUser, toggleActive } = useUsers();
  const [editor, setEditor] = useState<EditorState>(null);

  const handleToggle = async (user: AppUser) => {
    const updated = await toggleActive(user);
    onNotify(updated.active ? `Compte de ${updated.name} réactivé.` : `Compte de ${updated.name} désactivé.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">Utilisateurs & collecteurs</h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Comptes du personnel et des collecteurs. Un compte désactivé ne peut plus se connecter.
          </p>
        </div>
        <Button icon={<UserPlus size={16} />} onClick={() => setEditor('new')}>
          Ajouter un utilisateur
        </Button>
      </div>

      {loading ? (
        <Loader label="Chargement des comptes..." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Utilisateur</th>
                <th scope="col" className="px-4 py-3 font-semibold">Rôle</th>
                <th scope="col" className="px-4 py-3 font-semibold">Agence</th>
                <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className={user.active ? '' : 'bg-slate-50 text-slate-400'}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">{USER_ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3 text-slate-600">{user.agency}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${user.active ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {user.active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" icon={<Pencil size={14} />} onClick={() => setEditor(user)} aria-label={`Modifier le compte de ${user.name}`}>
                        Modifier
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggle(user)}>
                        {user.active ? 'Désactiver' : 'Réactiver'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
