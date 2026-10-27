import { useState } from 'react';
import { Plus, Ship } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import { shipmentsImport } from '@/features/import/definitions/shipments.import';
import { loadShipmentImportContext } from '@/features/import/importContexts';
import { useImportHandlers } from '@/features/import/useImportHandlers';
import { useLocations } from '@/features/locations/useLocations';
import { NewShipmentModal } from '@/features/shipments/components/NewShipmentModal';
import { ShipmentCard } from '@/features/shipments/components/ShipmentCard';
import { useCreateShipment, useShipmentList } from '@/features/shipments/hooks/useShipments';

const PAGE_SIZE = 12;

export function ShipmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const shipments = useShipmentList({ page, limit: PAGE_SIZE });
  const { origins, destinations } = useLocations();
  const createShipment = useCreateShipment();
  const { importShipments } = useImportHandlers();
  const notify = useNotify();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
            Conteneurs & Lots d'Expédition
          </h2>
          <p className="text-sm text-slate-500">
            Groupage conteneurs maritimes (FCL/LCL) et fret aérien, gestion du taux de remplissage
            volumétrique.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExcelButton
            definition={shipmentsImport}
            getContext={loadShipmentImportContext}
            onImport={importShipments}
          />
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={origins.length === 0}
            className="inline-flex flex-row items-center gap-2 bg-[#003366] whitespace-nowrap text-white hover:bg-[#002244]"
          >
            <Plus size={18} className="shrink-0" />
            <span>Nouveau Conteneur / Lot</span>
          </Button>
        </div>
      </div>

      {shipments.isPending && <Loader label="Chargement des conteneurs..." />}
      {shipments.isError && (
        <LoadError
          message="Les conteneurs n’ont pas pu être chargés."
          onRetry={() => void shipments.refetch()}
        />
      )}
      {shipments.data?.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Ship size={36} aria-hidden="true" className="mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700">Aucun conteneur pour le moment</p>
          <p className="mt-1 text-xs">Créez un lot pour regrouper les colis d’un même départ.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shipments.data?.items.map((shipment) => (
          <ShipmentCard key={shipment.id} shipment={shipment} />
        ))}
      </div>

      <Pagination meta={shipments.data?.meta} onPageChange={setPage} itemLabel="conteneurs" />

      {origins.length > 0 && (
        <NewShipmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          origins={origins}
          destinations={destinations}
          onCreate={async (input) => {
            const created = await createShipment.mutateAsync(input);
            notify(`Conteneur ${created.container_number} planifié.`);
          }}
        />
      )}
    </div>
  );
}
