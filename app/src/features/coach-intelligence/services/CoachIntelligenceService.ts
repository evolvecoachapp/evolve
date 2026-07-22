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
  createCoachIntelligenceEngine,
  CoachIntelligenceEngine,
} from "../engine/CoachIntelligenceEngine";

/**
 * Service facade over CoachIntelligenceEngine (Sprint 18.8 preparation pipeline).
 * Hides engine internals from application consumers.
 */
export class CoachIntelligenceService {
  constructor(
    private readonly engine: CoachIntelligenceEngine = createCoachIntelligenceEngine(),
  ) {}

  prepareCoachingContext(options: {
    readonly insightSnapshot: InsightSnapshot;
    readonly recoverySnapshot?: RecoverySnapshot;
    readonly athleteHistory?: AthleteHistory;
    readonly achievementResult?: AchievementResult;
    readonly performanceSnapshot?: PerformanceSnapshot;
    readonly preparedAt?: string;
    readonly contextId?: string;
    readonly audience?: CoachAudience;
    readonly communicationStyle?: CoachCommunicationStyle;
  }): CoachEngineResult {
    return this.engine.prepare(options);
  }

  createCoachSnapshot(
    context: CoachingContext,
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
      readonly summary?: CoachingContextSummary;
    } = {},
  ): CoachContextSnapshot {
    return this.engine.createSnapshot(context, options);
  }

  summarizeCoachingContext(
    contextOrSnapshot: CoachingContext | CoachContextSnapshot,
  ): CoachingContextSummary {
    return this.engine.summarize(contextOrSnapshot);
  }
}

export function createCoachIntelligenceService(): CoachIntelligenceService {
  return new CoachIntelligenceService();
}
