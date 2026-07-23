import { AIExecutionContextBuilder } from "../builders/AIExecutionContextBuilder";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import { freezeLifecycle } from "../utils/freezeObjects";
import { normalizeExecutionState } from "../utils/normalizeExecutionState";
import { validateExecutionContext } from "../validators/validateExecutionContext";
import type { AIExecutionStageHandler, PipelineWorkingState } from "./types";

/**
 * Create the immutable pipeline execution context.
 */
export class ContextStage implements AIExecutionStageHandler {
  readonly name = AIExecutionStages.CONTEXT;

  run(state: PipelineWorkingState): PipelineWorkingState {
    const startedAt = state.now;
    const contextId = `ai-exec-ctx:${state.request.id}`;

    const context = new AIExecutionContextBuilder()
      .withId(contextId)
      .withRequestId(state.request.id)
      .withProviderId(state.request.providerId)
      .withPromptPackageId(state.request.promptPackage.id)
      .withModelId(state.request.modelId)
      .withOptions(state.request.options)
      .withState(
        normalizeExecutionState({
          status: AIExecutionStatuses.PREPARING,
          stage: this.name,
          startedAt: state.startedAt,
          completedAt: null,
          error: null,
        }),
      )
      .withLifecycle(
        freezeLifecycle({
          ...state.lifecycle,
          status: AIExecutionStatuses.PREPARING,
          currentStage: this.name,
          startedAt: state.startedAt,
        }),
      )
      .withPolicy(state.request.policy)
      .withMetadata(state.request.metadata)
      .withPreparedAt(state.now)
      .withValidationIssues(state.validationIssues)
      .build();

    const softIssues = [...validateExecutionContext(context)];

    return {
      ...state,
      context,
      validationIssues: [...state.validationIssues, ...softIssues],
      lifecycle: freezeLifecycle({
        ...state.lifecycle,
        status: AIExecutionStatuses.PREPARING,
        currentStage: this.name,
        completedStages: Object.freeze([
          ...state.lifecycle.completedStages,
          this.name,
        ]),
        startedAt: state.startedAt,
      }),
      trace: appendTraceStep(
        state.trace,
        createTraceStep({
          stage: this.name,
          status: AIExecutionStatuses.SUCCEEDED,
          startedAt,
          completedAt: state.now,
          durationMs: 0,
          validationIssues: softIssues,
          message: contextId,
        }),
      ),
      stageStartedAt: {
        ...state.stageStartedAt,
        [this.name]: startedAt,
      },
    };
  }
}

export function createContextStage(): ContextStage {
  return new ContextStage();
}
