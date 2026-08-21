import type { ActivityLevel } from "../../types/api";

export interface ActivityLevelOption {
  readonly value: ActivityLevel;
  readonly label: string;
  readonly description: string;
}

/** Athlete-facing copy mapped 1:1 onto the backend `activity_level` enum. */
export const ACTIVITY_LEVEL_OPTIONS: readonly ActivityLevelOption[] = [
  {
    value: "sedentary",
    label: "Just getting started",
    description: "Mostly desk-bound — little structured training yet.",
  },
  {
    value: "lightly_active",
    label: "Light weekly movement",
    description: "One or two easy sessions a week.",
  },
  {
    value: "moderately_active",
    label: "Consistent training",
    description: "Three to four dedicated training days.",
  },
  {
    value: "very_active",
    label: "Highly active",
    description: "Five or six committed sessions a week.",
  },
  {
    value: "extremely_active",
    label: "High-volume athlete",
    description: "You train most days at a serious intensity.",
  },
];

export function getActivityLevelLabel(
  value: ActivityLevel | null | undefined,
): string {
  if (!value) {
    return "—";
  }
  return ACTIVITY_LEVEL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
