import type { DecisionCategory } from "./DecisionCategory";

/**
 * Pipeline / domain context in which a decision was made.
 */
export interface DecisionContext {
  readonly generationId: string;
  readonly stage: DecisionCategory;
  /** Pipeline step name when known (e.g. selection, programming). */
  readonly pipelineStep: string | null;
  readonly athleteId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly subjectId: string | null;
}
