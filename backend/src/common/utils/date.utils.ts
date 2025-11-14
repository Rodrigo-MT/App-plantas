export function parseYMDToLocalDate(value: any): Date | null {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return value;
  const str = String(value).trim();
  // Accept YYYY-MM-DD specifically and parse as local date (avoids UTC shift)
  const ymd = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(str);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10) - 1;
    const d = parseInt(ymd[3], 10);
    const dt = new Date(y, m, d);
    if (isNaN(dt.getTime())) return null;
    return dt;
  }

  // Fallback to Date parsing for full ISO strings
  const dt = new Date(str);
  if (isNaN(dt.getTime())) return null;
  return dt;
}
