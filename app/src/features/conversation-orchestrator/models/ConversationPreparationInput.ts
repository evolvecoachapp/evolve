import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { ConversationAudience } from "./ConversationAudience";
import type { ConversationStage } from "./ConversationStage";
import type { ConversationState } from "./ConversationState";

/**
 * Input for preparing an immutable Conversation Context.
 * CoachingContext is required; upstream snapshots are optional references.
 */
export interface ConversationPreparationInput {
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
}
