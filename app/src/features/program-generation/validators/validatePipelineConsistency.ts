import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";

/**
 * Validate cross-stage consistency of the assembled generation result.
 */
export function validatePipelineConsistency(
  result: WorkoutGenerationResult,
): readonly string[] {
  const issues: string[] = [];

  if (result.session.id !== result.assembly.session.id) {
    issues.push("session_assembly_mismatch");
  }
  if (result.session.blueprintId !== result.blueprint.id) {
    issues.push("session_blueprint_mismatch");
  }
  if (result.requestId !== result.context.generationId) {
    issues.push("request_id_mismatch");
  }
  if (result.summary.generationId !== result.context.generationId) {
    issues.push("summary_generation_id_mismatch");
  }
  if (result.trace.generationId !== result.context.generationId) {
    issues.push("trace_generation_id_mismatch");
  }
  if (result.summary.status !== "succeeded" && result.summary.status !== "failed") {
    issues.push(`unexpected_summary_status:${result.summary.status}`);
  }

  if (result.assembly.session.exercises.length === 0) {
    issues.push("empty_session_exercises");
  }

  return Object.freeze(issues);
}
