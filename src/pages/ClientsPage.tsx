import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { EditClientModal } from '@/components/common/EditClientModal';
import { Button } from '@/components/ui/Button';
import { withBalances } from '@/features/clients/clientPackages';
import { ClientCard } from '@/features/clients/components/ClientCard';
import { ClientDetailModal } from '@/features/clients/components/ClientDetailModal';
import type { NewClientData } from '@/features/clients/components/NewClientModal';
import { NewClientModal } from '@/features/clients/components/NewClientModal';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import type {
  ClientImportItem,
  ClientImportPatch,
} from '@/features/import/definitions/clients.import';
import { clientImportContext, clientsImport } from '@/features/import/definitions/clients.import';
import type { ImportBatch } from '@/features/import/importTypes';
import type { Client, ClientUpdateInput, Package, Payment } from '@/types';

interface ClientsPageProps {
  clients: Client[];
  packages: Package[];
  payments: Payment[];
  onCreateClient: (data: NewClientData) => Promise<Client>;
  onUpdateClient: (id: string, changes: ClientUpdateInput) => Promise<void>;
  onImportClients: (batch: ImportBatch<ClientImportItem, ClientImportPatch>) => Promise<void>;
  onSelectPackage?: (pkg: Package) => void;
}

export function ClientsPage({
  clients,
  packages,
  payments,
  onCreateClient,
  onUpdateClient,
  onImportClients,
  onSelectPackage,
}: ClientsPageProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clientData = useMemo(() => withBalances(clients, packages), [clients, packages]);

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase();
    return clientData.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.address && c.address.toLowerCase().includes(query))
    );
  }, [clientData, search]);

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
            getContext={() => clientImportContext(clients)}
            onImport={onImportClients}
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
          <Search size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email ou ville..."
            className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:border-[#003366] focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} onOpen={() => setSelectedClient(client)} />
        ))}
      </div>

      <NewClientModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={onCreateClient}
      />

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          packages={packages}
          payments={payments}
          onClose={() => setSelectedClient(null)}
          onEdit={() => setEditingClient(selectedClient)}
          onSelectPackage={onSelectPackage}
        />
      )}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          isOpen
          onClose={() => setEditingClient(null)}
          onSave={async (id, changes) => {
            await onUpdateClient(id, changes);
            setSelectedClient((previous) =>
              previous && previous.id === id ? { ...previous, ...changes } : previous
            );
          }}
        />
      )}
    </div>
  );
}
