import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('affiche puis masque le mot de passe au clic sur le bouton', async () => {
    render(<PasswordInput label="Mot de passe" />);
    const input = screen.getByLabelText('Mot de passe');

    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(input).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
