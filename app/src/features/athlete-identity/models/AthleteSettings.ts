/**
 * Immutable athlete settings (Sprint 29.1).
 *
 * Presentation / calendar settings only — not auth, not cloud, not notifications runtime.
 */
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type AppearancePreference = "system" | "light" | "dark";

export interface AthleteSettings {
  readonly weekStartsOn: WeekStartDay;
  readonly use24HourClock: boolean;
  readonly appearance: AppearancePreference;
}
