import type {
  AppearancePreference,
  AthleteSettings,
  WeekStartDay,
} from "../models/AthleteSettings";

export interface BuildSettingsInput {
  readonly weekStartsOn?: WeekStartDay;
  readonly use24HourClock?: boolean;
  readonly appearance?: AppearancePreference;
}

/**
 * Builds immutable AthleteSettings.
 */
export function buildSettings(
  input: BuildSettingsInput = {},
): AthleteSettings {
  return Object.freeze({
    weekStartsOn: input.weekStartsOn ?? 1,
    use24HourClock: input.use24HourClock ?? true,
    appearance: input.appearance ?? "system",
  });
}
