import { useState, FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('thomas.lefevre@bts-logistique.fr');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Saisissez votre adresse e-mail.');
      return;
    }
    setError('');
    try {
      await login(email);
      if (onSuccess) onSuccess();
    } catch {
      setError('Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setError('');
          setEmail(e.target.value);
        }}
        required
        placeholder="prenom.nom@bts-logistique.fr"
      />

      <PasswordInput
        label="Mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setError('');
          setPassword(e.target.value);
        }}
        required
      />

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        className="w-full"
        icon={<LogIn size={16} />}
      >
        Se connecter
      </Button>
    </form>
  );
}
