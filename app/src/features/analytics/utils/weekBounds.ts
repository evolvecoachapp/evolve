/**
 * UTC Monday–Sunday week helpers for analytics bucketing.
 * Pure functions — no I/O.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

/** UTC midnight of the Monday that starts the week containing `date`. */
export function startOfUtcWeek(date: Date): Date {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // getUTCDay: 0 = Sunday … 6 = Saturday → days since Monday
  const day = utc.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  utc.setUTCDate(utc.getUTCDate() - daysSinceMonday);
  return utc;
}

/** ISO date string (YYYY-MM-DD) for a Date in UTC. */
export function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Monday key (YYYY-MM-DD) for the UTC week containing an ISO timestamp. */
export function weekKeyFromIso(isoTimestamp: string): string {
  return toUtcDateString(startOfUtcWeek(new Date(isoTimestamp)));
}

/** Monday keys from `fromMonday` through `toMonday` inclusive (UTC weeks). */
export function enumerateWeekKeys(
  fromMonday: Date,
  toMonday: Date,
): readonly string[] {
  const keys: string[] = [];
  let cursor = startOfUtcWeek(fromMonday).getTime();
  const end = startOfUtcWeek(toMonday).getTime();
  while (cursor <= end) {
    keys.push(toUtcDateString(new Date(cursor)));
    cursor += MS_PER_WEEK;
  }
  return keys;
}

export function addUtcWeeks(monday: Date, weeks: number): Date {
  return new Date(startOfUtcWeek(monday).getTime() + weeks * MS_PER_WEEK);
}
