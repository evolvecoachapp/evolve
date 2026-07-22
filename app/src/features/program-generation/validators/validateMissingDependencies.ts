import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";

/**
 * Validate request-level missing dependencies before orchestration starts.
 */
export function validateMissingDependencies(
  request: WorkoutGenerationRequest,
): readonly string[] {
  const issues: string[] = [];

  if (!request.athleteContext) {
    issues.push("missing_athlete_context");
  } else if (!request.athleteContext.profile?.id) {
    issues.push("missing_athlete_id");
  }

  if (
    request.blueprintSource === undefined ||
    request.blueprintSource === null
  ) {
    issues.push("missing_blueprint_source");
  }

  return Object.freeze(issues);
}

/**
 * Validate that engine outputs reference consistent upstream identifiers.
 */
export function validatePipelineDependencies(
  result: Pick<
    WorkoutGenerationResult,
    | "blueprint"
    | "selection"
    | "programming"
    | "progression"
    | "adaptation"
    | "assembly"
  >,
): readonly string[] {
  const issues: string[] = [];
  const blueprintId = result.blueprint.id;

  if (result.selection.context.blueprintId !== blueprintId) {
    issues.push("selection_blueprint_mismatch");
  }
  if (result.programming.context.blueprintId !== blueprintId) {
    issues.push("programming_blueprint_mismatch");
  }
  if (result.progression.context.blueprintId !== blueprintId) {
    issues.push("progression_blueprint_mismatch");
  }
  if (result.adaptation.context.blueprintId !== blueprintId) {
    issues.push("adaptation_blueprint_mismatch");
  }
  if (result.assembly.context.blueprintId !== blueprintId) {
    issues.push("assembly_blueprint_mismatch");
  }

  if (
    result.programming.context.selectionRequestId !== result.selection.requestId
  ) {
    issues.push("programming_selection_mismatch");
  }
  if (
    result.progression.context.programmingRequestId !==
    result.programming.requestId
  ) {
    issues.push("progression_programming_mismatch");
  }
  if (
    result.adaptation.context.progressionRequestId !==
    result.progression.requestId
  ) {
    issues.push("adaptation_progression_mismatch");
  }
  if (
    result.assembly.context.adaptationRequestId !== result.adaptation.requestId
  ) {
    issues.push("assembly_adaptation_mismatch");
  }

  return Object.freeze(issues);
}
