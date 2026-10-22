import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputProps } from './Input';
import { Input } from './Input';

type PasswordInputProps = Omit<InputProps, 'type' | 'rightElement'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      ref={ref}
      type={visible ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          className="rounded-sm p-1 text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-[#003366] focus-visible:outline-solid"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
