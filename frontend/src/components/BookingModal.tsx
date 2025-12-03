// File: frontend/src/components/BookingModal.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importar idioma español
import { Calendar } from "@/components/ui/calendar"; // <--- Componente de Calendario

import { apiClient } from '@/lib/apiClient';
import { useCreateReservation } from '@/hooks/useCreateReservation';
import { useToast } from '@/hooks/use-toast';
import DateTimeSelector from './DateTimeSelector';
import QuantityAndNotes from './QuantityAndNotes';
import { DayAvailability, isDateAvailable as utilIsDateAvailable, areRangeAvailable as utilAreRangeAvailable } from '@/utils/dates';

type HourSlot = { time: string; available: boolean; availableSeats?: number | null };

type BookingModalProps = {
  publicationId: number | string;
  publicationType?: string;
  open: boolean;
  onClose: () => void;
};

export default function BookingModal({ publicationId, publicationType, open, onClose }: BookingModalProps) {
  const navigate = useNavigate();

  // Estados de fechas
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);

  // Mantenemos los strings para la lógica de envío existente
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [restaurantDate, setRestaurantDate] = useState('');
  const [restaurantTime, setRestaurantTime] = useState('12:00');
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('12:00');

  const [guests, setGuests] = useState(1);
  const [roomCount, setRoomCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [hoursSlots, setHoursSlots] = useState<HourSlot[]>([]);
  const [fetching, setFetching] = useState(false);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createReservation, isLoading: creating } = useCreateReservation();
  const { toast } = useToast();

  const type = (publicationType || '').toLowerCase();
  const isHotel = type === 'hotel';
  const isCoworking = type === 'coworking';
  const isRestaurant = type === 'restaurant';
  const isActivity = type === 'activity';
  const isRangeType = isHotel || isCoworking;

  // --- Efecto de Carga de Disponibilidad (Igual que antes) ---
  useEffect(() => {
    if (!open) return;
    setFetching(true);
    setError(null);

    apiClient.get(`/publications/${publicationId}/availability/days`)
        .then(res => {
          const payload = Array.isArray(res.data) ? res.data : [];
          const mapped = payload.map((d: any) => {
            if (typeof d === 'string') {
              const dateStr = d.split('T')[0];
              return { date: dateStr, available: true };
            }
            if (d && d.date !== undefined) {
              if (typeof d.date === 'string') {
                const dateStr = String(d.date).split('T')[0];
                return { date: dateStr, available: d.available === undefined ? true : Boolean(d.available) };
              }
              const parsed = new Date(d.date);
              const dateStr = isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
              return { date: dateStr, available: d.available === undefined ? true : Boolean(d.available) };
            }
            return { date: '', available: false };
          });
          setDays(mapped);
        })
        .catch(() => setError('No se pudo cargar disponibilidad.'))
        .finally(() => setFetching(false));
  }, [open, publicationId]);

  // --- Reset de estados al abrir ---
  useEffect(() => {
    if (!open) return;
    setDateRange({ from: undefined, to: undefined });
    setSingleDate(undefined);
    setStartDate(''); setEndDate('');
    setRestaurantDate(''); setRestaurantTime('12:00');
    setActivityDate(''); setActivityTime('12:00');
    setGuests(1); setRoomCount(1); setNotes(''); setError(null);
    setHoursSlots([]);
  }, [open]);

  // --- Carga de Horas (Restaurante) ---
  useEffect(() => {
    if (!open || !isRestaurant || !restaurantDate) return;
    setHoursLoading(true);
    setError(null);
    setHoursSlots([]);

    const controller = new AbortController();
    apiClient.get(`/publications/${publicationId}/availability/hours`, {
      params: { date: restaurantDate },
      signal: controller.signal
    })
        .then(res => {
          const payload = Array.isArray(res.data) ? res.data : [];
          const mapped: HourSlot[] = payload.map((h: any) => {
            const startStr = String(h.start || h.dateTime || '');
            const time = startStr.includes('T') ? startStr.split('T')[1].slice(0,5) : (startStr.slice(11,16) || '00:00');
            return {
              time,
              available: h.available === undefined ? true : Boolean(h.available),
              availableSeats: h.availableSeats === undefined ? null : (h.availableSeats === null ? null : Number(h.availableSeats))
            };
          });
          setHoursSlots(mapped);

          // Lógica para pre-seleccionar hora
          const current = mapped.find(h => h.time === restaurantTime && h.available && (h.availableSeats === null || h.availableSeats >= guests));
          if (!current) {
            const first = mapped.find(h => h.available && (h.availableSeats === null || h.availableSeats >= guests));
            if (first) setRestaurantTime(first.time);
          }
        })
        .catch(err => {
          if (err?.name === 'CanceledError' || err?.message === 'canceled') return;
          setError('No se pudo cargar franjas horarias.');
        })
        .finally(() => setHoursLoading(false));

    return () => controller.abort();
  }, [open, isRestaurant, restaurantDate, publicationId, guests]); // Quitamos restaurantTime de deps para evitar loop

  const isDateAvailable = (d: string) => utilIsDateAvailable(days, d);
  const areRangeAvailable = (s: string, e: string) => utilAreRangeAvailable(days, s, e);

  const generateHours = () => {
    const hs: string[] = [];
    for (let h = 0; h <= 23; h++) {
      const hh = String(h).padStart(2,'0');
      hs.push(`${hh}:00`);
    }
    return hs;
  };

  // --- Lógica de Submit ---
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) { setError('Debes iniciar sesión para reservar.'); return; }

    const body: any = {};

    if (isRangeType) {
      if (!startDate) { setError('Seleccioná la fecha de inicio.'); return; }
      if (endDate) {
        if (!areRangeAvailable(startDate, endDate)) { setError('El rango seleccionado contiene días no disponibles.'); return; }
        if (isCoworking) { body.start_date = startDate; body.end_date = endDate; }
        else { body.startDate = startDate; body.endDate = endDate; }
      } else {
        if (!isDateAvailable(startDate)) { setError('La fecha seleccionada no está disponible.'); return; }
        if (isCoworking) { body.start_date = startDate; }
        else { body.startDate = startDate; }
      }
    }

    if (isCoworking) body.guests = guests;
    if (isHotel) body.roomCount = roomCount;

    if (isRestaurant) {
      if (!restaurantDate) { setError('Seleccioná la fecha.'); return; }
      if (!isDateAvailable(restaurantDate)) { setError('La fecha no está disponible.'); return; }
      if (!restaurantTime) { setError('Seleccioná la hora.'); return; }
      const slot = hoursSlots.find(h => h.time === restaurantTime);
      if (slot && slot.availableSeats !== null && guests > slot.availableSeats) {
        setError('La capacidad de la franja horaria no alcanza.');
        return;
      }
      body.dateTime = `${restaurantDate}T${restaurantTime}:00`;
      body.guests = guests;
    }

    if (isActivity) {
      if (!activityDate) { setError('Seleccioná la fecha.'); return; }
      if (!isDateAvailable(activityDate)) { setError('La fecha no está disponible.'); return; }
      body.dateTime = `${activityDate}T00:00:00`;
      body.guests = guests;
    }

    if (notes) body.additionalInfo = notes;

    try {
      const pendingReservation = await createReservation({ publicationId, token, ...body } as any);
      if (pendingReservation && pendingReservation.id) {
        toast({ title: 'Pre-reserva creada', description: 'Por favor, completá el pago.' });
        onClose();
        navigate(`/checkout/${pendingReservation.id}`);
      } else {
        throw new Error("La respuesta de la reserva no incluyó un ID.");
      }
    } catch (err: any) {
      setError(err?.message || 'Error al crear la pre-reserva.');
    }
  }

  // --- Render ---
  if (!open) return null;
  const hours = generateHours();

  // Función para deshabilitar fechas en el calendario
  const isDateDisabled = (date: Date) => {
    // 1. Deshabilitar fechas pasadas (ayer y anteriores)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // 2. Si no hay datos de API cargados aún, no bloqueamos nada (o bloqueamos todo, depende UX)
    if (days.length === 0) return false;

    // 3. Deshabilitar según API
    const dateStr = format(date, 'yyyy-MM-dd');
    return !isDateAvailable(dateStr);
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Reservar Experiencia</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
          </div>

          {fetching && <div className="mb-3 text-sm text-muted-foreground animate-pulse">Cargando disponibilidad...</div>}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-100">{error}</div>}

          <div className="grid md:grid-cols-2 gap-8 mb-6">
            {/* --- SECCIÓN CALENDARIO --- */}
            <div className="flex flex-col items-center border rounded-lg p-4 bg-slate-50">
                <span className="text-sm font-semibold mb-2 text-muted-foreground">
                    {isRangeType ? "Selecciona tus fechas" : "Selecciona una fecha"}
                </span>

              {isRangeType ? (
                  <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range || { from: undefined, to: undefined });
                        setStartDate(range?.from ? format(range.from, 'yyyy-MM-dd') : '');
                        setEndDate(range?.to ? format(range.to, 'yyyy-MM-dd') : '');
                        // Validación rápida de rango en UI
                        if (range?.from && range?.to) {
                          const start = format(range.from, 'yyyy-MM-dd');
                          const end = format(range.to, 'yyyy-MM-dd');
                          if (!areRangeAvailable(start, end)) {
                            setError('El rango incluye fechas no disponibles');
                          } else {
                            setError(null);
                          }
                        }
                      }}
                      disabled={isDateDisabled}
                      locale={es}
                      className="rounded-md border bg-white"
                  />
              ) : (
                  <Calendar
                      mode="single"
                      selected={singleDate}
                      onSelect={(date) => {
                        setSingleDate(date);
                        const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
                        if (isRestaurant) setRestaurantDate(dateStr);
                        if (isActivity) setActivityDate(dateStr);
                        setError(null);
                      }}
                      disabled={isDateDisabled}
                      locale={es}
                      className="rounded-md border bg-white"
                  />
              )}
            </div>

            {/* --- SECCIÓN DETALLES --- */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
                <div className="space-y-4">
                  {isRangeType && (
                      <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
                        <p><strong>Entrada:</strong> {startDate ? format(new Date(startDate + 'T00:00:00'), 'dd/MM/yyyy') : '...'}</p>
                        <p><strong>Salida:</strong> {endDate ? format(new Date(endDate + 'T00:00:00'), 'dd/MM/yyyy') : '...'}</p>
                      </div>
                  )}
                  {!isRangeType && singleDate && (
                      <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
                        <p><strong>Fecha:</strong> {format(singleDate, 'dd/MM/yyyy')}</p>
                      </div>
                  )}

                  <QuantityAndNotes
                      isHotel={isHotel}
                      guests={guests}
                      roomCount={roomCount}
                      notes={notes}
                      setGuests={setGuests}
                      setRoomCount={setRoomCount}
                      setNotes={setNotes}
                  />

                  {isRestaurant && (
                      <DateTimeSelector
                          label="Horario"
                          selectedDate={restaurantDate}
                          time={restaurantTime}
                          hours={hoursSlots.length ? hoursSlots : hours.map(t => ({ time: t, available: true, availableSeats: null }))}
                          onChangeTime={(t) => setRestaurantTime(t)}
                          guests={guests}
                          loading={hoursLoading}
                      />
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                  <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm disabled:opacity-50"
                  >
                    {creating ? 'Procesando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}