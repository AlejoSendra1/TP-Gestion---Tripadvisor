// frontend/src/lib/timeHelpers.ts
export const hourOptions = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

export const timeToMinutes = (t?: string): number | null => {
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length < 1) return null;
  const hh = parseInt(parts[0], 10) || 0;
  const mm = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
  return hh * 60 + mm;
};

export const isOpeningBeforeClosing = (opening?: string, closing?: string): boolean => {
  const o = timeToMinutes(opening);
  const c = timeToMinutes(closing);
  if (o === null || c === null) return true; // si falta uno, no validar estrictamente
  return o < c;
};

export const normalizeToHour = (time?: string): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length === 0) return "";
  const hh = parts[0].padStart(2, "0");
  return `${hh}:00`;
};
