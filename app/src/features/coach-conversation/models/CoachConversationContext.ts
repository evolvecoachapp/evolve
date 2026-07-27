import type { SessionResult } from "../../coaching-session/models/SessionResult";
import type { PlanRestoreResult } from "../../plan-restore/models/PlanRestoreResult";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { CoachConversationIntent } from "./CoachConversationIntent";
import type { CoachConversationRequest } from "./CoachConversationRequest";

/**
 * Immutable turn context assembled from Conversation + Session + Plan + Recommendations.
 * No duplicated domain state — references existing outputs only.
 */
export interface CoachConversationContext {
  readonly id: string;
  readonly request: CoachConversationRequest;
  readonly intent: CoachConversationIntent;
  readonly sessionId: string | null;
  readonly conversationId: string;
  readonly athleteId: string;
  readonly workoutPlan: WorkoutPlan | null;
  readonly previousWorkoutPlan: WorkoutPlan | null;
  readonly modification: WorkoutModificationResult | null;
  readonly restore: PlanRestoreResult | null;
  readonly session: SessionResult | null;
  readonly recommendationTitles: readonly string[];
  readonly recoveryNotes: readonly string[];
  readonly progressionCue: string | null;
  readonly memoryHints: readonly string[];
  readonly createdAt: string;
}
