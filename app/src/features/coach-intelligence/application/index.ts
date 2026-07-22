import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { CoachAudience } from "../models/CoachAudience";
import type { CoachCommunicationStyle } from "../models/CoachCommunicationStyle";
import type { CoachContextSnapshot } from "../models/CoachContextSnapshot";
import type { CoachEngineResult } from "../models/CoachEngineResult";
import type { CoachingContext } from "../models/CoachingContext";
import type { CoachingContextSummary } from "../models/CoachingContextSummary";
import {
  createCoachIntelligenceService,
  type CoachIntelligenceService,
} from "../services/CoachIntelligenceService";

export { getCoachSummary } from "./getCoachSummary";
export { getCoachInsights } from "./getCoachInsights";
export { getCoachRiskFlags } from "./getCoachRiskFlags";
export { getCoachRecommendations } from "./getCoachRecommendations";
export {
  getCoachInsightsSnapshot,
  type CoachInsightsSnapshot,
  type GetCoachInsightsSnapshotOptions,
} from "./getCoachInsightsSnapshot";

function resolveService(
  service?: CoachIntelligenceService,
): CoachIntelligenceService {
  return service ?? createCoachIntelligenceService();
}

/**
 * Public API — prepare immutable Coaching Context from Insight Snapshot.
 */
export function prepareCoachingContext(options: {
  readonly insightSnapshot: InsightSnapshot;
  readonly recoverySnapshot?: RecoverySnapshot;
  readonly athleteHistory?: AthleteHistory;
  readonly achievementResult?: AchievementResult;
  readonly performanceSnapshot?: PerformanceSnapshot;
  readonly preparedAt?: string;
  readonly contextId?: string;
  readonly audience?: CoachAudience;
  readonly communicationStyle?: CoachCommunicationStyle;
  readonly service?: CoachIntelligenceService;
}): CoachEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).prepareCoachingContext(rest);
}

/**
 * Public API — create a CoachContextSnapshot from a CoachingContext.
 */
export function createCoachSnapshot(
  context: CoachingContext,
  options: {
    readonly snapshotId?: string;
    readonly frozenAt?: string;
    readonly summary?: CoachingContextSummary;
    readonly service?: CoachIntelligenceService;
  } = {},
): CoachContextSnapshot {
  const { service, ...rest } = options;
  return resolveService(service).createCoachSnapshot(context, rest);
}

/**
 * Public API — summarize a coaching context or snapshot.
 */
export function summarizeCoachingContext(
  contextOrSnapshot: CoachingContext | CoachContextSnapshot,
  service?: CoachIntelligenceService,
): CoachingContextSummary {
  return resolveService(service).summarizeCoachingContext(contextOrSnapshot);
}
