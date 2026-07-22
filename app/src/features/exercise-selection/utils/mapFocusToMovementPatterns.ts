import type { AllowedGoalCode } from "../../exercise-kb/models/ExerciseDefinition";
import type { MovementPatternCode } from "../../exercise-kb/models/MovementPattern";
import type { TrainingFocusArea } from "../../workout-blueprint/models/TrainingFocus";
import type { TrainingPriorityCode } from "../../workout-blueprint/models/TrainingPriority";

const FOCUS_TO_PATTERNS: Readonly<
  Record<TrainingFocusArea, readonly MovementPatternCode[]>
> = Object.freeze({
  upper_body: Object.freeze([
    "horizontal_push",
    "horizontal_pull",
    "vertical_push",
    "vertical_pull",
  ] as const),
  lower_body: Object.freeze(["squat", "hinge", "lunge"] as const),
  push: Object.freeze(["horizontal_push", "vertical_push"] as const),
  pull: Object.freeze(["horizontal_pull", "vertical_pull"] as const),
  legs: Object.freeze(["squat", "hinge", "lunge"] as const),
  full_body: Object.freeze([
    "squat",
    "hinge",
    "horizontal_push",
    "horizontal_pull",
  ] as const),
  posterior_chain: Object.freeze(["hinge", "horizontal_pull"] as const),
  core: Object.freeze(["rotation", "isolation"] as const),
  shoulders: Object.freeze(["vertical_push", "isolation"] as const),
  arms: Object.freeze(["isolation"] as const),
  conditioning: Object.freeze(["gait", "carry", "other"] as const),
});

/**
 * Map a strategic focus area to required movement pattern codes.
 * Pure and deterministic.
 */
export function mapFocusToMovementPatterns(
  focus: TrainingFocusArea,
): readonly MovementPatternCode[] {
  return FOCUS_TO_PATTERNS[focus] ?? Object.freeze(["other"] as const);
}

const PRIORITY_TO_GOALS: Readonly<
  Record<TrainingPriorityCode, readonly AllowedGoalCode[]>
> = Object.freeze({
  strength: Object.freeze(["strength"] as const),
  hypertrophy: Object.freeze(["hypertrophy"] as const),
  endurance: Object.freeze(["endurance"] as const),
  power: Object.freeze(["power"] as const),
  recovery: Object.freeze(["general_fitness", "mobility"] as const),
  technique: Object.freeze(["general_fitness"] as const),
  general_fitness: Object.freeze(["general_fitness"] as const),
});

/**
 * Map blueprint training priority codes to exercise-kb allowed goal codes.
 */
export function mapPriorityToGoalCodes(
  primary: TrainingPriorityCode,
  secondary: TrainingPriorityCode | null,
): readonly AllowedGoalCode[] {
  const codes = new Set<AllowedGoalCode>(PRIORITY_TO_GOALS[primary] ?? ["general_fitness"]);
  if (secondary) {
    for (const code of PRIORITY_TO_GOALS[secondary] ?? []) {
      codes.add(code);
    }
  }
  return Object.freeze([...codes].sort());
}
