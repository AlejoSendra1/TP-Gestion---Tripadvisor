// typescript
// File: `frontend/src/components/DaysPicker.tsx`
import React from 'react';
import { DayAvailability } from '@/utils/dates';
import { formatDayLabel } from '@/utils/dates';

type Props = {
  days: DayAvailability[];
  isRangeType: boolean;
  startDate: string;
  endDate: string;
  selectedDate?: string;
  onPickDay: (day: DayAvailability) => void;
};

export default function DaysPicker({ days, isRangeType, startDate, endDate, selectedDate, onPickDay }: Props) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-3">
        {days.map((day) => {
          const isStart = startDate === day.date;
          const isEnd = endDate === day.date;
          const isSelected = !!selectedDate && selectedDate === day.date;
          const inRange =
            isRangeType && startDate && endDate && day.date >= startDate && day.date <= endDate;

          const base = 'px-4 py-3 rounded-lg text-sm font-semibold transition';
          const availableClass = day.available
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed';
          const rangeClass = inRange ? 'ring-2 ring-offset-1 ring-primary' : '';
          const selectedClass = (isStart || isEnd || isSelected) ? 'ring-2 ring-offset-1 ring-primary' : '';

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onPickDay(day)}
              disabled={!day.available}
              className={`${base} ${availableClass} ${rangeClass} ${selectedClass}`}
            >
              {formatDayLabel(day.date)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
