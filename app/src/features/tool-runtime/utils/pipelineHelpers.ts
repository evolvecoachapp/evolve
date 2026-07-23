import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolPipelineResult } from "../models/ToolPipelineResult";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";

/**
 * Deterministic pipeline helpers (orchestration only).
 */

export function collectSucceededStepIds(
  result: ToolExecutionResult | ToolPipelineResult,
): readonly string[] {
  if ("completedStepIds" in result) {
    return Object.freeze([...result.completedStepIds]);
  }
  return Object.freeze(
    result.results
      .filter((r) => r.kind === "success")
      .map((r) => r.success!.stepId),
  );
}

export function isTerminalStatus(status: string): boolean {
  return (
    status === ToolExecutionStatuses.SUCCEEDED ||
    status === ToolExecutionStatuses.FAILED ||
    status === ToolExecutionStatuses.CANCELLED ||
    status === ToolExecutionStatuses.SKIPPED
  );
}

export function derivePlanStatus(
  succeeded: number,
  failed: number,
  skipped: number,
  total: number,
): typeof ToolExecutionStatuses[keyof typeof ToolExecutionStatuses] {
  if (total === 0) return ToolExecutionStatuses.SKIPPED;
  if (failed > 0 && succeeded === 0) return ToolExecutionStatuses.FAILED;
  if (failed > 0) return ToolExecutionStatuses.FAILED;
  if (succeeded === total) return ToolExecutionStatuses.SUCCEEDED;
  if (skipped === total) return ToolExecutionStatuses.SKIPPED;
  if (succeeded + skipped === total) return ToolExecutionStatuses.SUCCEEDED;
  return ToolExecutionStatuses.PENDING;
}

export function orderedStepsFromPlan(plan: ToolExecutionPlan) {
  const byId = new Map(plan.steps.map((s) => [s.id, s]));
  return Object.freeze(
    plan.orderedStepIds
      .map((id) => byId.get(id))
      .filter((s): s is NonNullable<typeof s> => s != null),
  );
}
