import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import {
  CoachSupervisorExecutionStatuses,
  type CoachSupervisorState,
} from "../models/CoachSupervisorState";
import { freezeState } from "../utils/FreezeSupervisorState";

/**
 * Runtime holder for frozen supervisor state snapshots.
 */
export class CoachSupervisorStateRuntime {
  private state: CoachSupervisorState;

  constructor(clock: () => string, id = "cstate:default") {
    this.state = freezeState({
      id,
      requestId: null,
      planId: null,
      status: CoachSupervisorExecutionStatuses.IDLE,
      currentAgentId: null,
      errorMessage: null,
      metadata: EMPTY_SUPERVISOR_METADATA,
      updatedAt: clock(),
    });
  }

  getState(): CoachSupervisorState {
    return this.state;
  }

  update(
    patch: Partial<CoachSupervisorState>,
    clock: () => string,
  ): CoachSupervisorState {
    this.state = freezeState({
      ...this.state,
      ...patch,
      metadata: patch.metadata ?? this.state.metadata,
      updatedAt: clock(),
    });
    return this.state;
  }
}
