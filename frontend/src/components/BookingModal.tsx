// File: frontend/src/components/BookingModal.tsx
import React, { useEffect, useState } from 'react';
// ¡NUEVO IMPORTE!
import { useNavigate } from 'react-router-dom';

import { apiClient } from '@/lib/apiClient';
import { useCreateReservation } from '@/hooks/useCreateReservation';
import { useToast } from '@/hooks/use-toast';
import DaysPicker from './DaysPicker';
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
  // --- ¡NUEVO! ---
  const navigate = useNavigate();

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

  // Hook para crear la reserva (ahora con estado PENDING)
  const { createReservation, isLoading: creating } = useCreateReservation();
  const { toast } = useToast();

  const type = (publicationType || '').toLowerCase();
  const isHotel = type === 'hotel';
  const isCoworking = type === 'coworking';
  const isRestaurant = type === 'restaurant';
  const isActivity = type === 'activity';
  const isRangeType = isHotel || isCoworking;

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    setError(null);

    apiClient.get(`/publications/${publicationId}/availability/days`)
        .then(res => {
          // ... (toda tu lógica de mapeo de días)
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

  useEffect(() => {
    if (!open) return;
    setStartDate(''); setEndDate('');
    setRestaurantDate(''); setRestaurantTime('12:00');
    setActivityDate(''); setActivityTime('12:00');
    setGuests(1); setRoomCount(1); setNotes(''); setError(null);
    setHoursSlots([]);
  }, [open]);

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
          // ... (toda tu lógica de mapeo de horas)
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
  }, [open, isRestaurant, restaurantDate, publicationId, guests, restaurantTime]); // <- Se agregaron dependencias

  useEffect(() => {
    if (!open || !isRestaurant) return;
    if (!hoursSlots.length) return;

    const current = hoursSlots.find(h => h.time === restaurantTime && h.available && (h.availableSeats === null || h.availableSeats >= guests));
    if (!current) {
      const first = hoursSlots.find(h => h.available && (h.availableSeats === null || h.availableSeats >= guests));
      if (first) setRestaurantTime(first.time);
      else {
        const any = hoursSlots.find(h => h.available) || hoursSlots[0];
        if (any) setRestaurantTime(any.time);
      }
    }
  }, [guests, hoursSlots, open, isRestaurant, restaurantTime]); // <- Se agregó dependencia

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

  function onPickDay(day: DayAvailability) {
    if (!day.available || !day.date) return;

    if (isRangeType) {
      if (!startDate) { setStartDate(day.date); setEndDate(''); setError(null); return; }
      if (startDate && !endDate) {
        if (day.date < startDate) { setStartDate(day.date); setEndDate(''); setError(null); return; }
        if (day.date === startDate) { setEndDate(''); setError(null); return; }
        if (areRangeAvailable(startDate, day.date)) { setEndDate(day.date); setError(null); } else { setError('El rango seleccionado contiene días no disponibles.'); }
        return;
      }
      setStartDate(day.date); setEndDate(''); setError(null);
      return;
    }

    if (isRestaurant) {
      if (!isDateAvailable(day.date)) { setError('Fecha no disponible para este restaurante.'); return; }
      setRestaurantDate(day.date);
      setError(null);
      return;
    }

    if (isActivity) {
      if (!isDateAvailable(day.date)) { setError('Fecha no disponible para esta actividad.'); return; }
      setActivityDate(day.date);
      setError(null);
      return;
    }
  }


  // --- ¡LÓGICA DE SUBMIT MODIFICADA! ---
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    // const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const token = localStorage.getItem('accessToken');
    if (!token) { setError('Debes iniciar sesión para reservar.'); return; }

    // 1. Validar y construir el body de la reserva
    const body: any = {};

    if (isRangeType) {
      if (!startDate) { setError('Seleccioná la fecha de inicio.'); return; }
      if (endDate) {
        if (!areRangeAvailable(startDate, endDate)) { setError('El rango seleccionado contiene días no disponibles.'); return; }
        if (isCoworking) {
          body.start_date = startDate; body.end_date = endDate;
        } else {
          body.startDate = startDate; body.endDate = endDate;
        }
      } else {
        if (!isDateAvailable(startDate)) { setError('La fecha seleccionada no está disponible.'); return; }
        if (isCoworking) {
          body.start_date = startDate;
        } else {
          body.startDate = startDate;
        }
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
        setError('La capacidad de la franja horaria no alcanza para la cantidad de personas.');
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
      // 2. Llamar a createReservation (crea la reserva en PENDING)
      const pendingReservation = await createReservation({ publicationId, token, ...body } as any);

      // 3. Si tiene éxito, navegar a la página de checkout con el ID
      if (pendingReservation && pendingReservation.id) {
        toast({ title: 'Pre-reserva creada', description: 'Por favor, completá el pago.' });
        onClose();
        navigate(`/checkout/${pendingReservation.id}`); // ¡Navegamos a la nueva ruta!
      } else {
        throw new Error("La respuesta de la reserva no incluyó un ID.");
      }

    } catch (err: any) {
      setError(err?.message || 'Error al crear la pre-reserva.');
    }
  }
  // --- FIN DE LA LÓGICA MODIFICADA ---


  if (!open) return null;
  const hours = generateHours();
  const selectedDate = isRangeType ? startDate : isRestaurant ? restaurantDate : isActivity ? activityDate : '';

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
        <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Reservar</h3>
          {fetching && <div className="mb-3">Cargando disponibilidad...</div>}
          {error && <div className="mb-3 text-destructive">{error}</div>}

          <DaysPicker
              days={days}
              isRangeType={isRangeType}
              startDate={startDate}
              endDate={endDate}
              selectedDate={selectedDate}
              onPickDay={onPickDay}
          />

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRangeType && <div className="text-sm text-muted-foreground">{startDate ? `Inicio: ${startDate}` : 'Seleccioná inicio'}{endDate ? ` — Fin: ${endDate}` : ''}</div>}

            <QuantityAndNotes isHotel={isHotel} guests={guests} roomCount={roomCount} notes={notes}
                              setGuests={setGuests} setRoomCount={setRoomCount} setNotes={setNotes} />

            {isRestaurant && (
                <DateTimeSelector label="Fecha" selectedDate={selectedDate} time={restaurantTime}
                                  hours={hoursSlots.length ? hoursSlots : hours.map(t => ({ time: t, available: true, availableSeats: null }))}
                                  onChangeTime={(t) => setRestaurantTime(t)}
                                  guests={guests}
                                  loading={hoursLoading}
                />
            )}

            <div className="flex items-center gap-3 mt-2">
              <button type="submit" disabled={creating} className="bg-primary text-white px-4 py-2 rounded">
                {creating ? 'Procesando...' : 'Ir a la confirmación'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
  );
}