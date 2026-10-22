import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImportExcelButton } from '@/features/import/components/ImportExcelButton';
import type {
  ShipmentImportItem,
  ShipmentImportPatch,
} from '@/features/import/definitions/shipments.import';
import {
  shipmentImportContext,
  shipmentsImport,
} from '@/features/import/definitions/shipments.import';
import type { ImportBatch } from '@/features/import/importTypes';
import type { NewShipmentData } from '@/features/shipments/hooks/useNewShipmentForm';
import { NewShipmentModal } from '@/features/shipments/components/NewShipmentModal';
import { ShipmentCard } from '@/features/shipments/components/ShipmentCard';
import type { Shipment } from '@/types';

interface ShipmentsPageProps {
  shipments: Shipment[];
  onCreateShipment: (data: NewShipmentData) => Promise<Shipment>;
  onImportShipments: (batch: ImportBatch<ShipmentImportItem, ShipmentImportPatch>) => Promise<void>;
}

export function ShipmentsPage({
  shipments,
  onCreateShipment,
  onImportShipments,
}: ShipmentsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            getContext={() => shipmentImportContext(shipments)}
            onImport={onImportShipments}
          />
          <Button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex flex-row items-center gap-2 bg-[#003366] whitespace-nowrap text-white hover:bg-[#002244]"
          >
            <Plus size={18} className="shrink-0" />
            <span>Nouveau Conteneur / Lot</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shipments.map((shp) => (
          <ShipmentCard key={shp.id} shipment={shp} />
        ))}
      </div>

      <NewShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={onCreateShipment}
      />
    </div>
  );
}
