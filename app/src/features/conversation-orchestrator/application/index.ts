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
  createConversationOrchestratorService,
  type ConversationOrchestratorService,
} from "../services/ConversationOrchestratorService";

function resolveService(
  service?: ConversationOrchestratorService,
): ConversationOrchestratorService {
  return service ?? createConversationOrchestratorService();
}

/**
 * Public API — prepare immutable Conversation Context from Coaching Context.
 */
export function prepareConversation(options: {
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
  readonly service?: ConversationOrchestratorService;
}): ConversationEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).prepareConversation(rest);
}

/**
 * Public API — create a ConversationSnapshot from a ConversationContext.
 */
export function createConversationSnapshot(
  context: ConversationContext,
  options: {
    readonly snapshotId?: string;
    readonly frozenAt?: string;
    readonly summary?: ConversationSummary;
    readonly service?: ConversationOrchestratorService;
  } = {},
): ConversationSnapshot {
  const { service, ...rest } = options;
  return resolveService(service).createConversationSnapshot(context, rest);
}

/**
 * Public API — summarize a conversation context or snapshot.
 */
export function summarizeConversation(
  contextOrSnapshot: ConversationContext | ConversationSnapshot,
  service?: ConversationOrchestratorService,
): ConversationSummary {
  return resolveService(service).summarizeConversation(contextOrSnapshot);
}
