import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionState } from "../models/ToolExecutionState";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";
import { freezeExecutionState } from "../utils/freezeExecution";

/**
 * Manages immutable execution state snapshots. No business logic.
 */
export class ExecutionContextManager {
  readonly id = "runtime:context-manager";

  createInitialState(options: {
    readonly id: string;
    readonly updatedAt: string;
  }): ToolExecutionState {
    return freezeExecutionState({
      id: options.id,
      status: ToolExecutionStatuses.PENDING,
      currentStepId: null,
      completedStepIds: Object.freeze([]),
      failedStepIds: Object.freeze([]),
      skippedStepIds: Object.freeze([]),
      startedAt: null,
      updatedAt: options.updatedAt,
      message: null,
    });
  }

  withRunning(
    state: ToolExecutionState,
    stepId: string,
    updatedAt: string,
  ): ToolExecutionState {
    return freezeExecutionState({
      ...state,
      status: ToolExecutionStatuses.RUNNING,
      currentStepId: stepId,
      startedAt: state.startedAt ?? updatedAt,
      updatedAt,
    });
  }

  withStepCompleted(
    state: ToolExecutionState,
    stepId: string,
    updatedAt: string,
  ): ToolExecutionState {
    return freezeExecutionState({
      ...state,
      currentStepId: null,
      completedStepIds: Object.freeze([...state.completedStepIds, stepId]),
      updatedAt,
    });
  }

  withStepFailed(
    state: ToolExecutionState,
    stepId: string,
    updatedAt: string,
    message: string | null = null,
  ): ToolExecutionState {
    return freezeExecutionState({
      ...state,
      currentStepId: null,
      failedStepIds: Object.freeze([...state.failedStepIds, stepId]),
      updatedAt,
      message,
    });
  }

  withStepSkipped(
    state: ToolExecutionState,
    stepId: string,
    updatedAt: string,
  ): ToolExecutionState {
    return freezeExecutionState({
      ...state,
      currentStepId: null,
      skippedStepIds: Object.freeze([...state.skippedStepIds, stepId]),
      updatedAt,
    });
  }

  assertContextAligned(
    context: ToolExecutionContext,
    planId: string,
  ): boolean {
    return context.planId === planId;
  }
}
