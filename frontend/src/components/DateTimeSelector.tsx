import React from 'react';

type HourSlot = { time: string; available: boolean; availableSeats?: number | null };

type Props = {
  label?: string;
  selectedDate: string;
  time: string;
  hours: HourSlot[]; // ahora recibe objetos con disponibilidad y asientos
  onChangeTime: (t: string) => void;
  guests?: number;
  loading?: boolean;
};

export default function DateTimeSelector({ label = 'Fecha', selectedDate, time, hours, onChangeTime, guests = 1, loading = false }: Props) {
  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <label className="block text-sm">{label}</label>
        <div className="border rounded px-2 py-1">
          <span className="text-sm">{selectedDate || 'Seleccioná un día'}</span>
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-sm">Hora</label>
        {loading ? (
          <div className="border rounded px-2 py-1">Cargando horas...</div>
        ) : (
          <select
            value={time}
            onChange={(e) => onChangeTime(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            {hours.map((h) => {
              const notEnough = h.availableSeats !== null && guests > h.availableSeats;
              const disabled = !h.available || notEnough;
              const label = `${h.time}${h.availableSeats !== null ? ` (${h.availableSeats})` : ''}${notEnough ? ' - no alcanza' : ''}`;
              return (
                <option key={h.time} value={h.time} disabled={disabled}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      </div>
    </div>
  );
}
