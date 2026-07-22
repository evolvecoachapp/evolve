import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { ProgrammingContext } from "../models/ProgrammingContext";

/**
 * Independent programming strategy.
 * Receives the current prescription and returns an updated immutable prescription.
 * Strategies never coordinate with each other.
 */
export interface ProgrammingStrategy {
  readonly id: string;
  apply(
    prescription: ExercisePrescription,
    context: ProgrammingContext,
  ): ExercisePrescription;
}
