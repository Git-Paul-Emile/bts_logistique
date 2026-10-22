import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { SelectOption } from './SearchableSelect';
import { SearchableSelect } from './SearchableSelect';

const CLIENTS: SelectOption<string>[] = [
  { value: 'cli-1', label: 'Électro Abidjan SARL (M. Koffi)', hint: '+225 07 48 92 10 33' },
  { value: 'cli-2', label: 'Boutique Touba Textile (Mme Diop)', hint: '+221 77 654 32 10' },
  { value: 'cli-3', label: 'Quincaillerie du Fleuve (M. Traoré)', hint: '+223 66 12 45 78' },
];

function ClientSelect() {
  const [value, setValue] = useState('cli-1');
  return (
    <>
      <label htmlFor="client">Client</label>
      <SearchableSelect id="client" value={value} onChange={setValue} options={CLIENTS} />
    </>
  );
}

describe('SearchableSelect', () => {
  it('filtre par téléphone et choisit au clavier', async () => {
    const user = userEvent.setup();
    render(<ClientSelect />);

    await user.click(screen.getByLabelText('Client'));
    await user.keyboard('654 32');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');

    expect(screen.getByLabelText('Client')).toHaveTextContent('Boutique Touba Textile');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('trouve un client par le nom du contact, sans accents', async () => {
    const user = userEvent.setup();
    render(<ClientSelect />);

    await user.click(screen.getByLabelText('Client'));
    await user.keyboard('traore');

    expect(screen.getByRole('option')).toHaveTextContent('Quincaillerie du Fleuve');
  });

  it('affiche un message quand rien ne correspond, et Échap ferme la liste', async () => {
    const user = userEvent.setup();
    render(<ClientSelect />);

    await user.click(screen.getByLabelText('Client'));
    await user.keyboard('zzz');
    expect(screen.getByText('Aucun résultat pour cette recherche.')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Client')).toHaveFocus();
  });
});
