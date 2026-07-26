import type { AthleteStatePort as DecisionAthleteStatePort } from "../../../features/decision-engine/contracts/AthleteStatePort";
import type { CoachSupervisorPort as DecisionSupervisorPort } from "../../../features/decision-engine/contracts/CoachSupervisorPort";
import type { AthleteStatePort as RecommendationAthleteStatePort } from "../../../features/recommendation-engine/contracts/AthleteStatePort";
import type { CoachSupervisorPort as RecommendationSupervisorPort } from "../../../features/recommendation-engine/contracts/CoachSupervisorPort";
import type { ContextFusionPort as RecommendationContextFusionPort } from "../../../features/recommendation-engine/contracts/ContextFusionPort";
import type { AthleteStateService } from "../../../features/athlete-state/services/AthleteStateService";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";
import type { ContextFusionService } from "../../../features/context-fusion/services/ContextFusionService";

/**
 * Thin presence / focus adapters for Decision + Recommendation engines.
 */

export function createDecisionAthleteStatePortAdapter(
  athleteState: AthleteStateService,
): DecisionAthleteStatePort {
  const port: DecisionAthleteStatePort = {
    hasAthleteState(input) {
      const described = athleteState.describeAthleteState();
      return Boolean(described.id) && input.athleteId.length > 0;
    },
  };
  return port;
}

export function createDecisionSupervisorPortAdapter(
  supervisor: CoachSupervisorService,
): DecisionSupervisorPort {
  const port: DecisionSupervisorPort = {
    describeSupervisorFocus() {
      const caps = supervisor.describeCapabilities();
      return Object.freeze(
        caps.supportedDomains.length > 0
          ? [...caps.supportedDomains]
          : ["orchestration"],
      );
    },
  };
  return port;
}

export function createRecommendationAthleteStatePortAdapter(
  athleteState: AthleteStateService,
): RecommendationAthleteStatePort {
  const port: RecommendationAthleteStatePort = {
    isAthletePresent(input) {
      return createDecisionAthleteStatePortAdapter(athleteState).hasAthleteState(
        input,
      );
    },
  };
  return port;
}

export function createRecommendationSupervisorPortAdapter(
  supervisor: CoachSupervisorService,
): RecommendationSupervisorPort {
  const port: RecommendationSupervisorPort = {
    describeSupervisorFocus(input) {
      return createDecisionSupervisorPortAdapter(supervisor).describeSupervisorFocus(
        input,
      );
    },
  };
  return port;
}

export function createRecommendationContextFusionPortAdapter(
  fusion: ContextFusionService,
): RecommendationContextFusionPort {
  const port: RecommendationContextFusionPort = {
    describeFocusAreas() {
      const described = fusion.describeContext();
      return Object.freeze(
        described.sourceKinds.length > 0
          ? [...described.sourceKinds]
          : ["training", "recovery"],
      );
    },
  };
  return port;
}
