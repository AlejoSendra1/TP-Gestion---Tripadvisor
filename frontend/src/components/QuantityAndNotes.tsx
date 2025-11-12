// typescript
import React from 'react';

type Props = {
  isHotel: boolean;
  guests: number;
  roomCount: number;
  notes: string;
  setGuests: (n: number) => void;
  setRoomCount: (n: number) => void;
  setNotes: (s: string) => void;
};

export default function QuantityAndNotes({ isHotel, guests, roomCount, notes, setGuests, setRoomCount, setNotes }: Props) {
  return (
    <div className="flex gap-3">
      {isHotel ? (
        <div className="flex-1">
          <label className="block text-sm">Habitaciones</label>
          <input
            type="number"
            min={1}
            value={roomCount}
            onChange={(e) => setRoomCount(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      ) : (
        <div className="flex-1">
          <label className="block text-sm">Personas</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      )}

      <div className="flex-1">
        <label className="block text-sm">Notas</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
}
