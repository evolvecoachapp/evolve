import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { ConversationAudience } from "../models/ConversationAudience";
import type { ConversationContext } from "../models/ConversationContext";
import type { ConversationEngineResult } from "../models/ConversationEngineResult";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationStage } from "../models/ConversationStage";
import type { ConversationState } from "../models/ConversationState";
import type { ConversationSummary } from "../models/ConversationSummary";
import {
  ConversationOrchestratorEngine,
  createConversationOrchestratorEngine,
} from "../engine/ConversationOrchestratorEngine";

/**
 * Service facade over ConversationOrchestratorEngine.
 * Hides engine internals from application consumers.
 */
export class ConversationOrchestratorService {
  constructor(
    private readonly engine: ConversationOrchestratorEngine = createConversationOrchestratorEngine(),
  ) {}

  prepareConversation(options: {
    readonly coachingContext: CoachingContext;
    readonly insightSnapshot?: InsightSnapshot;
    readonly recoverySnapshot?: RecoverySnapshot;
    readonly athleteHistory?: AthleteHistory;
    readonly achievementResult?: AchievementResult;
    readonly performanceSnapshot?: PerformanceSnapshot;
    readonly preparedAt?: string;
    readonly contextId?: string;
    readonly audience?: ConversationAudience;
    readonly state?: ConversationState;
    readonly stage?: ConversationStage;
  }): ConversationEngineResult {
    return this.engine.prepare(options);
  }

  createConversationSnapshot(
    context: ConversationContext,
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
      readonly summary?: ConversationSummary;
    } = {},
  ): ConversationSnapshot {
    return this.engine.createSnapshot(context, options);
  }

  summarizeConversation(
    contextOrSnapshot: ConversationContext | ConversationSnapshot,
  ): ConversationSummary {
    return this.engine.summarize(contextOrSnapshot);
  }
}

export function createConversationOrchestratorService(): ConversationOrchestratorService {
  return new ConversationOrchestratorService();
}
