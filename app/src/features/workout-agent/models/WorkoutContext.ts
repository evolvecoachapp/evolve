import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";
import type { WorkoutIntent } from "./WorkoutIntent";
import type { WorkoutObjective } from "./WorkoutObjective";
import type { WorkoutExperienceLevel } from "./WorkoutRequest";
import type { WorkoutStrategy } from "./WorkoutStrategy";

/**
 * Immutable orchestration context assembled before reasoning / planning.
 */
export interface WorkoutContext {
  readonly id: string;
  readonly requestId: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly intent: WorkoutIntent;
  readonly objective: WorkoutObjective;
  readonly strategy: WorkoutStrategy | null;
  readonly daysPerWeek: number;
  readonly experienceLevel: WorkoutExperienceLevel;
  readonly constraints: readonly string[];
  readonly conversationSummary: string | null;
  readonly coachResponseId: string | null;
  readonly actionPlanId: string | null;
  readonly toolResultIds: readonly string[];
  readonly memoryTurnCount: number;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: WorkoutAgentMetadata;
  readonly frozenAt: string;
}
