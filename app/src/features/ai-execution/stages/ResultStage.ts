import { AIExecutionResultBuilder } from "../builders/AIExecutionResultBuilder";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import {
  freezeLifecycle,
  freezeMetrics,
  freezeResult,
} from "../utils/freezeObjects";
import { summarizeExecution } from "../utils/summarizeExecution";
import { validateExecutionResult } from "../validators/validateExecutionResult";
import { validatePipelineIntegrity } from "../validators/validatePipelineIntegrity";
import type { AIExecutionStageHandler, PipelineWorkingState } from "./types";

/**
 * Build the immutable execution result from working state.
 */
export class ResultStage implements AIExecutionStageHandler {
  readonly name = AIExecutionStages.RESULT;

  run(state: PipelineWorkingState): PipelineWorkingState {
    const startedAt = state.now;
    const contextId = state.context?.id ?? `ai-exec-ctx:${state.request.id}`;
    const executionId = `ai-exec:${state.request.id}`;

    const durationMs =
      state.metrics.providerLatencyMs !== null
        ? state.metrics.providerLatencyMs
        : 0;

    const metrics = freezeMetrics({
      ...state.metrics,
      durationMs,
      attemptCount: Math.max(1, state.metrics.attemptCount),
      stageDurationsMs: Object.freeze({
        ...state.metrics.stageDurationsMs,
        [this.name]: 0,
      }),
    });

    const lifecycle = freezeLifecycle({
      ...state.lifecycle,
      status: AIExecutionStatuses.BUILDING_RESULT,
      currentStage: this.name,
      completedStages: Object.freeze([
        ...state.lifecycle.completedStages,
        this.name,
      ]),
    });

    const preResultTrace = appendTraceStep(
      state.trace,
      createTraceStep({
        stage: this.name,
        status: AIExecutionStatuses.SUCCEEDED,
        startedAt,
        completedAt: state.now,
        durationMs: 0,
        message: "result_built",
      }),
    );

    const status =
      state.response !== null
        ? AIExecutionStatuses.SUCCEEDED
        : AIExecutionStatuses.FAILED;

    let result = new AIExecutionResultBuilder()
      .withId(executionId)
      .withRequestId(state.request.id)
      .withContextId(contextId)
      .withProviderId(state.request.providerId)
      .withStatus(status)
      .withResponse(state.response)
      .withError(state.error)
      .withMetrics(metrics)
      .withTrace(preResultTrace)
      .withLifecycle(lifecycle)
      .withMetadata(state.request.metadata)
      .withCompletedAt(state.now)
      .withValidationIssues(state.validationIssues)
      .build();

    result = freezeResult({
      ...result,
      summary: summarizeExecution(result),
    });

    const softIssues = [
      ...validateExecutionResult(result),
      ...validatePipelineIntegrity(result.trace),
    ];

    if (softIssues.length > 0) {
      result = freezeResult({
        ...result,
        validationIssues: Object.freeze([
          ...result.validationIssues,
          ...softIssues,
        ]),
      });
    }

    return {
      ...state,
      result,
      metrics,
      lifecycle,
      trace: preResultTrace,
      validationIssues: [...state.validationIssues, ...softIssues],
      stageStartedAt: {
        ...state.stageStartedAt,
        [this.name]: startedAt,
      },
    };
  }
}

export function createResultStage(): ResultStage {
  return new ResultStage();
}
