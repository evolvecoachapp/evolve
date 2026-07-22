import type { ExercisePrescription } from "./ExercisePrescription";
import type { ProgrammingContext } from "./ProgrammingContext";
import type { ProgrammingExplanation } from "./ProgrammingExplanation";
import type { ProgrammingScore } from "./ProgrammingScore";

/**
 * Immutable output of the Programming Engine.
 * Training prescriptions only — never a complete workout session assembly.
 */
export interface ProgrammingResult {
  readonly requestId: string;
  readonly context: ProgrammingContext;
  readonly prescriptions: readonly ExercisePrescription[];
  readonly explanations: readonly ProgrammingExplanation[];
  readonly validationIssues: readonly string[];
  readonly score: ProgrammingScore;
  /** ISO-8601 — fixed by the engine for determinism. */
  readonly programmedAt: string;
}
