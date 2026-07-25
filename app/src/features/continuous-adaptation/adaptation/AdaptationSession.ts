import type { AdaptationPackage } from "../models/AdaptationPackage";
import type { AdaptationState } from "../models/AdaptationState";
import { AdaptationSessionStatuses } from "../models/AdaptationState";
import { freezeState } from "../utils/FreezeAdaptationState";

export class AdaptationSession {
  private state: AdaptationState;

  constructor(updatedAt: string) {
    this.state = freezeState({
      status: AdaptationSessionStatuses.IDLE,
      package: null,
      decisions: Object.freeze([]),
      updatedAt,
    });
  }

  getState(): AdaptationState {
    return this.state;
  }

  getPackage(): AdaptationPackage | null {
    return this.state.package;
  }

  put(pkg: AdaptationPackage, status: (typeof AdaptationSessionStatuses)[keyof typeof AdaptationSessionStatuses]): void {
    this.state = freezeState({
      status,
      package: pkg,
      decisions: pkg.decisions,
      updatedAt: pkg.createdAt,
    });
  }
}

export function createAdaptationSession(updatedAt: string): AdaptationSession {
  return new AdaptationSession(updatedAt);
}
