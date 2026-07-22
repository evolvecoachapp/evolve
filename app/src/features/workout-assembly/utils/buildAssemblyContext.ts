import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { WorkoutDayBlueprint } from "../../workout-blueprint/models/WorkoutDayBlueprint";
import type { WorkoutAssemblyConstraint } from "../models/WorkoutAssemblyConstraint";
import type { WorkoutAssemblyContext } from "../models/WorkoutAssemblyContext";
import { WorkoutAssemblyError } from "../models/WorkoutAssemblyError";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";

/**
 * Build an immutable WorkoutAssemblyContext from a full pipeline request.
 */
export function buildAssemblyContext(
  request: WorkoutAssemblyRequest,
): WorkoutAssemblyContext {
  assertPipelineAlignment(request);

  const weekNumber = resolveWeekNumber(request);
  const dayId = request.programming.context.dayId;
  const day = resolveTargetDay(request.blueprint, dayId);

  const constraints = Object.freeze([
    ...request.blueprint.constraints.map(
      (constraint): WorkoutAssemblyConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "blueprint" as const,
        }),
    ),
    ...request.programming.context.constraints.map(
      (constraint): WorkoutAssemblyConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "programming" as const,
        }),
    ),
    ...request.progression.context.constraints.map(
      (constraint): WorkoutAssemblyConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "progression" as const,
        }),
    ),
    ...request.adaptation.context.constraints.map(
      (constraint): WorkoutAssemblyConstraint =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "adaptation" as const,
        }),
    ),
  ]);

  return Object.freeze({
    blueprintId: request.blueprint.id,
    dayId: day.id,
    dayIndex: day.dayIndex,
    weekNumber,
    selectionRequestId: request.selection.requestId,
    programmingRequestId: request.programming.requestId,
    progressionRequestId: request.progression.requestId,
    adaptationRequestId: request.adaptation.requestId,
    focus: Object.freeze({ ...day.focus }),
    sessionGoal: day.sessionGoal,
    priority: Object.freeze({ ...request.blueprint.priority }),
    prescriptionCount: request.programming.prescriptions.length,
    recommendationCount: request.adaptation.recommendations.length,
    readinessScore: request.adaptation.readiness.overallScore,
    weeklyFrequency: request.blueprint.weeklyFrequency,
    constraints,
    includeExplanations: request.includeExplanations !== false,
  });
}

export function resolveWeekNumber(request: WorkoutAssemblyRequest): number {
  const window = request.progression.context.window;
  const requested = request.weekNumber ?? window.startWeek;
  if (requested < window.startWeek || requested > window.startWeek + window.weekCount - 1) {
    throw new WorkoutAssemblyError(
      "week_out_of_range",
      `Week ${requested} is outside progression window ${window.startWeek}–${window.startWeek + window.weekCount - 1}`,
      {
        weekNumber: requested,
        startWeek: window.startWeek,
        weekCount: window.weekCount,
      },
    );
  }
  return requested;
}

function assertPipelineAlignment(request: WorkoutAssemblyRequest): void {
  const blueprintId = request.blueprint.id;

  if (request.selection.context.blueprintId !== blueprintId) {
    throw new WorkoutAssemblyError(
      "blueprint_selection_mismatch",
      `Selection blueprintId does not match request blueprint: ${request.selection.context.blueprintId}`,
      {
        selectionBlueprintId: request.selection.context.blueprintId,
        requestBlueprintId: blueprintId,
      },
    );
  }

  if (request.programming.context.blueprintId !== blueprintId) {
    throw new WorkoutAssemblyError(
      "blueprint_programming_mismatch",
      `Programming blueprintId does not match request blueprint: ${request.programming.context.blueprintId}`,
      {
        programmingBlueprintId: request.programming.context.blueprintId,
        requestBlueprintId: blueprintId,
      },
    );
  }

  if (request.progression.context.blueprintId !== blueprintId) {
    throw new WorkoutAssemblyError(
      "blueprint_progression_mismatch",
      `Progression blueprintId does not match request blueprint: ${request.progression.context.blueprintId}`,
      {
        progressionBlueprintId: request.progression.context.blueprintId,
        requestBlueprintId: blueprintId,
      },
    );
  }

  if (request.adaptation.context.blueprintId !== blueprintId) {
    throw new WorkoutAssemblyError(
      "blueprint_adaptation_mismatch",
      `Adaptation blueprintId does not match request blueprint: ${request.adaptation.context.blueprintId}`,
      {
        adaptationBlueprintId: request.adaptation.context.blueprintId,
        requestBlueprintId: blueprintId,
      },
    );
  }

  const dayId = request.programming.context.dayId;
  if (
    request.selection.context.dayId !== dayId ||
    request.progression.context.dayId !== dayId ||
    request.adaptation.context.dayId !== dayId
  ) {
    throw new WorkoutAssemblyError(
      "day_mismatch",
      "Pipeline dayIds are not aligned across selection/programming/progression/adaptation",
      {
        selectionDayId: request.selection.context.dayId,
        programmingDayId: request.programming.context.dayId,
        progressionDayId: request.progression.context.dayId,
        adaptationDayId: request.adaptation.context.dayId,
      },
    );
  }

  if (
    request.adaptation.adaptedProgression.sourcePlanRequestId !==
    request.progression.requestId
  ) {
    throw new WorkoutAssemblyError(
      "adaptation_progression_mismatch",
      "Adaptation result does not reference the provided progression plan",
      {
        adaptedSourcePlanRequestId:
          request.adaptation.adaptedProgression.sourcePlanRequestId,
        progressionRequestId: request.progression.requestId,
      },
    );
  }
}

function resolveTargetDay(
  blueprint: WorkoutBlueprint,
  dayId: string,
): WorkoutDayBlueprint {
  const match = blueprint.days.find((day) => day.id === dayId);
  if (!match) {
    throw new WorkoutAssemblyError(
      "day_not_found",
      `Workout day not found on blueprint: ${dayId}`,
      { dayId, blueprintId: blueprint.id },
    );
  }
  return match;
}
