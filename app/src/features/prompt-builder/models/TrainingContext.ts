import type { TrainingTrend } from "../../coach-intelligence/models/TrainingTrend";

/**
 * Training volume and frequency trends for the prompt context.
 *
 * Structured evidence only — never natural language.
 */
export interface TrainingContext {
  readonly volumeTrend: TrainingTrend;
  readonly frequencyTrend: TrainingTrend;
}
