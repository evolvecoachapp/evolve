import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";
import type { WorkoutContext } from "./WorkoutContext";

/**
 * Execution-facing context for handoff (no tool invocation here).
 */
export interface WorkoutExecutionContext {
  readonly id: string;
  readonly context: WorkoutContext;
  readonly actionPlanId: string | null;
  readonly pendingToolIds: readonly string[];
  readonly dryRun: boolean;
  readonly metadata: WorkoutAgentMetadata;
  readonly frozenAt: string;
}
