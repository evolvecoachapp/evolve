import { AIExecutionError } from "../models/AIExecutionError";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { appendTraceStep, createTraceStep } from "../utils/buildTrace";
import { freezeContext, freezeLifecycle } from "../utils/freezeObjects";
import { transitionState } from "../utils/normalizeExecutionState";
import { validateProviderAvailability } from "../validators/validateProviderAvailability";
import type {
  AIExecutionStageHandler,
  PipelineWorkingState,
  StageDependencies,
} from "./types";

/**
 * Resolve provider contract + executor (no provider-specific logic).
 */
export class ProviderResolutionStage implements AIExecutionStageHandler {
  readonly name = AIExecutionStages.PROVIDER_RESOLUTION;

  run(
    state: PipelineWorkingState,
    deps: StageDependencies,
  ): PipelineWorkingState {
    const startedAt = state.now;
    const providerId = state.request.providerId;

    const availabilityIssues = [
      ...validateProviderAvailability({
        providerId,
        registry: deps.registry,
        executorResolver: deps.executorResolver,
      }),
    ];

    if (availabilityIssues.length > 0) {
      throw new AIExecutionError(
        availabilityIssues[0]!,
        `Provider unavailable: ${availabilityIssues.join(", ")}`,
        {
          stage: this.name,
          providerId,
          details: { issues: availabilityIssues },
        },
      );
    }

    const provider = deps.registry.resolve(providerId);
    const executor = deps.executorResolver.resolve(providerId);

    if (!provider || !executor) {
      throw new AIExecutionError(
        "provider_resolution_failed",
        `Failed to resolve provider or executor: ${providerId}`,
        { stage: this.name, providerId },
      );
    }

    const descriptor = provider.getInfo();
    const context = state.context
      ? freezeContext({
          ...state.context,
          provider: descriptor,
          state: transitionState(state.context.state, {
            status: AIExecutionStatuses.RESOLVING_PROVIDER,
            stage: this.name,
          }),
          lifecycle: freezeLifecycle({
            ...state.lifecycle,
            status: AIExecutionStatuses.RESOLVING_PROVIDER,
            currentStage: this.name,
            completedStages: Object.freeze([
              ...state.lifecycle.completedStages,
              this.name,
            ]),
          }),
          validationIssues: Object.freeze([
            ...state.context.validationIssues,
            ...availabilityIssues,
          ]),
        })
      : state.context;

    return {
      ...state,
      provider,
      executor,
      context,
      validationIssues: [...state.validationIssues, ...availabilityIssues],
      lifecycle: freezeLifecycle({
        ...state.lifecycle,
        status: AIExecutionStatuses.RESOLVING_PROVIDER,
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
          validationIssues: availabilityIssues,
          message: providerId,
        }),
      ),
      stageStartedAt: {
        ...state.stageStartedAt,
        [this.name]: startedAt,
      },
    };
  }
}

export function createProviderResolutionStage(): ProviderResolutionStage {
  return new ProviderResolutionStage();
}
