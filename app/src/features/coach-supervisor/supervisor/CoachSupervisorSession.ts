import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorSession as CoachSupervisorSessionModel } from "../models/CoachSupervisorSession";
import type { CoachSupervisorState } from "../models/CoachSupervisorState";
import { freezeSession } from "../utils/FreezeSupervisorState";
import { CoachSupervisorStateRuntime } from "./CoachSupervisorStateRuntime";

/**
 * Session wrapper around supervisor state runtime.
 */
export class CoachSupervisorSession {
  private readonly runtime: CoachSupervisorStateRuntime;
  private readonly createdAt: string;
  readonly id: string;

  constructor(deps: { readonly id?: string; readonly clock: () => string }) {
    this.id = deps.id ?? "csession:default";
    this.createdAt = deps.clock();
    this.runtime = new CoachSupervisorStateRuntime(deps.clock, `${this.id}:state`);
  }

  getState(): CoachSupervisorState {
    return this.runtime.getState();
  }

  updateState(
    patch: Partial<CoachSupervisorState>,
    clock: () => string,
  ): CoachSupervisorState {
    return this.runtime.update(patch, clock);
  }

  toModel(clock: () => string): CoachSupervisorSessionModel {
    return freezeSession({
      id: this.id,
      requestId: this.runtime.getState().requestId,
      state: this.runtime.getState(),
      metadata: EMPTY_SUPERVISOR_METADATA,
      createdAt: this.createdAt,
      updatedAt: clock(),
    });
  }
}

export function createCoachSupervisorSession(deps: {
  readonly id?: string;
  readonly clock: () => string;
}): CoachSupervisorSession {
  return new CoachSupervisorSession(deps);
}
