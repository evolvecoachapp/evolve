import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";
import type { WorkoutIntent } from "./WorkoutIntent";
import type { WorkoutObjective } from "./WorkoutObjective";

/**
 * Immutable inbound request for the Workout Agent.
 */
export interface WorkoutRequest {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly message: string;
  readonly intentHint: WorkoutIntent | null;
  readonly objectiveHint: WorkoutObjective | null;
  readonly daysPerWeek: number | null;
  readonly experienceLevel: WorkoutExperienceLevel | null;
  readonly constraints: readonly string[];
  readonly metadata: WorkoutAgentMetadata;
  readonly createdAt: string;
}

export type WorkoutExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced";

export const WorkoutExperienceLevels = Object.freeze({
  BEGINNER: "beginner" as const,
  INTERMEDIATE: "intermediate" as const,
  ADVANCED: "advanced" as const,
});
