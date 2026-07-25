import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import type { RecoveryAdaptationState } from "../models/RecoveryAdaptationState";
import { RecoverySessionStatuses } from "../models/RecoveryAdaptationState";
import type { RecoveryPackage } from "../models/RecoveryPackage";
import { freezeState } from "../utils/FreezeRecoveryAdaptation";

export class RecoveryAdaptationSession {
  private state: RecoveryAdaptationState;

  constructor(updatedAt: string) {
    this.state = freezeState({
      status: RecoverySessionStatuses.IDLE,
      package: null,
      adaptation: null,
      updatedAt,
    });
  }

  getState(): RecoveryAdaptationState {
    return this.state;
  }

  getPackage(): RecoveryPackage | null {
    return this.state.package;
  }

  getAdaptation(): RecoveryAdaptation | null {
    return this.state.adaptation;
  }

  put(
    pkg: RecoveryPackage,
    status: (typeof RecoverySessionStatuses)[keyof typeof RecoverySessionStatuses],
  ): void {
    this.state = freezeState({
      status,
      package: pkg,
      adaptation: pkg.adaptation,
      updatedAt: pkg.createdAt,
    });
  }
}

export function createRecoveryAdaptationSession(updatedAt: string): RecoveryAdaptationSession {
  return new RecoveryAdaptationSession(updatedAt);
}
