// frontend/src/lib/timeHelpers.ts
export const hourOptions: string[] = Array.from({ length: 24 }, (_, i) =>
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

export function isOpeningBeforeClosing(start?: string | null, end?: string | null): boolean {
  const ns = normalizeToHour(start);
  const ne = normalizeToHour(end);
  if (!ns || !ne) return false;
  const [sh, sm] = ns.split(":").map(Number);
  const [eh, em] = ne.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  return startMinutes < endMinutes;
}

export function normalizeToHour(input?: string | null): string | null {
  if (!input) return null;
  const s = String(input).trim();
  const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(s);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = m[2] !== undefined ? Number(m[2]) : 0;
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}