// File: `frontend/src/components/BookingModal.tsx`
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useCreateReservation } from '@/hooks/useCreateReservation';
import { useToast } from '@/hooks/use-toast';

type BookingModalProps = {
  publicationId: number | string;
  publicationType?: string;
  open: boolean;
  onClose: () => void;
};

type DayAvailability = {
  date: string;
  available: boolean;
};

export default function BookingModal({ publicationId, publicationType, open, onClose }: BookingModalProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [guests, setGuests] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createReservation, isLoading: creating } = useCreateReservation();
  const { toast } = useToast();

  const isHotel = publicationType?.toLowerCase() === 'hotel';

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    setError(null);
    apiClient
      .get(`/publications/${publicationId}/availability/days`)
      .then((res) => setDays(res.data as DayAvailability[]))
      .catch(() => setError('No se pudo obtener disponibilidad.'))
      .finally(() => setFetching(false));
  }, [open, publicationId]);

  useEffect(() => {
    if (!open) {
      setStartDate('');
      setEndDate('');
      setGuests(1);
      setNotes('');
      setDays([]);
      setError(null);
    }
  }, [open]);

  function formatDayLabel(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  }

  function isRangeAvailable(startIso: string, endIso: string) {
    if (!startIso || !endIso) return false;
    const map = new Map(days.map((d) => [d.date, d.available]));
    let d = new Date(startIso + 'T00:00:00');
    const end = new Date(endIso + 'T00:00:00');
    while (d <= end) {
      const iso = d.toISOString().slice(0, 10);
      if (!map.get(iso)) return false;
      d.setDate(d.getDate() + 1);
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) {
      toast?.({ title: 'Seleccionar fecha', description: 'Elegí una fecha.' });
      return;
    }

    const finalEnd = isHotel ? (endDate || startDate) : startDate;

    if (!isRangeAvailable(startDate, finalEnd)) {
      toast?.({ title: 'Fechas no disponibles', description: 'El rango seleccionado contiene días no disponibles.', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      toast?.({ title: 'No autorizado', description: 'Debes iniciar sesión para reservar.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await createReservation({
        publicationId,
        startDate,
        endDate: finalEnd,
        guests,
        additionalInfo: notes,
        token,
      });
      toast?.({ title: 'Reservación creada', description: 'Reservación creada con éxito.' });
      onClose();
    } catch (err: any) {
      console.error('Error creando reserva:', err);
      toast?.({ title: 'Error al crear reserva', description: err?.message || 'Ver consola', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Reservar</h3>

        {fetching && <div className="mb-3">Cargando disponibilidad...</div>}
        {error && <div className="text-red-600 mb-3">{error}</div>}

        <div className="mb-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const dayIso = (d.date || '').slice(0, 10); // normaliza a YYYY-MM-DD
              const startIso = startDate ? startDate.slice(0, 10) : '';
              const endIso = endDate ? endDate.slice(0, 10) : '';
              const isSelected = dayIso === startIso || dayIso === endIso;

              const btnClass = d.available
                ? isSelected
                  ? "bg-green-600 text-white" // seleccionado
                  : "bg-green-100 text-green-800 hover:bg-green-200" // disponible
                : "bg-gray-200 text-gray-400 cursor-not-allowed"; // no disponible

              return (
                <button
                  key={dayIso}
                  type="button"
                  disabled={!d.available}
                  onClick={() => {
                    if (!d.available) return;
                    if (isHotel) {
                      if (startIso && !endIso) {
                        if (new Date(dayIso) >= new Date(startIso)) {
                          setEndDate(dayIso);
                          return;
                        }
                      }
                      setStartDate(dayIso);
                      setEndDate("");
                    } else {
                      setStartDate(dayIso);
                      setEndDate(dayIso);
                    }
                  }}
                  className={`text-sm py-2 rounded ${btnClass}`}
                >
                  <div>{formatDayLabel(dayIso)}</div>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {isHotel ? 'Clic en un día para elegir inicio. Si clickeas otro día posterior se fija como fin.' : 'Seleccioná un día para la reserva.'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isHotel ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm">Fecha inicio</label>
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); }} className="w-full border rounded px-2 py-1" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm">Fecha fin</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm">Fecha</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value); // mantener endDate igual en modo single-date
                }}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm">Personas</label>
            <input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full border rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded px-2 py-1" rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded border">
              Cancelar
            </button>
            <button type="submit" disabled={loading || creating} className="px-4 py-1 rounded bg-blue-600 text-white">
              {loading || creating ? 'Enviando...' : 'Reservar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
