import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import {
  countDependencies,
  hasCircularDependencies,
} from "./dependencyHelpers";

/**
 * Estimated execution metrics without invoking adapters.
 */
export interface ExecutionMetrics {
  readonly stepCount: number;
  readonly resolvedCount: number;
  readonly unresolvedCount: number;
  readonly dependencyCount: number;
  readonly hasCycles: boolean;
  readonly estimatedUnits: number;
}

export function computeExecutionMetrics(
  plan: ToolExecutionPlan,
): ExecutionMetrics {
  const resolvedCount = plan.steps.filter((s) => s.adapterId != null).length;
  const unresolvedCount = plan.steps.length - resolvedCount;
  const dependencyCount = countDependencies(plan);
  return Object.freeze({
    stepCount: plan.steps.length,
    resolvedCount,
    unresolvedCount,
    dependencyCount,
    hasCycles: hasCircularDependencies(plan.steps),
    estimatedUnits: plan.steps.length + dependencyCount,
  });
}

export function measureResultDuration(
  result: ToolExecutionResult,
): number | null {
  return result.durationMs;
}
