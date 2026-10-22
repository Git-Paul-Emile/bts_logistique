import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AppUser } from '@/types';
import { USER_ROLE_LABELS } from '@/types';
import { formatDateTime } from '@/utils/formatDate';

interface ArchivedUsersTableProps {
  users: AppUser[];
  onRestore: (user: AppUser) => Promise<void>;
}

export function ArchivedUsersTable({ users, onRestore }: ArchivedUsersTableProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Aucun compte archivé. Un compte apparaît ici quand son titulaire le supprime depuis « Mon
        profil ».
      </p>
    );
  }

  const handleRestore = async (user: AppUser) => {
    setRestoringId(user.id);
    try {
      await onRestore(user);
    } finally {
      setRestoringId(null);
    }
  };

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
              Supprimé le
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{USER_ROLE_LABELS[user.role]}</td>
              <td className="px-4 py-3 text-slate-600">{user.agency}</td>
              <td className="px-4 py-3 text-slate-600">
                {user.archived_at ? formatDateTime(user.archived_at) : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<RotateCcw size={14} />}
                  loading={restoringId === user.id}
                  onClick={() => handleRestore(user)}
                  aria-label={`Restaurer le compte de ${user.name}`}
                >
                  Restaurer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
