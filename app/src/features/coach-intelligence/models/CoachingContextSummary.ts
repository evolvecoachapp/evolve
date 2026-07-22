import type { CoachIntent } from "./CoachIntent";

/**
 * Compact public summary of a Coaching Context (Sprint 18.8).
 * Distinct from legacy `CoachSummary` (history-backed presentation summary).
 */
export interface CoachingContextSummary {
  readonly contextId: string;
  readonly athleteId: string | null;
  readonly objectiveCount: number;
  readonly constraintCount: number;
  readonly instructionCount: number;
  readonly focusCount: number;
  readonly evidenceCount: number;
  readonly topObjectiveIds: readonly string[];
  readonly primaryIntent: CoachIntent | null;
  readonly summaryText: string;
}
