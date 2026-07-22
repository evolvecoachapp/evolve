import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { WorkoutDayBlueprint } from "../../workout-blueprint/models/WorkoutDayBlueprint";
import { ExerciseSelectionError } from "../models/ExerciseSelectionError";
import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { SelectionConstraint } from "../models/SelectionConstraint";
import type { SelectionContext } from "../models/SelectionContext";
import {
  mapFocusToMovementPatterns,
  mapPriorityToGoalCodes,
} from "./mapFocusToMovementPatterns";

export const DEFAULT_MAX_CANDIDATES_PER_ROLE = 3;

/**
 * Build an immutable SelectionContext from a selection request.
 */
export function buildSelectionContext(
  request: ExerciseSelectionRequest,
): SelectionContext {
  const day = resolveTargetDay(request.blueprint, request.dayId);
  if (day.isRestDay) {
    throw new ExerciseSelectionError(
      "rest_day_selected",
      `Cannot select exercises for rest day: ${day.id}`,
      { dayId: day.id, blueprintId: request.blueprint.id },
    );
  }

  const required = mapFocusToMovementPatterns(day.focus.primary);
  const secondary = day.focus.secondary
    ? mapFocusToMovementPatterns(day.focus.secondary)
    : Object.freeze([] as const);

  const constraints = Object.freeze(
    request.blueprint.constraints.map(
      (constraint): SelectionConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "blueprint" as const,
        }),
    ),
  );

  const maxCandidates =
    typeof request.maxCandidatesPerRole === "number" &&
    Number.isInteger(request.maxCandidatesPerRole) &&
    request.maxCandidatesPerRole > 0
      ? request.maxCandidatesPerRole
      : DEFAULT_MAX_CANDIDATES_PER_ROLE;

  return Object.freeze({
    blueprintId: request.blueprint.id,
    dayId: day.id,
    dayIndex: day.dayIndex,
    focus: Object.freeze({ ...day.focus }),
    sessionGoal: day.sessionGoal,
    priority: Object.freeze({ ...request.blueprint.priority }),
    requiredMovementPatterns: required,
    secondaryMovementPatterns: secondary,
    availableEquipment: request.availableEquipment
      ? Object.freeze([...request.availableEquipment])
      : null,
    maxDifficulty: request.maxDifficulty ?? null,
    constraints,
    excludedExerciseIds: Object.freeze([
      ...(request.excludedExerciseIds ?? []),
    ]),
    maxCandidatesPerRole: maxCandidates,
    goalCodes: mapPriorityToGoalCodes(
      request.blueprint.priority.primary,
      request.blueprint.priority.secondary,
    ),
  });
}

function resolveTargetDay(
  blueprint: WorkoutBlueprint,
  dayId?: string,
): WorkoutDayBlueprint {
  if (dayId) {
    const match = blueprint.days.find((day) => day.id === dayId);
    if (!match) {
      throw new ExerciseSelectionError(
        "day_not_found",
        `Workout day not found on blueprint: ${dayId}`,
        { dayId, blueprintId: blueprint.id },
      );
    }
    return match;
  }

  const firstTrainingDay = blueprint.days.find((day) => !day.isRestDay);
  if (!firstTrainingDay) {
    throw new ExerciseSelectionError(
      "no_training_day",
      `Blueprint has no training days: ${blueprint.id}`,
      { blueprintId: blueprint.id },
    );
  }
  return firstTrainingDay;
}
