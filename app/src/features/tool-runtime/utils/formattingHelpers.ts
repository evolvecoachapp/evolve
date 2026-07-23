import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";
import type { ToolRuntime } from "../models/ToolRuntime";

export function formatStepLabel(step: ToolExecutionStep): string {
  const tool = step.toolId ?? "unresolved";
  const adapter = step.adapterId ?? "none";
  return `${step.order}. [${step.actionType}] ${step.label} → ${tool} (${adapter})`;
}

export function describeExecutionPlan(
  plan: ToolExecutionPlan,
): readonly string[] {
  return Object.freeze(plan.steps.map(formatStepLabel));
}

export function describeRuntime(runtime: ToolRuntime): string {
  return `${runtime.name}@${runtime.version} [${runtime.id}] strategy=${runtime.strategyId} pipeline=${runtime.pipelineId}`;
}

export function describeExecutionResult(
  result: ToolExecutionResult,
): string {
  return `result=${result.id} status=${result.status} ok=${result.success} succeeded=${result.completedStepIds.length} failed=${result.failedStepIds.length} skipped=${result.skippedStepIds.length}`;
}
