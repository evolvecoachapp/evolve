import type { ToolDispatchResult } from "../models/ToolDispatchResult";
import type { ToolExecutionRequest } from "../models/ToolExecutionRequest";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolPipelineResult } from "../models/ToolPipelineResult";
import type { ToolResult } from "../models/ToolResult";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";
import { derivePlanStatus } from "../utils/pipelineHelpers";
import { freezeExecutionResult } from "../utils/freezeExecution";

/**
 * Coordinates aggregation of pipeline outputs into ToolExecutionResult.
 * No domain logic.
 */
export class ExecutionCoordinator {
  readonly id = "runtime:coordinator";

  aggregate(options: {
    readonly request: ToolExecutionRequest;
    readonly pipelineResult: ToolPipelineResult;
    readonly startedAt: string;
    readonly completedAt: string;
    readonly durationMs: number | null;
  }): ToolExecutionResult {
    const { request, pipelineResult, startedAt, completedAt, durationMs } =
      options;
    const results = pipelineResult.results;
    const completedStepIds = results
      .filter((r) => r.kind === "success")
      .map((r) => r.success!.stepId);
    const failedStepIds = results
      .filter((r) => r.kind === "failure")
      .map((r) => r.failure!.stepId);
    const skippedStepIds = results
      .filter((r) => r.kind === "skipped")
      .map((r) => r.stepId);

    const status = derivePlanStatus(
      completedStepIds.length,
      failedStepIds.length,
      skippedStepIds.length,
      request.plan.steps.length,
    );

    return freezeExecutionResult({
      id: `result:${request.id}`,
      requestId: request.id,
      planId: request.plan.id,
      actionPlanId: request.plan.actionPlanId,
      success:
        failedStepIds.length === 0 &&
        (completedStepIds.length > 0 || request.plan.steps.length === 0),
      status,
      results,
      completedStepIds: Object.freeze(completedStepIds),
      failedStepIds: Object.freeze(failedStepIds),
      skippedStepIds: Object.freeze(skippedStepIds),
      message:
        failedStepIds.length > 0
          ? `Failed ${failedStepIds.length} step(s)`
          : status === ToolExecutionStatuses.SKIPPED
            ? "No steps to execute"
            : null,
      startedAt,
      completedAt,
      durationMs,
    });
  }

  collectResults(
    dispatchResults: readonly ToolDispatchResult[],
  ): readonly ToolResult[] {
    return Object.freeze(
      dispatchResults
        .map((d) => d.result)
        .filter((r): r is ToolResult => r != null),
    );
  }
}
