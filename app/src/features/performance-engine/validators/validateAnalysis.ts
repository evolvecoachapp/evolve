import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import { PerformanceEngineError } from "../models/PerformanceEngineError";
import type { PerformanceMetrics } from "../models/PerformanceMetrics";
import { validateCompletedWorkout } from "./validateCompletedWorkout";
import { validateExecutionData } from "./validateExecutionData";
import { validateMetricConsistency } from "./validateMetricConsistency";

/**
 * Hard-fail validation for analysis inputs.
 * Soft issues (e.g. cancelled workout) are returned; hard failures throw.
 */
export function validateAnalysisInput(
  result: WorkoutResult,
  stream: EventStream,
): readonly string[] {
  if (!result) {
    throw new PerformanceEngineError(
      "invalid_result",
      "WorkoutResult is required",
    );
  }
  if (!stream) {
    throw new PerformanceEngineError(
      "missing_execution_data",
      "EventStream is required",
    );
  }

  const issues = [
    ...validateCompletedWorkout(result),
    ...validateExecutionData(result, stream),
  ];

  const hard = issues.filter(
    (issue) =>
      issue === "missing_runtime_id" ||
      issue === "missing_session_id" ||
      issue === "missing_progress" ||
      issue === "missing_metrics" ||
      issue.startsWith("invalid_final_state:"),
  );

  if (hard.length > 0) {
    throw new PerformanceEngineError(
      "invalid_result",
      "WorkoutResult failed validation",
      hard,
    );
  }

  return Object.freeze(issues);
}

/**
 * Validate computed metrics; throw on negative / NaN / consistency failures.
 */
export function validateComputedMetrics(
  metrics: PerformanceMetrics,
): readonly string[] {
  const issues = validateMetricConsistency(metrics);
  const hard = issues.filter(
    (issue) =>
      issue.startsWith("negative_value:") ||
      issue.startsWith("nan_value:") ||
      issue === "completed_exercises_exceed_total" ||
      issue === "completed_sets_exceed_total",
  );

  if (hard.length > 0) {
    throw new PerformanceEngineError(
      "metric_inconsistency",
      "Computed metrics failed validation",
      hard,
    );
  }

  return Object.freeze(issues);
}

/**
 * Guard against division-by-zero density rates (null is required when duration is 0).
 */
export function validateNoDivisionByZero(
  metrics: PerformanceMetrics,
): readonly string[] {
  const issues: string[] = [];

  if (metrics.density.durationMs <= 0) {
    if (metrics.density.tonnagePerMinute !== null) {
      issues.push("division_by_zero:tonnagePerMinute");
    }
    if (metrics.density.setsPerMinute !== null) {
      issues.push("division_by_zero:setsPerMinute");
    }
    if (metrics.density.repetitionsPerMinute !== null) {
      issues.push("division_by_zero:repetitionsPerMinute");
    }
  }

  if (issues.length > 0) {
    throw new PerformanceEngineError(
      "division_by_zero",
      "Density rates must be null when duration is zero",
      issues,
    );
  }

  return Object.freeze(issues);
}
