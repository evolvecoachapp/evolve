import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";

/**
 * Workout Agent configuration descriptor.
 */
export interface WorkoutAgent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly strategyIds: readonly string[];
  readonly policyIds: readonly string[];
  readonly reasonerIds: readonly string[];
  readonly plannerIds: readonly string[];
  readonly metadata: WorkoutAgentMetadata;
  readonly createdAt: string;
}
