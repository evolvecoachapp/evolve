import type { ToolDispatchResult } from "../models/ToolDispatchResult";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionRequest } from "../models/ToolExecutionRequest";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolExecutionSnapshot } from "../models/ToolExecutionSnapshot";
import type { ToolExecutionState } from "../models/ToolExecutionState";
import type { ToolExecutionStatistics } from "../models/ToolExecutionStatistics";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";
import type { ToolExecutionSummary } from "../models/ToolExecutionSummary";
import type {
  ToolExecutionValidation,
  ToolExecutionValidationIssue,
} from "../models/ToolExecutionValidation";
import type { ToolFailure } from "../models/ToolFailure";
import type { ToolPipelineResult } from "../models/ToolPipelineResult";
import type { ToolResult } from "../models/ToolResult";
import type { ToolRuntime } from "../models/ToolRuntime";
import type { ToolRuntimePackage } from "../models/ToolRuntimePackage";
import type { ToolSuccess } from "../models/ToolSuccess";

export function freezeMetadata(
  metadata: ToolExecutionMetadata,
): ToolExecutionMetadata {
  return Object.freeze({
    ...metadata,
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeSuccess(success: ToolSuccess): ToolSuccess {
  return Object.freeze({ ...success });
}

export function freezeFailure(failure: ToolFailure): ToolFailure {
  return Object.freeze({ ...failure });
}

export function freezeToolResult(result: ToolResult): ToolResult {
  if (result.kind === "success") {
    return Object.freeze({
      kind: "success" as const,
      success: freezeSuccess(result.success),
      failure: null,
    });
  }
  if (result.kind === "failure") {
    return Object.freeze({
      kind: "failure" as const,
      success: null,
      failure: freezeFailure(result.failure),
    });
  }
  return Object.freeze({
    kind: "skipped" as const,
    success: null,
    failure: null,
    stepId: result.stepId,
    reason: result.reason,
  });
}

export function freezeExecutionStep(
  step: ToolExecutionStep,
): ToolExecutionStep {
  return Object.freeze({
    ...step,
    dependsOn: Object.freeze([...step.dependsOn]),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezeExecutionPlan(
  plan: ToolExecutionPlan,
): ToolExecutionPlan {
  return Object.freeze({
    ...plan,
    steps: Object.freeze(plan.steps.map(freezeExecutionStep)),
    orderedStepIds: Object.freeze([...plan.orderedStepIds]),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeExecutionContext(
  context: ToolExecutionContext,
): ToolExecutionContext {
  return Object.freeze({
    ...context,
    attributes: Object.freeze({ ...context.attributes }),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeExecutionRequest(
  request: ToolExecutionRequest,
): ToolExecutionRequest {
  return Object.freeze({
    ...request,
    plan: freezeExecutionPlan(request.plan),
    context: freezeExecutionContext(request.context),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeExecutionState(
  state: ToolExecutionState,
): ToolExecutionState {
  return Object.freeze({
    ...state,
    completedStepIds: Object.freeze([...state.completedStepIds]),
    failedStepIds: Object.freeze([...state.failedStepIds]),
    skippedStepIds: Object.freeze([...state.skippedStepIds]),
  });
}

export function freezeExecutionSummary(
  summary: ToolExecutionSummary,
): ToolExecutionSummary {
  return Object.freeze({ ...summary });
}

export function freezeExecutionStatistics(
  stats: ToolExecutionStatistics,
): ToolExecutionStatistics {
  return Object.freeze({
    ...stats,
    stepsByStatus: Object.freeze({ ...stats.stepsByStatus }),
    stepsByActionType: Object.freeze({ ...stats.stepsByActionType }),
  });
}

export function freezeValidationIssue(
  issue: ToolExecutionValidationIssue,
): ToolExecutionValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: ToolExecutionValidation,
): ToolExecutionValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeDispatchResult(
  result: ToolDispatchResult,
): ToolDispatchResult {
  return Object.freeze({
    ...result,
    result: result.result ? freezeToolResult(result.result) : null,
  });
}

export function freezePipelineResult(
  result: ToolPipelineResult,
): ToolPipelineResult {
  return Object.freeze({
    ...result,
    dispatchResults: Object.freeze(
      result.dispatchResults.map(freezeDispatchResult),
    ),
    results: Object.freeze(result.results.map(freezeToolResult)),
  });
}

export function freezeExecutionResult(
  result: ToolExecutionResult,
): ToolExecutionResult {
  return Object.freeze({
    ...result,
    results: Object.freeze(result.results.map(freezeToolResult)),
    completedStepIds: Object.freeze([...result.completedStepIds]),
    failedStepIds: Object.freeze([...result.failedStepIds]),
    skippedStepIds: Object.freeze([...result.skippedStepIds]),
  });
}

export function freezeSnapshot(
  snapshot: ToolExecutionSnapshot,
): ToolExecutionSnapshot {
  return Object.freeze({
    ...snapshot,
    plan: freezeExecutionPlan(snapshot.plan),
    summary: freezeExecutionSummary(snapshot.summary),
    statistics: freezeExecutionStatistics(snapshot.statistics),
  });
}

export function freezeRuntime(runtime: ToolRuntime): ToolRuntime {
  return Object.freeze({
    ...runtime,
    adapterIds: Object.freeze([...runtime.adapterIds]),
    policyIds: Object.freeze([...policyIds(runtime)]),
  });
}

function policyIds(runtime: ToolRuntime): readonly string[] {
  return runtime.policyIds;
}

export function freezePackage(
  pkg: ToolRuntimePackage,
): ToolRuntimePackage {
  return Object.freeze({
    ...pkg,
    runtime: freezeRuntime(pkg.runtime),
    plan: freezeExecutionPlan(pkg.plan),
    context: freezeExecutionContext(pkg.context),
    request: pkg.request ? freezeExecutionRequest(pkg.request) : null,
    result: pkg.result ? freezeExecutionResult(pkg.result) : null,
    snapshot: freezeSnapshot(pkg.snapshot),
    validation: freezeValidation(pkg.validation),
  });
}

/** Alias matching sprint utility naming. */
export const FreezeExecution = Object.freeze({
  freezeExecutionPlan,
  freezeExecutionContext,
  freezeExecutionRequest,
  freezeExecutionResult,
  freezeExecutionStep,
  freezePackage,
});
