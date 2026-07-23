import type { RecoveryAgentMetadata } from "./RecoveryMetadata";
import type { RecoveryConfidence } from "./RecoveryConfidence";
import type { RecoveryGoal } from "./RecoveryGoal";
import type { DeloadRecommendation } from "./DeloadRecommendation";
import type { RecoveryAssessment } from "./RecoveryAssessment";

export type RecoveryProtocolHint =
  | "rest"
  | "active"
  | "deload"
  | "sleep_focus"
  | "stress_focus"
  | "mixed"
  | "unknown";

/**
 * Immutable recovery plan proposal (planning only — no execution).
 */
export interface RecoveryPlan {
  readonly id: string;
  readonly planningContextId: string;
  readonly goal: RecoveryGoal;
  readonly strategyId: string | null;
  readonly protocolHint: RecoveryProtocolHint;
  readonly recoveryScoreTarget: number;
  readonly readinessTarget: number;
  readonly sleepHoursTarget: number;
  readonly sleepQualityTarget: number;
  readonly stressCeiling: number;
  readonly fatigueCeiling: number;
  readonly deloadRecommendation: DeloadRecommendation;
  readonly assessment: RecoveryAssessment;
  readonly sessionNotes: readonly string[];
  readonly confidence: RecoveryConfidence;
  readonly rationale: readonly string[];
  readonly metadata: RecoveryAgentMetadata;
  readonly createdAt: string;
}
