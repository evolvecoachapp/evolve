/**
 * Ordered pipeline step names for Program Generation orchestration.
 *
 * The orchestrator alone sequences these steps — engines never call each other.
 */
export type PipelineStepName =
  | "validate"
  | "create_context"
  | "blueprint"
  | "selection"
  | "programming"
  | "progression"
  | "training_adaptation"
  | "workout_assembly"
  | "freeze_result";

/**
 * Canonical execution order. Validators enforce this sequence.
 */
export const PIPELINE_STEP_ORDER = Object.freeze([
  "validate",
  "create_context",
  "blueprint",
  "selection",
  "programming",
  "progression",
  "training_adaptation",
  "workout_assembly",
  "freeze_result",
] as const satisfies readonly PipelineStepName[]);
