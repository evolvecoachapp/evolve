import { AIProviderError } from "../../ai-provider/models/AIProviderError";
import { AIExecutionError } from "../models/AIExecutionError";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import { freezeContext, freezeLifecycle, freezeMetrics } from "../utils/freezeObjects";
import { transitionState } from "../utils/normalizeExecutionState";
import type {
  AIExecutionStageHandler,
  PipelineWorkingState,
  StageDependencies,
} from "./types";

/**
 * Execute the resolved provider via the provider-agnostic executor.
 *
 * No HTTP. No provider-specific code. No streaming. No retry algorithm.
 */
export class ExecutionStage implements AIExecutionStageHandler {
  readonly name = AIExecutionStages.EXECUTION;

  async run(
    state: PipelineWorkingState,
    _deps: StageDependencies,
  ): Promise<PipelineWorkingState> {
    const startedAt = state.now;
    const startedMs = Date.now();

    if (!state.executor) {
      throw new AIExecutionError(
        "executor_missing",
        "Provider executor is required before execution",
        {
          stage: this.name,
          providerId: state.request.providerId,
        },
      );
    }

    if (state.request.cancellation.requested) {
      throw new AIExecutionError(
        "execution_cancelled",
        state.request.cancellation.reason ?? "Execution cancelled",
        {
          stage: this.name,
          providerId: state.request.providerId,
          details: {
            token: state.request.cancellation.token,
          },
        },
      );
    }

    try {
      const response = await state.executor.execute({
        promptPackage: state.request.promptPackage,
        modelId: state.request.modelId,
        options: state.request.options,
        requestId: state.request.id,
        executedAt: state.now,
      });

      const providerLatencyMs = Math.max(0, Date.now() - startedMs);

      const context = state.context
        ? freezeContext({
            ...state.context,
            state: transitionState(state.context.state, {
              status: AIExecutionStatuses.EXECUTING,
              stage: this.name,
            }),
          })
        : state.context;

      return {
        ...state,
        response,
        context,
        metrics: freezeMetrics({
          ...state.metrics,
          providerLatencyMs,
          attemptCount: Math.max(1, state.metrics.attemptCount + 1),
          tokenUsage: response.usage
            ? Object.freeze({
                promptTokens: response.usage.promptTokens,
                completionTokens: response.usage.completionTokens,
                totalTokens: response.usage.totalTokens,
              })
            : null,
          stageDurationsMs: Object.freeze({
            ...state.metrics.stageDurationsMs,
            [this.name]: providerLatencyMs,
          }),
        }),
        lifecycle: freezeLifecycle({
          ...state.lifecycle,
          status: AIExecutionStatuses.EXECUTING,
          currentStage: this.name,
          completedStages: Object.freeze([
            ...state.lifecycle.completedStages,
            this.name,
          ]),
        }),
        trace: appendTraceStep(
          state.trace,
          createTraceStep({
            stage: this.name,
            status: AIExecutionStatuses.SUCCEEDED,
            startedAt,
            completedAt: state.now,
            durationMs: providerLatencyMs,
            message: response.id,
          }),
        ),
        stageStartedAt: {
          ...state.stageStartedAt,
          [this.name]: startedAt,
        },
      };
    } catch (error) {
      if (error instanceof AIExecutionError) {
        throw error;
      }

      if (error instanceof AIProviderError) {
        throw new AIExecutionError(error.code, error.message, {
          stage: this.name,
          providerId: error.providerId ?? state.request.providerId,
          details: { source: "ai_provider" },
        });
      }

      const message =
        error instanceof Error ? error.message : "Provider execution failed";
      throw new AIExecutionError("provider_execution_failed", message, {
        stage: this.name,
        providerId: state.request.providerId,
      });
    }
  }
}

export function createExecutionStage(): ExecutionStage {
  return new ExecutionStage();
}
