import { useState } from 'react';
import { Shipment, ShipmentStatus, SHIPMENT_STATUS_LABELS, BTS_ORIGINS, BTS_DESTINATIONS } from '@/types';
import { formatVolume, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Ship, Plane, Plus, Calendar, ArrowRight, Anchor, CheckCircle } from 'lucide-react';

interface ShipmentsPageProps {
  shipments: Shipment[];
  onCreateShipment: (data: Omit<Shipment, 'id' | 'created_at'>) => Promise<Shipment>;
}

export function ShipmentsPage({ shipments, onCreateShipment }: ShipmentsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [containerNumber, setContainerNumber] = useState('');
  const [type, setType] = useState<'sea' | 'air'>('sea');
  const [origin, setOrigin] = useState(BTS_ORIGINS[0]);
  const [destination, setDestination] = useState(BTS_DESTINATIONS[0]);
  const [carrier, setCarrier] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [maxVolume, setMaxVolume] = useState<number>(68);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'loading':
        return <Badge variant="warning">{SHIPMENT_STATUS_LABELS[status]}</Badge>;
      case 'in_transit':
        return <Badge variant="info">{SHIPMENT_STATUS_LABELS[status]}</Badge>;
      case 'customs':
        return <Badge variant="danger">{SHIPMENT_STATUS_LABELS[status]}</Badge>;
      case 'arrived':
      case 'unloaded':
        return <Badge variant="success">{SHIPMENT_STATUS_LABELS[status]}</Badge>;
      default:
        return <Badge variant="default">{SHIPMENT_STATUS_LABELS[status]}</Badge>;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateShipment({
        container_number: containerNumber,
        type,
        origin,
        destination,
        status: 'loading',
        carrier,
        departure_date: departureDate || undefined,
        estimated_arrival: estimatedArrival || undefined,
        max_volume_cbm: maxVolume,
        current_volume_cbm: 0,
        package_ids: [],
        notes,
      });
      setIsModalOpen(false);
      setContainerNumber('');
      setCarrier('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
            Conteneurs & Lots d'Expédition
          </h2>
          <p className="text-sm text-slate-500">
            Groupage conteneurs maritimes (FCL/LCL) et fret aérien, gestion du taux de remplissage volumétrique.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex flex-row items-center whitespace-nowrap gap-2 bg-[#003366] text-white hover:bg-[#002244]"
        >
          <Plus size={18} className="shrink-0" />
          <span>Nouveau Conteneur / Lot</span>
        </Button>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shipments.map((shp) => {
          const fillPercentage = Math.min(
            100,
            Math.round((shp.current_volume_cbm / shp.max_volume_cbm) * 100)
          );

          return (
            <div
              key={shp.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366]/10 text-[#003366]">
                      {shp.type === 'sea' ? <Ship size={18} /> : <Plane size={18} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {shp.type === 'sea' ? 'Fret Maritime' : 'Fret Aérien'}
                      </span>
                      <p className="font-mono text-sm font-bold text-slate-800">
                        {shp.container_number}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(shp.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="my-4 flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-lg border">
                  <span>{shp.origin}</span>
                  <ArrowRight size={14} className="text-slate-400 shrink-0 mx-2" />
                  <span className="text-[#003366]">{shp.destination}</span>
                </div>

                {/* Filling Progress Bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taux de remplissage m³ :</span>
                    <span className="font-bold text-slate-800">
                      {formatVolume(shp.current_volume_cbm)} / {shp.max_volume_cbm} m³ ({fillPercentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full transition-all duration-300 ${
                        fillPercentage >= 90
                          ? 'bg-rose-500'
                          : fillPercentage >= 70
                          ? 'bg-amber-500'
                          : 'bg-[#003366]'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Dates & Carrier */}
                <div className="mt-4 space-y-1 text-xs text-slate-500">
                  <p>
                    Transporteur : <span className="font-medium text-slate-700">{shp.carrier}</span>
                  </p>
                  {shp.departure_date && (
                    <p>
                      Départ : <span className="font-medium text-slate-700">{formatDate(shp.departure_date)}</span>
                    </p>
                  )}
                  {shp.estimated_arrival && (
                    <p>
                      Arrivée estimée : <span className="font-medium text-slate-700">{formatDate(shp.estimated_arrival)}</span>
                    </p>
                  )}
                  <p>
                    Colis assignés : <span className="font-bold text-[#003366]">{shp.package_ids.length} colis</span>
                  </p>
                </div>
              </div>

              {shp.notes && (
                <div className="mt-4 border-t pt-3 text-[11px] text-slate-400 italic">
                  {shp.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: New Shipment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer un nouveau lot de groupage / Conteneur"
        maxWidth="xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Type de fret *
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const t = e.target.value as 'sea' | 'air';
                  setType(t);
                  setMaxVolume(t === 'sea' ? 68 : 15);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
              >
                <option value="sea">Maritime (Conteneur)</option>
                <option value="air">Aérien (Vol Cargo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                N° Conteneur / Vol *
              </label>
              <Input
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
                placeholder="Ex: MSKU-998811-4"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Hub de Départ *
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
              >
                {BTS_ORIGINS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Port / Hub d'Arrivée *
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
              >
                {BTS_DESTINATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Compagnie / Transporteur *
              </label>
              <Input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Ex: Maersk, CMA CGM, Ethiopian..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Capacité Max (m³) *
              </label>
              <Input
                type="number"
                value={maxVolume}
                onChange={(e) => setMaxVolume(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Date départ prévue
              </label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Date d'arrivée estimée
              </label>
              <Input
                type="date"
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Notes & Scellés
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Numéro de scellé, instructions spéciales..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le lot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
