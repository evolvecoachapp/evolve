import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { CoachAudience } from "./CoachAudience";
import type { CoachCommunicationStyle } from "./CoachCommunicationStyle";

/**
 * Input for preparing an immutable Coaching Context.
 * InsightSnapshot is required; upstream snapshots are optional references.
 */
export interface CoachPreparationInput {
  readonly insightSnapshot: InsightSnapshot;
  readonly recoverySnapshot?: RecoverySnapshot;
  readonly athleteHistory?: AthleteHistory;
  readonly achievementResult?: AchievementResult;
  readonly performanceSnapshot?: PerformanceSnapshot;
  readonly preparedAt?: string;
  readonly contextId?: string;
  readonly audience?: CoachAudience;
  readonly communicationStyle?: CoachCommunicationStyle;
}
