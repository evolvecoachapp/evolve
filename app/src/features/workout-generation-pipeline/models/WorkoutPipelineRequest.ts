import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
import type { WorkoutPlanMetadata } from "./WorkoutPlanMetadata";

/**
 * Immutable request into the Workout Generation Pipeline.
 */
export interface WorkoutPipelineRequest {
  readonly id: string;
  readonly athleteId: string;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly message: string;
  readonly intent: string;
  readonly generationRequest: WorkoutGenerationRequest;
  readonly metadata: WorkoutPlanMetadata;
  readonly createdAt: string;
}
