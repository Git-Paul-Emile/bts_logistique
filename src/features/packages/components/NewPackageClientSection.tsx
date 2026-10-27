import { useState } from 'react';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useClientList } from '@/features/clients/hooks/useClients';
import { locationOptions } from '@/features/locations/useLocations';
import { useDebounce } from '@/hooks/useDebounce';
import type { NetworkLocation } from '@/types';
import { clientToOption } from '@/utils/selectOptions';
import type { NewPackageForm } from '../hooks/useNewPackageForm';

/** Nombre de clients proposés dans la liste ; la recherche interroge le serveur. */
const CLIENT_CHOICES = 50;

interface NewPackageClientSectionProps {
  form: NewPackageForm;
  origins: readonly NetworkLocation[];
  destinations: readonly NetworkLocation[];
}

/** Section 1 du nouveau colis : client (existant ou nouveau), trajet et contenu. */
export function NewPackageClientSection({
  form,
  origins,
  destinations,
}: NewPackageClientSectionProps) {
  const [clientSearch, setClientSearch] = useState('');
  const debouncedSearch = useDebounce(clientSearch.trim());
  const clients = useClientList(
    { limit: CLIENT_CHOICES, sort: 'name', search: debouncedSearch || undefined },
    !form.isNewClient
  );
  const found = clients.data?.items ?? [];
  const selected = form.selectedClient;
  // Le client choisi reste affiché même quand une nouvelle recherche ne le renvoie plus.
  const candidates = [
    ...(selected && !found.some((client) => client.id === selected.id) ? [selected] : []),
    ...found,
  ];

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="flex items-center justify-between border-b pb-2 text-sm font-semibold text-slate-800">
        <span>1. Identification du Client</span>
        <button
          type="button"
          onClick={() => form.setIsNewClient(!form.isNewClient)}
          className="text-xs font-medium text-[#003366] hover:underline"
        >
          {form.isNewClient ? '← Choisir un client existant' : '+ Créer un nouveau client'}
        </button>
      </h3>

      {form.isNewClient ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="new-package-client-name">Nom du client / Entreprise *</FieldLabel>
            <Input
              id="new-package-client-name"
              value={form.newClientName}
              error={form.formErrors.newClientName}
              onChange={(e) => {
                form.clearError('newClientName');
                form.setNewClientName(e.target.value);
              }}
              placeholder="Ex: Électro Plus SARL"
            />
          </div>
          <div>
            <FieldLabel htmlFor="new-package-client-phone">Téléphone (avec indicatif) *</FieldLabel>
            <Input
              id="new-package-client-phone"
              type="tel"
              value={form.newClientPhone}
              error={form.formErrors.newClientPhone}
              onChange={(e) => {
                form.clearError('newClientPhone');
                form.setNewClientPhone(e.target.value);
              }}
              placeholder="Ex: +225 07 00 00 00"
            />
          </div>
        </div>
      ) : (
        <div>
          <FieldLabel htmlFor="package-client">Sélectionner un client enregistré *</FieldLabel>
          <SearchableSelect
            id="package-client"
            value={selected?.id ?? ''}
            error={form.formErrors.clientId}
            onChange={(id) => {
              form.clearError('clientId');
              form.setSelectedClient(candidates.find((client) => client.id === id) ?? null);
            }}
            onSearchChange={setClientSearch}
            options={candidates.map(clientToOption)}
            placeholder="Choisir un client"
            searchPlaceholder="Nom, entreprise ou téléphone"
            emptyMessage="Aucun client ne correspond. Vérifiez l'orthographe ou le numéro."
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="package-origin">Hub d'origine (Départ) *</FieldLabel>
          <SearchableSelect
            id="package-origin"
            value={form.origin}
            onChange={(code) => {
              form.clearError('destination');
              form.setOrigin(code);
            }}
            options={locationOptions(origins)}
          />
        </div>
        <div>
          <FieldLabel htmlFor="package-destination">Destination finale (Arrivée) *</FieldLabel>
          <SearchableSelect
            id="package-destination"
            value={form.destination}
            error={form.formErrors.destination}
            onChange={(code) => {
              form.clearError('destination');
              form.setDestination(code);
            }}
            options={locationOptions(destinations)}
          />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="package-description">
          Description de la marchandise / Contenu
        </FieldLabel>
        <Input
          id="package-description"
          value={form.description}
          onChange={(e) => form.setDescription(e.target.value)}
          placeholder="Ex: Cartons vêtements, pièces de rechange, téléphones..."
        />
      </div>
    </div>
  );
}
