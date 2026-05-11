const RELATIVE_RE = /^(\d+)([dwmy])$/i;

const MS = {
  d: 86_400_000,
  w: 7 * 86_400_000,
} as const;

export function parseDate(input: string, now: Date = new Date()): Date {
  const trimmed = input.trim();
  if (!trimmed) throw new Error(`invalid date: "${input}"`);

  const lower = trimmed.toLowerCase();
  if (lower === "now") return new Date(now.getTime());
  if (lower === "today") {
    const d = new Date(now.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (lower === "yesterday") {
    const d = new Date(now.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  }

  const rel = RELATIVE_RE.exec(trimmed);
  if (rel) {
    const n = Number(rel[1]);
    const unit = rel[2]!.toLowerCase() as "d" | "w" | "m" | "y";
    if (unit === "d" || unit === "w") {
      return new Date(now.getTime() - n * MS[unit]);
    }
    const d = new Date(now.getTime());
    if (unit === "m") d.setMonth(d.getMonth() - n);
    else d.setFullYear(d.getFullYear() - n);
    return d;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`invalid date: "${input}"`);
  }
  return parsed;
}

export function withinRange(
  iso: string,
  since: Date | null,
  until: Date | null,
): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  if (since && t < since.getTime()) return false;
  if (until && t > until.getTime()) return false;
  return true;
}
