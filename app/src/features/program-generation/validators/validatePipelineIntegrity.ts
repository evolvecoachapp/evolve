import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";

/**
 * Validate that required engine outputs exist on the generation result.
 */
export function validateRequiredOutputs(
  result: Pick<
    WorkoutGenerationResult,
    | "blueprint"
    | "selection"
    | "programming"
    | "progression"
    | "adaptation"
    | "assembly"
    | "session"
  >,
): readonly string[] {
  const issues: string[] = [];

  if (!result.blueprint) {
    issues.push("missing_blueprint_output");
  }
  if (!result.selection) {
    issues.push("missing_selection_output");
  }
  if (!result.programming) {
    issues.push("missing_programming_output");
  }
  if (!result.progression) {
    issues.push("missing_progression_output");
  }
  if (!result.adaptation) {
    issues.push("missing_adaptation_output");
  }
  if (!result.assembly) {
    issues.push("missing_assembly_output");
  }
  if (!result.session) {
    issues.push("missing_session_output");
  }

  return Object.freeze(issues);
}

/**
 * Validate that recorded steps include all required engine stages.
 */
export function validatePipelineIntegrity(
  steps: readonly PipelineExecutionStep[],
): readonly string[] {
  const names = new Set(steps.map((step) => step.name));
  const required = [
    "validate",
    "create_context",
    "blueprint",
    "selection",
    "programming",
    "progression",
    "training_adaptation",
    "workout_assembly",
    "freeze_result",
  ] as const;

  const issues: string[] = [];
  for (const name of required) {
    if (!names.has(name)) {
      issues.push(`missing_step:${name}`);
    }
  }

  const failed = steps.find((step) => step.status === "failed");
  if (failed) {
    issues.push(`failed_step:${failed.name}`);
  }

  return Object.freeze(issues);
}
