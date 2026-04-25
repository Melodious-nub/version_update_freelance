export function validateEndDate(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  intervalType: string | null | undefined
): { valid: boolean; error?: string } {
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    if (typeof v === 'string') {
      const s = v.trim();
      if (!s) return null;

      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const dt = new Date(y, mo, d);
        return isNaN(dt.getTime()) ? null : dt;
      }

      const dt = new Date(s);
      return isNaN(dt.getTime()) ? null : dt;
    }

    if (typeof v === 'object' && typeof v.toDate === 'function') {
      const dt = v.toDate();
      return dt instanceof Date && !isNaN(dt.getTime()) ? dt : null;
    }

    return null;
  };

  const start = toDate(startDate);
  const end = toDate(endDate);

  if (!end) return { valid: true };

  const missing: string[] = [];
  if (!start) missing.push('start date');
  if (!intervalType || typeof intervalType !== 'string' || !intervalType.trim()) {
    missing.push('interval type');
  }

  if (missing.length > 0) {
    return { valid: false, error: `Please select ${missing.join(', ')}` };
  }

  const type = intervalType.trim().toLowerCase();
  const allowed = ['daily', 'weekly', 'monthly', 'yearly'];
  if (!allowed.includes(type)) {
    return { valid: false, error: `intervalType must be one of: ${allowed.join(', ')}.` };
  }

  function addDays(d: Date, days: number) {
    const r = new Date(d.getTime());
    r.setDate(r.getDate() + days);
    return r;
  }

  function addMonthsClamped(d: Date, months: number) {
    const src = new Date(d.getTime());
    const day = src.getDate();
    const hour = src.getHours();
    const min = src.getMinutes();
    const sec = src.getSeconds();
    const ms = src.getMilliseconds();

    const target = new Date(src.getFullYear(), src.getMonth() + months, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, lastDay));
    target.setHours(hour, min, sec, ms);
    return target;
  }

  function addYearsClamped(d: Date, years: number) {
    return addMonthsClamped(d, years * 12);
  }

  let threshold: Date;

  switch (type) {
    case 'daily':
      threshold = addDays(start!, 1);
      if (end.getTime() >= threshold.getTime()) return { valid: true };
      return { valid: false, error: `For 'daily', endDate must be at least 1 day after startDate (>= ${fmt(threshold)}).` };

    case 'weekly':
      threshold = addDays(start!, 7);
      if (end.getTime() >= threshold.getTime()) return { valid: true };
      return { valid: false, error: `For 'weekly', endDate must be at least 7 days after startDate (>= ${fmt(threshold)}).` };

    case 'monthly':
      threshold = addMonthsClamped(start!, 1);
      if (end.getTime() >= threshold.getTime()) return { valid: true };
      return { valid: false, error: `For 'monthly', endDate must be at least one full month after startDate (>= ${fmt(threshold)}).` };

    case 'yearly':
      threshold = addYearsClamped(start!, 1);
      if (end.getTime() >= threshold.getTime()) return { valid: true };
      return { valid: false, error: `For 'yearly', endDate must be at least one full year after startDate (>= ${fmt(threshold)}).` };

    default:
      return { valid: false, error: 'Unsupported intervalType.' };
  }
}

export default validateEndDate;
