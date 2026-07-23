import type { RecoveryAgentMetadata } from "./RecoveryMetadata";
import type { RecoveryConfidence } from "./RecoveryConfidence";
import type { RecoveryGoal } from "./RecoveryGoal";
import type { RecoveryIntent } from "./RecoveryIntent";
import type { RecoveryPlan } from "./RecoveryPlan";
import type { RecoveryAssessment } from "./RecoveryAssessment";

export interface RecoveryDecision {
  readonly id: string;
  readonly intent: RecoveryIntent;
  readonly goal: RecoveryGoal;
  readonly strategyId: string | null;
  readonly plan: RecoveryPlan | null;
  readonly assessment: RecoveryAssessment | null;
  readonly accepted: boolean;
  readonly confidence: RecoveryConfidence;
  readonly reasons: readonly string[];
  readonly policyFlags: readonly string[];
  readonly metadata: RecoveryAgentMetadata;
  readonly decidedAt: string;
}
