import type { AIExecutionEvent } from "../models/AIExecutionEvent";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import {
  freezeContext,
  freezeLifecycle,
  freezeResult,
} from "../utils/freezeObjects";
import { transitionState } from "../utils/normalizeExecutionState";
import { summarizeExecution } from "../utils/summarizeExecution";
import type { AIExecutionStageHandler, PipelineWorkingState } from "./types";

/**
 * Finalize lifecycle status / events after result construction.
 */
export class LifecycleStage implements AIExecutionStageHandler {
  readonly name = AIExecutionStages.LIFECYCLE;

  run(state: PipelineWorkingState): PipelineWorkingState {
    const startedAt = state.now;
    const finalStatus =
      state.result?.status === AIExecutionStatuses.SUCCEEDED
        ? AIExecutionStatuses.SUCCEEDED
        : state.error
          ? AIExecutionStatuses.FAILED
          : (state.result?.status ?? AIExecutionStatuses.FAILED);

    const completionEvent: AIExecutionEvent = Object.freeze({
      id: `event:${state.request.id}:complete`,
      type: "execution.completed",
      stage: this.name,
      status: finalStatus,
      message: finalStatus,
      occurredAt: state.now,
      attributes: Object.freeze({
        hasResponse: state.response !== null,
        providerId: state.request.providerId,
      }),
    });

    const lifecycle = freezeLifecycle({
      ...state.lifecycle,
      status: finalStatus,
      currentStage: this.name,
      completedStages: Object.freeze([
        ...state.lifecycle.completedStages,
        this.name,
      ]),
      events: Object.freeze([...state.lifecycle.events, completionEvent]),
      startedAt: state.startedAt,
      completedAt: state.now,
    });

    const context = state.context
      ? freezeContext({
          ...state.context,
          state: transitionState(state.context.state, {
            status: finalStatus,
            stage: this.name,
            completedAt: state.now,
            error: state.error,
          }),
          lifecycle,
        })
      : state.context;

    const trace = appendTraceStep(
      state.trace,
      createTraceStep({
        stage: this.name,
        status: AIExecutionStatuses.SUCCEEDED,
        startedAt,
        completedAt: state.now,
        durationMs: 0,
        message: finalStatus,
      }),
    );

    let result = state.result;
    if (result) {
      result = freezeResult({
        ...result,
        status: finalStatus,
        lifecycle,
        trace,
        summary: summarizeExecution({
          ...result,
          status: finalStatus,
          lifecycle,
          trace,
        }),
      });
    }

    return {
      ...state,
      context,
      lifecycle,
      trace,
      result,
      stageStartedAt: {
        ...state.stageStartedAt,
        [this.name]: startedAt,
      },
    };
  }
}

export function createLifecycleStage(): LifecycleStage {
  return new LifecycleStage();
}
