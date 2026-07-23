import type { RecoveryAgentMetadata } from "./RecoveryMetadata";
import type { RecoveryIntent } from "./RecoveryIntent";
import type { RecoveryGoal } from "./RecoveryGoal";
import type { RecoveryStrategy } from "./RecoveryStrategy";
import type { RecoveryConstraints } from "./RecoveryConstraints";
import type { RecoveryProfile } from "./RecoveryProfile";
import type { RecoveryIndicators } from "./RecoveryIndicators";
import type { FatigueState } from "./FatigueState";
import type { ReadinessState } from "./ReadinessState";
import type { SleepProfile } from "./SleepProfile";
import type { StressProfile } from "./StressProfile";
import type { TrainingLoad } from "./TrainingLoad";

/**
 * Immutable orchestration context assembled before reasoning / planning.
 */
export interface RecoveryContext {
  readonly id: string;
  readonly requestId: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly intent: RecoveryIntent;
  readonly goal: RecoveryGoal;
  readonly strategy: RecoveryStrategy | null;
  readonly profile: RecoveryProfile;
  readonly indicators: RecoveryIndicators;
  readonly fatigue: FatigueState;
  readonly readiness: ReadinessState;
  readonly sleep: SleepProfile;
  readonly stress: StressProfile;
  readonly trainingLoad: TrainingLoad;
  readonly constraints: RecoveryConstraints;
  readonly conversationSummary: string | null;
  readonly coachResponseId: string | null;
  readonly actionPlanId: string | null;
  readonly toolResultIds: readonly string[];
  readonly memoryTurnCount: number;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: RecoveryAgentMetadata;
  readonly frozenAt: string;
}
