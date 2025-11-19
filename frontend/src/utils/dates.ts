// typescript
// File: `frontend/src/utils/dates.ts`
export type DayAvailability = {
  date: string; // 'YYYY-MM-DD' o ''
  available: boolean;
};

function normalizeDateString(d: string | undefined | null): string {
  if (!d) return '';
  return String(d).split('T')[0];
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function toLocalDate(dateStr: string): Date | null {
  const s = normalizeDateString(dateStr);
  if (!s) return null;
  const parts = s.split('-').map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d); // crea la fecha a medianoche local (sin shift)
}

export function formatDayLabel(dateStr: string): string {
  const s = normalizeDateString(dateStr);
  if (!s) return 'Sin fecha';
  const isoToday = todayIso();
  if (s === isoToday) return 'Hoy';

  const local = toLocalDate(s);
  if (!local) return s;
  return local.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
}

export function isDateAvailable(days: DayAvailability[], date: string): boolean {
  const target = normalizeDateString(date);
  if (!target) return false;
  const found = days.find((d) => normalizeDateString(d.date) === target);
  return !!found && !!found.available;
}

export function areRangeAvailable(days: DayAvailability[], start: string, end: string): boolean {
  const s = normalizeDateString(start);
  const e = normalizeDateString(end);
  if (!s || !e) return false;
  // Buscar índices en el array exactamente en el orden enviado por backend
  const startIdx = days.findIndex((d) => normalizeDateString(d.date) === s);
  const endIdx = days.findIndex((d) => normalizeDateString(d.date) === e);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return false;
  for (let i = startIdx; i <= endIdx; i++) {
    if (!days[i] || !days[i].available) return false;
  }
  return true;
}
