import type { WorkoutModificationKind } from "./WorkoutModificationKind";
import type { WorkoutPlanMetadata } from "./WorkoutPlanMetadata";
import type { WorkoutPlan } from "./WorkoutPlan";

/**
 * Request to surgically modify an existing WorkoutPlan.
 */
export interface WorkoutModificationRequest {
  readonly id: string;
  readonly plan: WorkoutPlan;
  readonly athleteId: string;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly message: string;
  readonly kindHint: WorkoutModificationKind | null;
  readonly metadata: WorkoutPlanMetadata;
  readonly createdAt: string;
}
