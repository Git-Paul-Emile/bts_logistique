import { Building2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { ProfileInfoForm } from '@/features/profile/components/ProfileInfoForm';
import { ChangePasswordForm } from '@/features/profile/components/ChangePasswordForm';
import { DeleteAccountSection } from '@/features/profile/components/DeleteAccountSection';
import { USER_ROLE_DESCRIPTIONS, USER_ROLE_LABELS } from '@/types';

interface ProfilePageProps {
  onNotify: (message: string) => void;
}

export function ProfilePage({ onNotify }: ProfilePageProps) {
  const { user, updateProfile } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">Mon profil</h2>
        <p className="mt-0.5 text-sm text-slate-600">
          Vos informations de contact et la sécurité de votre compte.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="min-w-0">
              <p className="font-['Space_Grotesk'] text-lg leading-tight font-bold wrap-break-word text-slate-900">
                {user.name}
              </p>
              <p className="text-sm font-semibold text-[#058441]">{USER_ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex gap-3">
              <dt className="sr-only">E-mail</dt>
              <Mail size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
              <dd className="break-all text-slate-700">{user.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="sr-only">Téléphone</dt>
              <Phone size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
              <dd className="text-slate-700">{user.phone || 'Non renseigné'}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="sr-only">Agence</dt>
              <Building2 size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
              <dd className="text-slate-700">{user.agency}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="sr-only">Droits</dt>
              <ShieldCheck
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-slate-400"
              />
              <dd className="text-slate-700">{USER_ROLE_DESCRIPTIONS[user.role]}</dd>
            </div>
          </dl>
          <p className="mt-5 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
            Le rôle et l’agence sont gérés par un administrateur.
          </p>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <ProfileInfoForm
            key={`${user.name}-${user.email}-${user.phone ?? ''}`}
            user={user}
            onSave={async (changes) => {
              await updateProfile(changes);
              onNotify('Vos informations ont été mises à jour.');
            }}
          />
          <ChangePasswordForm onDone={() => onNotify('Votre mot de passe a été modifié.')} />
          <DeleteAccountSection />
        </div>
      </div>
    </div>
  );
}
