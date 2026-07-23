import { AIExecutionError } from "../models/AIExecutionError";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import { freezeLifecycle } from "../utils/freezeObjects";
import { validateExecutionRequest } from "../validators/validateExecutionRequest";
import type { AIExecutionStageHandler, PipelineWorkingState } from "./types";

/**
 * Validate the execution request before any side effects.
 */
export class ValidationStage implements AIExecutionStageHandler {
  readonly name = AIExecutionStages.VALIDATION;

  run(state: PipelineWorkingState): PipelineWorkingState {
    const startedAt = state.now;
    const issues = [...validateExecutionRequest(state.request)];

    if (issues.length > 0) {
      throw new AIExecutionError(
        issues[0]!,
        `Execution request invalid: ${issues.join(", ")}`,
        {
          stage: this.name,
          providerId: state.request.providerId,
          details: { issues },
        },
      );
    }

    return {
      ...state,
      validationIssues: [...state.validationIssues, ...issues],
      lifecycle: freezeLifecycle({
        ...state.lifecycle,
        status: AIExecutionStatuses.VALIDATING,
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
          durationMs: 0,
          validationIssues: issues,
          message: "request_validated",
        }),
      ),
      stageStartedAt: {
        ...state.stageStartedAt,
        [this.name]: startedAt,
      },
    };
  }
}

export function createValidationStage(): ValidationStage {
  return new ValidationStage();
}
