import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../../tool-calling/models/ToolExecutionMetadata";
import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import type { ToolDispatcher } from "../dispatch/ToolDispatcher";
import type { DispatchContext } from "../dispatch/DispatchContext";
import type { ToolDispatchResult } from "../models/ToolDispatchResult";
import type { ToolExecutionRequest } from "../models/ToolExecutionRequest";
import type { ToolPipelineResult } from "../models/ToolPipelineResult";
import type { ToolResult } from "../models/ToolResult";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";
import { ToolFailureCodes } from "../models/ToolFailure";
import type { FailurePolicy } from "../policies/FailurePolicy";
import { DefaultFailurePolicy } from "../policies/FailurePolicy";
import type { ExecutionContextManager } from "../runtime/ExecutionContextManager";
import type { ExecutionScheduler } from "../runtime/ExecutionScheduler";
import {
  freezePipelineResult,
  freezeToolResult,
} from "../utils/freezeExecution";
import { derivePlanStatus } from "../utils/pipelineHelpers";

export interface ExecutionPipelineDeps {
  readonly dispatcher: ToolDispatcher;
  readonly scheduler: ExecutionScheduler;
  readonly contextManager: ExecutionContextManager;
  readonly failurePolicy?: FailurePolicy;
  readonly clock?: () => string;
  readonly nowMs?: () => number;
}

/**
 * Execution Pipeline — resolve order → dispatch → aggregate.
 * Orchestration only. Domain logic stays in adapters.
 */
export class ExecutionPipeline {
  readonly id = "pipeline:default";

  private readonly dispatcher: ToolDispatcher;
  private readonly scheduler: ExecutionScheduler;
  private readonly contextManager: ExecutionContextManager;
  private readonly failurePolicy: FailurePolicy;
  private readonly clock: () => string;
  private readonly nowMs: () => number;

  constructor(deps: ExecutionPipelineDeps) {
    this.dispatcher = deps.dispatcher;
    this.scheduler = deps.scheduler;
    this.contextManager = deps.contextManager;
    this.failurePolicy = deps.failurePolicy ?? new DefaultFailurePolicy();
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
  }

  async run(request: ToolExecutionRequest): Promise<ToolPipelineResult> {
    const startedAt = this.clock();
    const startedMs = this.nowMs();
    const dispatchResults: ToolDispatchResult[] = [];
    const results: ToolResult[] = [];
    const completed = new Set<string>();
    const failed = new Set<string>();
    const skipped = new Set<string>();
    let aborted = false;

    let state = this.contextManager.createInitialState({
      id: `state:${request.id}`,
      updatedAt: startedAt,
    });

    const scheduled = this.scheduler.schedule(request.plan);

    for (const step of scheduled) {
      if (aborted) {
        const skippedResult = freezeToolResult({
          kind: "skipped",
          success: null,
          failure: null,
          stepId: step.id,
          reason: "aborted_after_failure",
        });
        results.push(skippedResult);
        skipped.add(step.id);
        state = this.contextManager.withStepSkipped(
          state,
          step.id,
          this.clock(),
        );
        continue;
      }

      const depsFailed = step.dependsOn.some((d) => failed.has(d));
      const depsSkipped = step.dependsOn.some((d) => skipped.has(d));
      if (depsFailed || depsSkipped) {
        const skippedResult = freezeToolResult({
          kind: "skipped",
          success: null,
          failure: null,
          stepId: step.id,
          reason: ToolFailureCodes.DEPENDENCY_BLOCKED,
        });
        results.push(skippedResult);
        skipped.add(step.id);
        state = this.contextManager.withStepSkipped(
          state,
          step.id,
          this.clock(),
        );
        continue;
      }

      if (step.toolId == null || step.adapterId == null) {
        const skippedResult = freezeToolResult({
          kind: "skipped",
          success: null,
          failure: null,
          stepId: step.id,
          reason:
            step.toolId == null
              ? ToolFailureCodes.TOOL_UNRESOLVED
              : ToolFailureCodes.ADAPTER_UNAVAILABLE,
        });
        results.push(skippedResult);
        skipped.add(step.id);
        state = this.contextManager.withStepSkipped(
          state,
          step.id,
          this.clock(),
        );
        continue;
      }

      state = this.contextManager.withRunning(state, step.id, this.clock());

      const dispatchContext: DispatchContext = Object.freeze({
        requestId: request.id,
        executionContext: request.context,
        step,
        attempt: 0,
        createdAt: this.clock(),
      });

      const dispatchResult = await this.dispatcher.dispatch(
        dispatchContext,
        (adapter) => this.buildToolCallRequest(request, step.id, adapter),
      );
      dispatchResults.push(dispatchResult);

      if (dispatchResult.result) {
        results.push(dispatchResult.result);
        if (dispatchResult.result.kind === "success") {
          completed.add(step.id);
          state = this.contextManager.withStepCompleted(
            state,
            step.id,
            this.clock(),
          );
        } else if (dispatchResult.result.kind === "failure") {
          failed.add(step.id);
          state = this.contextManager.withStepFailed(
            state,
            step.id,
            this.clock(),
            dispatchResult.result.failure.message,
          );
          const action = this.failurePolicy.onFailure(dispatchResult.result);
          if (action === "abort") aborted = true;
        } else {
          skipped.add(step.id);
          state = this.contextManager.withStepSkipped(
            state,
            step.id,
            this.clock(),
          );
        }
      }
    }

    void state;
    const completedAt = this.clock();
    const status = derivePlanStatus(
      completed.size,
      failed.size,
      skipped.size,
      request.plan.steps.length,
    );

    return freezePipelineResult({
      id: `pipeline-result:${request.id}`,
      requestId: request.id,
      status:
        status === ToolExecutionStatuses.PENDING
          ? ToolExecutionStatuses.SUCCEEDED
          : status,
      dispatchResults: Object.freeze(dispatchResults),
      results: Object.freeze(results),
      startedAt,
      completedAt,
    });
  }

  private buildToolCallRequest(
    request: ToolExecutionRequest,
    stepId: string,
    _adapter: IDomainToolAdapter,
  ): ToolCallRequest {
    const step = request.plan.steps.find((s) => s.id === stepId)!;
    const parameters: Record<string, unknown> = {};
    for (const arg of step.sourceStep.arguments) {
      parameters[arg.name] = arg.value;
    }
    if (step.sourceStep.target?.resourceId) {
      parameters.resourceId = step.sourceStep.target.resourceId;
    }
    // Provide common domain-tool parameters from context when missing
    if (request.context.athleteId && parameters.athleteId == null) {
      parameters.athleteId = request.context.athleteId;
    }

    const createdAt = this.clock();
    return Object.freeze({
      id: `tool-req:${request.id}:${stepId}`,
      call: Object.freeze({
        id: `call:${stepId}`,
        toolId: step.toolId!,
        input: Object.freeze({
          parameters: Object.freeze(parameters),
        }),
        createdAt,
      }),
      context: Object.freeze({
        conversationId: request.context.conversationId,
        athleteId: request.context.athleteId,
        streamId: null,
        executionRequestId: request.id,
        now: createdAt,
        attributes: Object.freeze({
          ...request.context.attributes,
          actionStepId: step.actionStepId,
          executionStepId: step.id,
        }),
      }),
      metadata: EMPTY_TOOL_EXECUTION_METADATA,
      createdAt,
    });
  }
}
