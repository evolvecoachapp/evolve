import type { RecoveryDecision } from "./RecoveryDecision";
import type { RecoveryPlan } from "./RecoveryPlan";
import type { RecoveryAssessment } from "./RecoveryAssessment";
import type { RecoveryExplanation } from "./RecoveryExplanation";
import type { RecoveryAgentStatistics } from "./RecoveryStatistics";

export interface RecoveryAgentSnapshot {
  readonly id: string;
  readonly decision: RecoveryDecision;
  readonly plan: RecoveryPlan | null;
  readonly assessment: RecoveryAssessment | null;
  readonly explanation: RecoveryExplanation;
  readonly statistics: RecoveryAgentStatistics;
  readonly frozenAt: string;
}
