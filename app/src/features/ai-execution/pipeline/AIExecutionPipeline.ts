import type { IAIProviderRegistry } from "../../ai-provider/contracts/IAIProviderRegistry";
import { createAIProviderRegistry } from "../../ai-provider/registry/AIProviderRegistry";
import type { IAIProviderExecutorResolver } from "../contracts/IAIProviderExecutor";
import { AIExecutionResultBuilder } from "../builders/AIExecutionResultBuilder";
import {
  AIExecutionError,
  toErrorSnapshot,
} from "../models/AIExecutionError";
import { EMPTY_LIFECYCLE } from "../models/AIExecutionLifecycle";
import { EMPTY_EXECUTION_METRICS } from "../models/AIExecutionMetrics";
import type { AIExecutionRequest } from "../models/AIExecutionRequest";
import type { AIExecutionResult } from "../models/AIExecutionResult";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { createEmptyTrace } from "../models/AIExecutionTrace";
import {
  createContextStage,
  createExecutionStage,
  createLifecycleStage,
  createProviderResolutionStage,
  createResultStage,
  createValidationStage,
  type AIExecutionStageHandler,
  type PipelineWorkingState,
  type StageDependencies,
} from "../stages";
import { createTraceStep, appendTraceStep } from "../utils/buildTrace";
import { freezeLifecycle, freezeResult } from "../utils/freezeObjects";
import { summarizeExecution } from "../utils/summarizeExecution";

export interface AIExecutionPipelineDeps {
  readonly registry?: IAIProviderRegistry;
  readonly executorResolver: IAIProviderExecutorResolver;
  readonly stages?: readonly AIExecutionStageHandler[];
  readonly clock?: () => string;
}

/**
 * AI Execution Pipeline — provider-agnostic orchestration.
 *
 * Validate → Context → Provider Resolution → Execute → Result → Lifecycle
 *
 * No business logic. No provider-specific code. No streaming. No HTTP.
 */
export class AIExecutionPipeline {
  private readonly registry: IAIProviderRegistry;
  private readonly executorResolver: IAIProviderExecutorResolver;
  private readonly stages: readonly AIExecutionStageHandler[];
  private readonly clock: () => string;

  constructor(deps: AIExecutionPipelineDeps) {
    this.registry = deps.registry ?? createAIProviderRegistry();
    this.executorResolver = deps.executorResolver;
    this.stages =
      deps.stages ??
      Object.freeze([
        createValidationStage(),
        createContextStage(),
        createProviderResolutionStage(),
        createExecutionStage(),
        createResultStage(),
        createLifecycleStage(),
      ]);
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  getRegistry(): IAIProviderRegistry {
    return this.registry;
  }

  getExecutorResolver(): IAIProviderExecutorResolver {
    return this.executorResolver;
  }

  /**
   * Run the full execution pipeline for a request.
   */
  async execute(request: AIExecutionRequest): Promise<AIExecutionResult> {
    const startedAt = this.clock();
    const executionId = `ai-exec:${request.id}`;

    let state: PipelineWorkingState = {
      request,
      context: null,
      provider: null,
      executor: null,
      response: null,
      result: null,
      trace: createEmptyTrace(executionId),
      lifecycle: freezeLifecycle({
        ...EMPTY_LIFECYCLE,
        status: AIExecutionStatuses.PENDING,
        startedAt,
      }),
      metrics: {
        ...EMPTY_EXECUTION_METRICS,
        attemptCount: 0,
      },
      validationIssues: [],
      error: null,
      startedAt,
      now: startedAt,
      stageStartedAt: {},
    };

    const deps: StageDependencies = {
      registry: this.registry,
      executorResolver: this.executorResolver,
    };

    try {
      for (const stage of this.stages) {
        state = {
          ...state,
          now: this.clock(),
        };
        state = await Promise.resolve(stage.run(state, deps));
      }

      if (!state.result) {
        throw new AIExecutionError(
          "execution_result_missing",
          "Pipeline completed without a result",
          { stage: AIExecutionStages.RESULT, providerId: request.providerId },
        );
      }

      return state.result;
    } catch (error) {
      return this.buildFailureResult(state, error, this.clock());
    }
  }

  private buildFailureResult(
    state: PipelineWorkingState,
    error: unknown,
    completedAt: string,
  ): AIExecutionResult {
    const executionError =
      error instanceof AIExecutionError
        ? error
        : new AIExecutionError(
            "pipeline_failed",
            error instanceof Error ? error.message : "Pipeline failed",
            {
              stage: state.lifecycle.currentStage,
              providerId: state.request.providerId,
            },
          );

    const snapshot = toErrorSnapshot(executionError);
    const status =
      executionError.code === "execution_cancelled"
        ? AIExecutionStatuses.CANCELLED
        : executionError.code === "execution_timed_out"
          ? AIExecutionStatuses.TIMED_OUT
          : AIExecutionStatuses.FAILED;

    const stage = executionError.stage ?? state.lifecycle.currentStage;
    let trace = state.trace;
    if (stage && !trace.steps.some((step) => step.stage === stage && step.status === status)) {
      trace = appendTraceStep(
        trace,
        createTraceStep({
          stage,
          status,
          startedAt: state.stageStartedAt[stage] ?? state.now,
          completedAt,
          durationMs: 0,
          validationIssues: Array.isArray(executionError.details.issues)
            ? (executionError.details.issues as string[])
            : [],
          message: executionError.message,
        }),
      );
    }

    const lifecycle = freezeLifecycle({
      ...state.lifecycle,
      status,
      currentStage: stage,
      completedAt,
      startedAt: state.startedAt,
    });

    const contextId = state.context?.id ?? `ai-exec-ctx:${state.request.id}`;
    const executionId = `ai-exec:${state.request.id}`;

    let result = new AIExecutionResultBuilder()
      .withId(executionId)
      .withRequestId(state.request.id)
      .withContextId(contextId)
      .withProviderId(state.request.providerId)
      .withStatus(status)
      .withResponse(null)
      .withError(snapshot)
      .withMetrics({
        ...state.metrics,
        durationMs: state.metrics.providerLatencyMs,
        attemptCount: Math.max(1, state.metrics.attemptCount),
      })
      .withTrace(trace)
      .withLifecycle(lifecycle)
      .withMetadata(state.request.metadata)
      .withCompletedAt(completedAt)
      .withValidationIssues(
        Object.freeze([
          ...state.validationIssues,
          ...(Array.isArray(executionError.details.issues)
            ? (executionError.details.issues as string[])
            : []),
        ]),
      )
      .build();

    result = freezeResult({
      ...result,
      summary: summarizeExecution(result),
    });

    return result;
  }
}

export function createAIExecutionPipeline(
  deps: AIExecutionPipelineDeps,
): AIExecutionPipeline {
  return new AIExecutionPipeline(deps);
}
