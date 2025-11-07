// typescript
import React from 'react';

type Props = {
  label?: string;
  selectedDate: string;
  time: string;
  hours: string[];
  onChangeTime: (t: string) => void;
};

export default function DateTimeSelector({ label = 'Fecha', selectedDate, time, hours, onChangeTime }: Props) {
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
        <select
          value={time}
          onChange={(e) => onChangeTime(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
