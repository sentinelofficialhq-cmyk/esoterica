export type YMD = { y: number; m: number; d: number };

/** Parse a strict `YYYY-MM-DD` calendar date; throws on malformed or impossible dates. */
export function parseYMD(s: string): YMD {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) throw new Error(`Invalid date: ${s}`);
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    throw new Error(`Invalid date: ${s}`);
  }
  return { y, m, d };
}

export const toYMD = ({ y, m, d }: YMD): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const localYMD = (instant: Date): string =>
  toYMD({ y: instant.getFullYear(), m: instant.getMonth() + 1, d: instant.getDate() });

export const utcYMD = (instant: Date): string =>
  toYMD({ y: instant.getUTCFullYear(), m: instant.getUTCMonth() + 1, d: instant.getUTCDate() });

export const todayLocal = (now = new Date()): string => localYMD(now);

export function addDays(s: string, n: number): string {
  const { y, m, d } = parseYMD(s);
  return utcYMD(new Date(Date.UTC(y, m - 1, d + n)));
}

/** 12:00 UTC on the date: a stable instant for sky calculations when birth time is unknown. */
export function noonUTC(s: string): Date {
  const { y, m, d } = parseYMD(s);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "Mon" */
export function weekday(s: string): string {
  const { y, m, d } = parseYMD(s);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export const monthName = (m: number): string => MONTHS[m - 1];

export const daysInMonth = (y: number, m: number): number => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** "13 Oct 2026" */
export function formatDate(s: string): string {
  const { y, m, d } = parseYMD(s);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "Wednesday" */
export function weekdayLong(s: string): string {
  const { y, m, d } = parseYMD(s);
  return WEEKDAYS_LONG[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** "October" */
export const monthLong = (m: number): string => MONTHS_LONG[m - 1];

/** 1 → "1st", 22 → "22nd", 13 → "13th" */
export function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suffix}`;
}

/** Monday of the week containing the date. */
export function weekStart(s: string): string {
  const { y, m, d } = parseYMD(s);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return addDays(s, -((dow + 6) % 7));
}
