import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";
import type { TrainingAvailability } from "../models/TrainingAvailability";

const MIN_DAYS = 1;
const MAX_DAYS = 7;
const MIN_DURATION = 15;
const MAX_DURATION = 240;

/**
 * Validate weekly training availability.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateAvailability(
  availability: TrainingAvailability,
): readonly AthleteContextValidationIssue[] {
  const issues: AthleteContextValidationIssue[] = [];

  if (
    !Number.isInteger(availability.daysPerWeek) ||
    availability.daysPerWeek < MIN_DAYS ||
    availability.daysPerWeek > MAX_DAYS
  ) {
    issues.push(
      Object.freeze({
        field: "availability.daysPerWeek",
        code: "invalid_days_per_week" as const,
      }),
    );
  }

  if (
    !Number.isFinite(availability.sessionDurationMinutes) ||
    !Number.isInteger(availability.sessionDurationMinutes) ||
    availability.sessionDurationMinutes < MIN_DURATION ||
    availability.sessionDurationMinutes > MAX_DURATION
  ) {
    issues.push(
      Object.freeze({
        field: "availability.sessionDurationMinutes",
        code: "invalid_session_duration" as const,
      }),
    );
  }

  for (let index = 0; index < availability.preferredDays.length; index += 1) {
    const day = availability.preferredDays[index]!;
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      issues.push(
        Object.freeze({
          field: `availability.preferredDays[${index}]`,
          code: "invalid_preferred_day" as const,
        }),
      );
    }
  }

  return Object.freeze(issues);
}
