import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AppUser } from '@/types';
import { USER_ROLE_LABELS } from '@/types';

interface CurrentUsersTableProps {
  users: AppUser[];
  currentUserId: string | undefined;
  onEdit: (user: AppUser) => void;
  onToggle: (user: AppUser) => void;
}

/** Comptes non archivés, avec modification et activation ou désactivation. */
export function CurrentUsersTable({
  users,
  currentUserId,
  onEdit,
  onToggle,
}: CurrentUsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Utilisateur
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Rôle
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Agence
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Statut
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className={user.active ? '' : 'bg-slate-50 text-slate-400'}>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-xs font-medium text-slate-500">(vous)</span>
                  )}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </td>
              <td className="px-4 py-3">{USER_ROLE_LABELS[user.role]}</td>
              <td className="px-4 py-3 text-slate-600">{user.agency}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-semibold ${user.active ? 'text-emerald-700' : 'text-slate-500'}`}
                >
                  {user.active ? 'Actif' : 'Désactivé'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Pencil size={14} />}
                    onClick={() => onEdit(user)}
                    aria-label={`Modifier le compte de ${user.name}`}
                  >
                    Modifier
                  </Button>
                  {/* Un administrateur ne peut pas désactiver son propre compte : il perdrait l'accès. */}
                  {user.id !== currentUserId && (
                    <Button size="sm" variant="ghost" onClick={() => onToggle(user)}>
                      {user.active ? 'Désactiver' : 'Réactiver'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
