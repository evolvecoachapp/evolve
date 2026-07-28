/**
 * Immutable athlete time zone (Sprint 29.1).
 *
 * IANA zone identifier foundation — not scheduling, not notifications.
 */
export interface AthleteTimeZone {
  readonly iana: string;
  readonly offsetMinutes: number | null;
  readonly displayName: string | null;
}
