import type { NutritionRequest } from "../../nutrition-agent/models/NutritionRequest";
import type { RecoveryRequest } from "../../recovery-agent/models/RecoveryRequest";
import type { WorkoutRequest } from "../../workout-agent/models/WorkoutRequest";
import type { CoachIntent } from "./CoachIntent";
import type { CoachMetadata } from "./CoachMetadata";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

/**
 * Immutable inbound request for the Coach meta-agent.
 * Optional embedded specialist requests are passed through when present.
 */
export interface CoachRequest {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly message: string;
  readonly intentHint: CoachIntent | null;
  /** Explicit specialist selection; empty → resolve from intent. */
  readonly agentHints: readonly SpecialistAgentKind[];
  readonly workoutRequest: WorkoutRequest | null;
  readonly recoveryRequest: RecoveryRequest | null;
  readonly nutritionRequest: NutritionRequest | null;
  readonly constraints: readonly string[];
  readonly metadata: CoachMetadata;
  readonly createdAt: string;
}

/** Alias matching sprint / public API naming. */
export type CoachAgentRequest = CoachRequest;
