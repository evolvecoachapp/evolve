import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationState } from "../models/RecommendationState";
import { RecommendationSessionStatuses } from "../models/RecommendationState";
import { freezePackage, freezeState } from "../utils/FreezeRecommendationState";

/**
 * In-memory recommendation session holding the latest immutable package.
 */
export class RecommendationSession {
  private state: RecommendationState;

  constructor(at: string) {
    this.state = freezeState({
      status: RecommendationSessionStatuses.IDLE,
      package: null,
      recommendations: Object.freeze([]),
      updatedAt: at,
    });
  }

  getState(): RecommendationState {
    return this.state;
  }

  getPackage(): RecommendationPackage | null {
    return this.state.package;
  }

  put(
    pkg: RecommendationPackage,
    status = RecommendationSessionStatuses.READY,
  ): RecommendationPackage {
    const frozen = freezePackage(pkg);
    this.state = freezeState({
      status,
      package: frozen,
      recommendations: frozen.recommendations,
      updatedAt: frozen.createdAt,
    });
    return frozen;
  }

  clear(at: string): void {
    this.state = freezeState({
      status: RecommendationSessionStatuses.IDLE,
      package: null,
      recommendations: Object.freeze([]),
      updatedAt: at,
    });
  }
}

export function createRecommendationSession(at: string): RecommendationSession {
  return new RecommendationSession(at);
}
