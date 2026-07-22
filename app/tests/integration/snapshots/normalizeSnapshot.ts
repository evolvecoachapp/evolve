import { PIPELINE_STEP_ORDER } from "../../../src/features/program-generation/models/PipelineStepName";
import type { WorkoutGenerationResult } from "../../../src/features/program-generation/models/WorkoutGenerationResult";
import {
  INTEGRATION_FRAMEWORK_VERSION,
  SNAPSHOT_PLACEHOLDERS,
} from "../shared/constants";
import type { NormalizedWorkoutSnapshot } from "../shared/types";

export interface NormalizeSnapshotOptions {
  readonly scenarioId?: string;
  /** When true, replace id-like fields with placeholders (default true). */
  readonly normalizeIds?: boolean;
}

/**
 * Build a deterministic structural snapshot from a pipeline result.
 * Ignores absolute timestamps and replaces volatile ids when requested.
 */
export function normalizeWorkoutSnapshot(
  result: WorkoutGenerationResult,
  options: NormalizeSnapshotOptions = {},
): NormalizedWorkoutSnapshot {
  const scenarioId = options.scenarioId ?? "anonymous";
  const exerciseIds = result.session.exercises.map((exercise) => exercise.exerciseId);
  const exerciseOrder = result.session.exercises.map((exercise) => exercise.order);

  const snapshot: NormalizedWorkoutSnapshot = {
    frameworkVersion: INTEGRATION_FRAMEWORK_VERSION,
    scenarioId,
    status: result.summary.status,
    completedSteps: [...result.summary.completedSteps],
    failedStep: result.summary.failedStep,
    stepOrder: result.trace.steps.map((step) => step.name),
    validationIssues: [...result.validationIssues].sort(),
    exerciseIds: [...exerciseIds],
    exerciseOrder: [...exerciseOrder],
    prescriptionCount: result.programming.prescriptions.length,
    progressionTimelineCount: result.progression.timeline.length,
    recommendationCount: result.adaptation.recommendations.length,
    sessionExerciseCount: result.session.exercises.length,
    hasProgramming: result.programming.prescriptions.length > 0,
    hasProgression: result.progression.timeline.length > 0,
    hasAdaptation: result.adaptation.readiness != null,
    hasAssembly: result.assembly.session != null,
    hasSession: result.session != null,
    hasTrace: result.trace.steps.length === PIPELINE_STEP_ORDER.length,
    hasSummary: result.summary != null,
    explanationCount: result.explanations.length,
    metrics: {
      stepCount: result.summary.metrics.stepCount,
      succeededStepCount: result.summary.metrics.succeededStepCount,
      failedStepCount: result.summary.metrics.failedStepCount,
    },
  };

  return Object.freeze(deepFreeze(snapshot));
}

/**
 * Normalize a JSON-serializable value by replacing known volatile patterns.
 */
export function normalizeVolatileValues(value: unknown): unknown {
  if (typeof value === "string") {
    return normalizeVolatileString(value);
  }
  if (Array.isArray(value)) {
    return value.map(normalizeVolatileValues);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => [key, normalizeVolatileValues(nested)]);
    return Object.fromEntries(entries);
  }
  return value;
}

function normalizeVolatileString(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return SNAPSHOT_PLACEHOLDERS.timestamp;
  }
  if (value.startsWith("generation:")) {
    return SNAPSHOT_PLACEHOLDERS.generationId;
  }
  if (value.startsWith("conversation:")) {
    return SNAPSHOT_PLACEHOLDERS.conversationId;
  }
  if (value.startsWith("athlete-")) {
    return SNAPSHOT_PLACEHOLDERS.athleteId;
  }
  return value;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value as object)) {
      deepFreeze(nested);
    }
  }
  return value;
}

/**
 * Stable JSON serialization for golden file storage.
 */
export function serializeSnapshot(snapshot: unknown): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export function parseSnapshot<T = unknown>(raw: string): T {
  return JSON.parse(raw) as T;
}
