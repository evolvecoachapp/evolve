import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { WorkoutDayBlueprint } from "../../workout-blueprint/models/WorkoutDayBlueprint";
import type { AdaptationContext } from "../models/AdaptationContext";
import { TrainingAdaptationError } from "../models/TrainingAdaptationError";
import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import type { TrainingConstraint } from "../models/TrainingConstraint";

/**
 * Build an immutable AdaptationContext from a training adaptation request.
 */
export function buildAdaptationContext(
  request: TrainingAdaptationRequest,
): AdaptationContext {
  const dayId = request.progression.context.dayId;
  const day = resolveTargetDay(request.blueprint, dayId);

  if (request.progression.context.blueprintId !== request.blueprint.id) {
    throw new TrainingAdaptationError(
      "blueprint_progression_mismatch",
      `Progression blueprintId does not match request blueprint: ${request.progression.context.blueprintId}`,
      {
        progressionBlueprintId: request.progression.context.blueprintId,
        requestBlueprintId: request.blueprint.id,
      },
    );
  }

  const constraints = Object.freeze([
    ...request.blueprint.constraints.map(
      (constraint): TrainingConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "blueprint" as const,
        }),
    ),
    ...request.progression.context.constraints.map(
      (constraint): TrainingConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "progression" as const,
        }),
    ),
  ]);

  const volumeSets = request.progression.timeline.map(
    (step) => step.target.volumeSets,
  );
  const averageVolumeSets =
    volumeSets.length === 0
      ? 0
      : round3(
          volumeSets.reduce((sum, value) => sum + value, 0) / volumeSets.length,
        );

  const intensityValues = request.progression.timeline
    .map((step) => step.target.intensityValue)
    .filter((value): value is number => value !== null);
  const peakIntensityValue =
    intensityValues.length === 0 ? 0 : Math.max(...intensityValues);

  return Object.freeze({
    blueprintId: request.blueprint.id,
    progressionRequestId: request.progression.requestId,
    dayId: day.id,
    dayIndex: day.dayIndex,
    focus: Object.freeze({ ...day.focus }),
    sessionGoal: day.sessionGoal,
    priority: Object.freeze({ ...request.blueprint.priority }),
    weekCount: request.progression.context.window.weekCount,
    prescriptionCount: request.progression.exerciseProgressions.length,
    weeklyFrequency: request.blueprint.weeklyFrequency,
    constraints,
    progressionScoreTotal: request.progression.score.total,
    averageVolumeSets,
    peakIntensityValue: round3(peakIntensityValue),
    includeExplanations: request.includeExplanations !== false,
  });
}

function resolveTargetDay(
  blueprint: WorkoutBlueprint,
  dayId: string,
): WorkoutDayBlueprint {
  const match = blueprint.days.find((day) => day.id === dayId);
  if (!match) {
    throw new TrainingAdaptationError(
      "day_not_found",
      `Workout day not found on blueprint: ${dayId}`,
      { dayId, blueprintId: blueprint.id },
    );
  }
  return match;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
