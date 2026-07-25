import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionState } from "../models/DecisionState";
import { DecisionSessionStatuses } from "../models/DecisionState";
import { freezePackage, freezeState } from "../utils/FreezeDecisionState";

/**
 * In-memory decision session holding the latest immutable package.
 */
export class DecisionSession {
  private state: DecisionState;

  constructor(at: string) {
    this.state = freezeState({
      status: DecisionSessionStatuses.IDLE,
      package: null,
      decisions: Object.freeze([]),
      updatedAt: at,
    });
  }

  getState(): DecisionState {
    return this.state;
  }

  getPackage(): DecisionPackage | null {
    return this.state.package;
  }

  put(pkg: DecisionPackage, status = DecisionSessionStatuses.READY): DecisionPackage {
    const frozen = freezePackage(pkg);
    this.state = freezeState({
      status,
      package: frozen,
      decisions: frozen.decisions,
      updatedAt: frozen.createdAt,
    });
    return frozen;
  }

  clear(at: string): void {
    this.state = freezeState({
      status: DecisionSessionStatuses.IDLE,
      package: null,
      decisions: Object.freeze([]),
      updatedAt: at,
    });
  }
}

export function createDecisionSession(at: string): DecisionSession {
  return new DecisionSession(at);
}
