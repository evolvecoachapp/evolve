import type { WorkoutBlock } from "../models/WorkoutBlock";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSession } from "../models/WorkoutSession";

/**
 * Validate structural integrity of an assembled WorkoutSession.
 */
export function validateSessionIntegrity(
  session: WorkoutSession,
): readonly string[] {
  const issues: string[] = [];
  const exerciseById = new Map(
    session.exercises.map((exercise) => [exercise.id, exercise]),
  );

  if (session.exercises.length === 0) {
    issues.push("session_empty");
  }

  if (session.executionOrder.exerciseIds.length !== session.exercises.length) {
    issues.push("session_execution_order_length_mismatch");
  }

  for (const exerciseId of session.executionOrder.exerciseIds) {
    if (!exerciseById.has(exerciseId)) {
      issues.push(`session_execution_order_unknown_exercise:${exerciseId}`);
    }
  }

  const blockById = new Map(session.blocks.map((block) => [block.id, block]));
  for (const blockId of session.executionOrder.blockIds) {
    if (!blockById.has(blockId)) {
      issues.push(`session_execution_order_unknown_block:${blockId}`);
    }
  }

  for (const exercise of session.exercises) {
    if (!blockById.has(exercise.blockId)) {
      issues.push(`session_exercise_unknown_block:${exercise.id}:${exercise.blockId}`);
    }
  }

  for (const block of session.blocks) {
    validateBlockMembership(block, exerciseById, issues);
  }

  if (session.summary.exerciseCount !== session.exercises.length) {
    issues.push("session_summary_exercise_count_mismatch");
  }
  if (session.summary.blockCount !== session.blocks.length) {
    issues.push("session_summary_block_count_mismatch");
  }

  if (session.estimatedDurationSeconds !== session.summary.estimatedDurationSeconds) {
    issues.push("session_duration_summary_mismatch");
  }

  return Object.freeze(issues);
}

function validateBlockMembership(
  block: WorkoutBlock,
  exerciseById: Map<string, WorkoutExercise>,
  issues: string[],
): void {
  for (const exerciseId of block.exerciseIds) {
    const exercise = exerciseById.get(exerciseId);
    if (!exercise) {
      issues.push(`session_block_unknown_exercise:${block.id}:${exerciseId}`);
      continue;
    }
    if (exercise.blockId !== block.id) {
      issues.push(
        `session_block_exercise_block_mismatch:${block.id}:${exerciseId}`,
      );
    }
  }
}
