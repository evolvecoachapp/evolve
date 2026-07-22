import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { WorkoutDayBlueprint } from "../../workout-blueprint/models/WorkoutDayBlueprint";
import type { ProgressionConstraint } from "../models/ProgressionConstraint";
import type { ProgressionContext } from "../models/ProgressionContext";
import { ProgressionError } from "../models/ProgressionError";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import {
  createDefaultProgressionWindow,
  DEFAULT_PROGRESSION_WEEK_COUNT,
} from "../models/ProgressionWindow";

/**
 * Build an immutable ProgressionContext from a progression request.
 */
export function buildProgressionContext(
  request: ProgressionRequest,
): ProgressionContext {
  const dayId = request.programming.context.dayId;
  const day = resolveTargetDay(request.blueprint, dayId);

  if (day.isRestDay) {
    throw new ProgressionError(
      "rest_day_selected",
      `Cannot progress exercises for rest day: ${day.id}`,
      { dayId: day.id, blueprintId: request.blueprint.id },
    );
  }

  if (request.programming.context.blueprintId !== request.blueprint.id) {
    throw new ProgressionError(
      "blueprint_programming_mismatch",
      `Programming blueprintId does not match request blueprint: ${request.programming.context.blueprintId}`,
      {
        programmingBlueprintId: request.programming.context.blueprintId,
        requestBlueprintId: request.blueprint.id,
      },
    );
  }

  const window =
    request.window ??
    createDefaultProgressionWindow(resolveWeekCount(request.blueprint));

  if (window.startWeek < 1) {
    throw new ProgressionError(
      "invalid_window_start",
      `Progression window startWeek must be >= 1`,
      { startWeek: window.startWeek },
    );
  }

  if (window.weekCount < 1) {
    throw new ProgressionError(
      "invalid_window_count",
      `Progression window weekCount must be >= 1`,
      { weekCount: window.weekCount },
    );
  }

  const constraints = Object.freeze([
    ...request.blueprint.constraints.map(
      (constraint): ProgressionConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "blueprint" as const,
        }),
    ),
    ...request.programming.context.constraints.map(
      (constraint): ProgressionConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "programming" as const,
        }),
    ),
  ]);

  return Object.freeze({
    blueprintId: request.blueprint.id,
    programmingRequestId: request.programming.requestId,
    dayId: day.id,
    dayIndex: day.dayIndex,
    focus: Object.freeze({ ...day.focus }),
    sessionGoal: day.sessionGoal,
    priority: Object.freeze({ ...request.blueprint.priority }),
    window: Object.freeze({ ...window }),
    prescriptionCount: request.programming.prescriptions.length,
    weeklyFrequency: request.blueprint.weeklyFrequency,
    constraints,
    includeExplanations: request.includeExplanations !== false,
  });
}

function resolveWeekCount(blueprint: WorkoutBlueprint): number {
  const firstBlock = blueprint.blocks[0];
  if (firstBlock && firstBlock.weekCount > 0) {
    return firstBlock.weekCount;
  }
  return DEFAULT_PROGRESSION_WEEK_COUNT;
}

function resolveTargetDay(
  blueprint: WorkoutBlueprint,
  dayId: string,
): WorkoutDayBlueprint {
  const match = blueprint.days.find((day) => day.id === dayId);
  if (!match) {
    throw new ProgressionError(
      "day_not_found",
      `Workout day not found on blueprint: ${dayId}`,
      { dayId, blueprintId: blueprint.id },
    );
  }
  return match;
}
