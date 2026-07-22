import type { AllowedGoalCode } from "../../exercise-kb/models/ExerciseDefinition";
import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { WorkoutDayBlueprint } from "../../workout-blueprint/models/WorkoutDayBlueprint";
import type { ProgrammingConstraint } from "../models/ProgrammingConstraint";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import { ProgrammingError } from "../models/ProgrammingError";
import type { ProgrammingRequest } from "../models/ProgrammingRequest";

/**
 * Build an immutable ProgrammingContext from a programming request.
 */
export function buildProgrammingContext(
  request: ProgrammingRequest,
): ProgrammingContext {
  const dayId = request.dayId ?? request.selection.context.dayId;
  const day = resolveTargetDay(request.blueprint, dayId);

  if (day.isRestDay) {
    throw new ProgrammingError(
      "rest_day_selected",
      `Cannot program exercises for rest day: ${day.id}`,
      { dayId: day.id, blueprintId: request.blueprint.id },
    );
  }

  if (request.selection.context.blueprintId !== request.blueprint.id) {
    throw new ProgrammingError(
      "blueprint_selection_mismatch",
      `Selection blueprintId does not match request blueprint: ${request.selection.context.blueprintId}`,
      {
        selectionBlueprintId: request.selection.context.blueprintId,
        requestBlueprintId: request.blueprint.id,
      },
    );
  }

  if (request.selection.context.dayId !== day.id) {
    throw new ProgrammingError(
      "day_selection_mismatch",
      `Selection dayId does not match programming day: ${request.selection.context.dayId}`,
      {
        selectionDayId: request.selection.context.dayId,
        programmingDayId: day.id,
      },
    );
  }

  const constraints = Object.freeze([
    ...request.blueprint.constraints.map(
      (constraint): ProgrammingConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "blueprint" as const,
        }),
    ),
    ...request.selection.context.constraints.map(
      (constraint): ProgrammingConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "selection" as const,
        }),
    ),
  ]);

  return Object.freeze({
    blueprintId: request.blueprint.id,
    selectionRequestId: request.selection.requestId,
    dayId: day.id,
    dayIndex: day.dayIndex,
    focus: Object.freeze({ ...day.focus }),
    sessionGoal: day.sessionGoal,
    priority: Object.freeze({ ...request.blueprint.priority }),
    goalCodes: Object.freeze([
      ...request.selection.context.goalCodes,
    ]) as readonly AllowedGoalCode[],
    constraints,
    candidateCount: request.selection.candidates.length,
    includeExplanations: request.includeExplanations !== false,
  });
}

function resolveTargetDay(
  blueprint: WorkoutBlueprint,
  dayId: string,
): WorkoutDayBlueprint {
  const match = blueprint.days.find((day) => day.id === dayId);
  if (!match) {
    throw new ProgrammingError(
      "day_not_found",
      `Workout day not found on blueprint: ${dayId}`,
      { dayId, blueprintId: blueprint.id },
    );
  }
  return match;
}
