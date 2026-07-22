import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionStep } from "../models/ProgressionStep";

/**
 * Validate week ordering is strictly contiguous and ascending per exercise.
 */
export function validateWeekOrdering(
  progressions: readonly ExerciseProgression[],
): readonly string[] {
  const issues: string[] = [];

  for (const progression of progressions) {
    if (progression.steps.length === 0) {
      issues.push(`empty_steps:${progression.exerciseId}`);
      continue;
    }

    for (let index = 0; index < progression.steps.length; index += 1) {
      const step = progression.steps[index]!;
      if (index > 0) {
        const previous = progression.steps[index - 1]!;
        if (step.weekNumber <= previous.weekNumber) {
          issues.push(
            `week_order_violation:${progression.exerciseId}:${previous.weekNumber}->${step.weekNumber}`,
          );
        }
        if (step.weekNumber !== previous.weekNumber + 1) {
          issues.push(
            `week_gap:${progression.exerciseId}:${previous.weekNumber}->${step.weekNumber}`,
          );
        }
      }
    }
  }

  return Object.freeze(issues);
}

/**
 * Validate flattened timeline week ordering globally.
 */
export function validateTimelineConsistency(
  timeline: readonly ProgressionStep[],
  windowStart: number,
  weekCount: number,
): readonly string[] {
  const issues: string[] = [];

  if (timeline.length === 0) {
    return Object.freeze(["timeline_empty"]);
  }

  const expectedEnd = windowStart + weekCount - 1;
  const weeks = new Set(timeline.map((step) => step.weekNumber));

  for (let week = windowStart; week <= expectedEnd; week += 1) {
    if (!weeks.has(week)) {
      issues.push(`missing_week:${week}`);
    }
  }

  for (let index = 1; index < timeline.length; index += 1) {
    const previous = timeline[index - 1]!;
    const current = timeline[index]!;
    if (current.weekNumber < previous.weekNumber) {
      issues.push(
        `timeline_out_of_order:${previous.weekNumber}->${current.weekNumber}`,
      );
      break;
    }
  }

  return Object.freeze(issues);
}
