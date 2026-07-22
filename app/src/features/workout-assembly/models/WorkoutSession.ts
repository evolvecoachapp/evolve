import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { TrainingFocus } from "../../workout-blueprint/models/TrainingFocus";
import type { TrainingPriority } from "../../workout-blueprint/models/TrainingPriority";
import type { WorkoutBlock } from "./WorkoutBlock";
import type { WorkoutExecutionOrder } from "./WorkoutExecutionOrder";
import type { WorkoutExercise } from "./WorkoutExercise";
import type { WorkoutSummary } from "./WorkoutSummary";

/**
 * One complete immutable training session ready for future execution.
 *
 * Contains metadata, ordered exercises, blocks, prescriptions, rest,
 * duration/workload estimates, execution order, and session notes.
 *
 * No execution tracking. No logging. No completion state. No timers.
 */
export interface WorkoutSession {
  readonly id: string;
  readonly blueprintId: string;
  readonly dayId: string;
  readonly dayIndex: number;
  readonly weekNumber: number;
  readonly name: string;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
  readonly priority: TrainingPriority;
  readonly exercises: readonly WorkoutExercise[];
  readonly blocks: readonly WorkoutBlock[];
  readonly executionOrder: WorkoutExecutionOrder;
  readonly summary: WorkoutSummary;
  readonly notes: readonly string[];
  readonly estimatedDurationSeconds: number;
  readonly estimatedWorkload: number;
  /** ISO-8601 — fixed by the engine for determinism. */
  readonly assembledAt: string;
}
