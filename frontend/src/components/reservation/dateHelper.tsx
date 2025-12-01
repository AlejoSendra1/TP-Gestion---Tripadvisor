export const parseDate = (v: string | number | null | undefined) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

export const formatOnlyDate = (v: string | number | null | undefined) => {
  if (!v) return null;
  try {
    const d = typeof v === "string" ? new Date(v) : new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(v);
  }
};

export const formatDate = (v: string | number | null | undefined) => {
  const d = parseDate(v);
  if (!d) return "-";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTime = (v: string | number | null | undefined) => {
  const d = parseDate(v);
  if (!d) return "-";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};