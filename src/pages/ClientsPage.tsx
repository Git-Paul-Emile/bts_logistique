import { useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { EditClientModal } from '@/components/common/EditClientModal';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useBackOfficeNavigation } from '@/features/backoffice/NavigationContext';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { ClientCard } from '@/features/clients/components/ClientCard';
import { ClientDetailModal } from '@/features/clients/components/ClientDetailModal';
import { NewClientModal } from '@/features/clients/components/NewClientModal';
import {
  useClientList,
  useCreateClient,
  useUpdateClient,
} from '@/features/clients/hooks/useClients';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import { clientsImport } from '@/features/import/definitions/clients.import';
import { loadClientImportContext } from '@/features/import/importContexts';
import { useImportHandlers } from '@/features/import/useImportHandlers';
import { useDebounce } from '@/hooks/useDebounce';
import type { Client } from '@/types';

const PAGE_SIZE = 24;

export function ClientsPage() {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search.trim());
  const clients = useClientList({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined });
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { importClients } = useImportHandlers();
  const { openPackage } = useBackOfficeNavigation();
  const notify = useNotify();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
            Gestion des Clients
          </h2>
          <p className="text-sm text-slate-500">
            Annuaire des expéditeurs et destinataires, balance comptable et historique des colis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExcelButton
            definition={clientsImport}
            getContext={loadClientImportContext}
            onImport={importClients}
          />
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex flex-row items-center gap-2 bg-[#003366] whitespace-nowrap text-white hover:bg-[#002244]"
          >
            <Plus size={18} className="shrink-0" />
            <span>Ajouter un client</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <label htmlFor="client-search" className="sr-only">
            Rechercher un client
          </label>
          <Search size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input
            id="client-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, téléphone ou email..."
            className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:border-[#003366] focus:outline-hidden"
          />
        </div>
      </div>

      {clients.isPending && <Loader label="Chargement des clients..." />}
      {clients.isError && (
        <LoadError
          message="Les clients n’ont pas pu être chargés."
          onRetry={() => void clients.refetch()}
        />
      )}
      {clients.data?.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Users size={36} aria-hidden="true" className="mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700">
            {debouncedSearch ? 'Aucun client ne correspond à cette recherche' : 'Aucun client'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.data?.items.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onOpen={() => setSelectedClientId(client.id)}
          />
        ))}
      </div>

      <Pagination meta={clients.data?.meta} onPageChange={setPage} itemLabel="clients" />

      <NewClientModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={async (input) => {
          const created = await createClient.mutateAsync(input);
          notify(`Client ${created.name} créé avec succès.`);
        }}
      />

      {selectedClientId && (
        <ClientDetailModal
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onEdit={setEditingClient}
          onSelectPackage={openPackage}
        />
      )}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          isOpen
          onClose={() => setEditingClient(null)}
          onSave={async (id, changes) => {
            const updated = await updateClient.mutateAsync({ id, changes });
            notify(`Fiche de ${updated.name} mise à jour.`);
          }}
        />
      )}
    </div>
  );
}
