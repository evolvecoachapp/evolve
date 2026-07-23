import type { RecoveryAgentMetadata } from "./RecoveryMetadata";
import type { RecoveryIntent } from "./RecoveryIntent";
import type { RecoveryGoal } from "./RecoveryGoal";

/**
 * Immutable inbound request for the Recovery Agent.
 */
export interface RecoveryRequest {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly message: string;
  readonly intentHint: RecoveryIntent | null;
  readonly goalHint: RecoveryGoal | null;
  readonly sleepHours: number | null;
  readonly sleepQuality: number | null;
  readonly stressLevel: number | null;
  readonly fatigueLevel: number | null;
  readonly sorenessLevel: number | null;
  readonly hrvScore: number | null;
  readonly readinessHint: number | null;
  readonly trainingLoadHint: number | null;
  readonly constraints: readonly string[];
  readonly metadata: RecoveryAgentMetadata;
  readonly createdAt: string;
}
