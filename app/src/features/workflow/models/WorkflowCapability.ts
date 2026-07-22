/**
 * Domain capability a workflow exposes.
 *
 * Provider-agnostic — never maps to vendor workflow names.
 */
export type WorkflowCapability =
  | "generate_workout"
  | "generate_workout_blueprint"
  | "analyze_progress"
  | "recommend_recovery"
  | "plan_deload"
  | "build_nutrition_overview";

export const WORKFLOW_CAPABILITIES = Object.freeze([
  "generate_workout",
  "generate_workout_blueprint",
  "analyze_progress",
  "recommend_recovery",
  "plan_deload",
  "build_nutrition_overview",
] as const satisfies readonly WorkflowCapability[]);
