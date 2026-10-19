import { useState, useMemo } from 'react';
import { Client, ClientUpdateInput, Package } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EditClientModal } from '@/components/common/EditClientModal';
import { Users, Search, Plus, Phone, Mail, MapPin, Package as PackageIcon, Pencil } from 'lucide-react';

interface ClientsPageProps {
  clients: Client[];
  packages: Package[];
  onCreateClient: (data: Omit<Client, 'id' | 'created_at' | 'total_billed' | 'amount_paid' | 'package_count'>) => Promise<Client>;
  onUpdateClient: (id: string, changes: ClientUpdateInput) => Promise<void>;
  onSelectPackage?: (pkg: Package) => void;
}

export function ClientsPage({
  clients,
  packages,
  onCreateClient,
  onUpdateClient,
  onSelectPackage,
}: ClientsPageProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Client Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic calculation of stats per client based on real packages
  const clientData = useMemo(() => {
    return clients.map((c) => {
      const clientPkgs = packages.filter((p) => p.client_id === c.id || p.client_name?.includes(c.name));
      const totalBilled = clientPkgs.reduce((acc, p) => acc + p.final_price, 0) || c.total_billed;
      const amountPaid = clientPkgs.reduce((acc, p) => acc + (p.amount_paid || 0), 0) || c.amount_paid;
      const count = clientPkgs.length || c.package_count;
      const balance = Math.max(0, totalBilled - amountPaid);

      return {
        ...c,
        calculatedBilled: totalBilled,
        calculatedPaid: amountPaid,
        balance,
        calculatedCount: count,
        packages: clientPkgs,
      };
    });
  }, [clients, packages]);

  const filteredClients = useMemo(() => {
    return clientData.filter((c) => {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [clientData, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateClient({
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
      });
      setIsNewModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
            Gestion des Clients
          </h2>
          <p className="text-sm text-slate-500">
            Annuaire des expéditeurs et destinataires, balance comptable et historique des colis.
          </p>
        </div>
        <Button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex flex-row items-center whitespace-nowrap gap-2 bg-[#003366] text-white hover:bg-[#002244]"
        >
          <Plus size={18} className="shrink-0" />
          <span>Ajouter un client</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email ou ville..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-[#003366] focus:outline-none"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer"
            onClick={() => setSelectedClient(client)}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-bold text-base ${client.balance > 0 ? 'text-red-700' : 'text-slate-800'}`}>{client.name}</h3>
                  {client.balance > 0 && (
                    <span className="my-1 block w-fit rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      Impayé
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-400">ID: {client.id}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial summary footer */}
            <div className="mt-5 border-t pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Solde Dû</span>
                <span className={`font-bold text-sm ${client.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatPrice(client.balance)}
                </span>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-[#003366] hover:underline"
              >
                Fiche client
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Client */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Ajouter un nouveau client"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Nom complet / Raison Sociale *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boutique Abidjan Chic"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Téléphone (avec indicatif) *
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +225 07 11 22 33 44"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Adresse Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@domaine.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Adresse physique / Ville
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Marcory Zone 4, Abidjan"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsNewModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Enregistrer le client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Client Details (G12) */}
      {selectedClient && (
        <Modal
          isOpen={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          title={`Fiche Client : ${selectedClient.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" icon={<Pencil size={14} />} onClick={() => setEditingClient(selectedClient)}>
                Modifier la fiche
              </Button>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 border text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Téléphone</span>
                <span className="font-semibold text-slate-800">{selectedClient.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Email</span>
                <span className="font-semibold text-slate-800">{selectedClient.email || 'Non renseigné'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase">Adresse de livraison</span>
                <span className="font-semibold text-slate-800">{selectedClient.address || 'Non renseignée'}</span>
              </div>
            </div>

            {/* Financial balance */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="border rounded-lg p-3 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase">Total Facturé</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {formatPrice(selectedClient.total_billed)}
                </span>
              </div>
              <div className="border rounded-lg p-3 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase">Total Encaissé</span>
                <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                  {formatPrice(selectedClient.amount_paid)}
                </span>
              </div>
              <div className="p-3 text-center">
                <span className="text-amber-800 block text-[10px] uppercase font-bold">Reste à Recouvrer</span>
                <span className="font-extrabold text-amber-700 text-sm mt-0.5 block">
                  {formatPrice(Math.max(0, selectedClient.total_billed - selectedClient.amount_paid))}
                </span>
              </div>
            </div>

            {/* Colis du client */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">
                Colis associés au client
              </h4>
              {packages.filter((p) => p.client_id === selectedClient.id || p.client_name?.includes(selectedClient.name)).length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucun colis enregistré pour le moment.</p>
              ) : (
                <div className="divide-y border rounded-lg overflow-hidden text-xs">
                  {packages
                    .filter((p) => p.client_id === selectedClient.id || p.client_name?.includes(selectedClient.name))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                        onClick={() => {
                          if (onSelectPackage) {
                            onSelectPackage(p);
                            setSelectedClient(null);
                          }
                        }}
                      >
                        <div>
                          <p className="font-mono font-bold text-[#003366]">{p.tracking_number}</p>
                          <p className="text-slate-500 text-[11px]">{p.origin} → {p.destination}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{formatPrice(p.final_price)}</p>
                          <span className="text-[10px] text-slate-400">Voir détails</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          isOpen
          onClose={() => setEditingClient(null)}
          onSave={async (id, changes) => {
            await onUpdateClient(id, changes);
            setSelectedClient((previous) => (previous && previous.id === id ? { ...previous, ...changes } : previous));
          }}
        />
      )}
    </div>
  );
}
