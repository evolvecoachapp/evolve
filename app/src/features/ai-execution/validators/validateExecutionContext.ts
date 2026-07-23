import type { AIExecutionContext } from "../models/AIExecutionContext";

/**
 * Soft validation of pipeline execution context.
 */
export function validateExecutionContext(
  context: AIExecutionContext | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!context) {
    return Object.freeze(["execution_context_missing"]);
  }

  if (!context.id?.trim()) {
    issues.push("execution_context_id_missing");
  }

  if (!context.requestId?.trim()) {
    issues.push("execution_context_request_id_missing");
  }

  if (!context.providerId?.trim()) {
    issues.push("execution_context_provider_id_missing");
  }

  if (!context.promptPackageId?.trim()) {
    issues.push("execution_context_prompt_package_id_missing");
  }

  if (!context.preparedAt?.trim()) {
    issues.push("execution_context_prepared_at_missing");
  }

  if (!context.state) {
    issues.push("execution_context_state_missing");
  }

  if (!context.lifecycle) {
    issues.push("execution_context_lifecycle_missing");
  }

  if (!context.policy) {
    issues.push("execution_context_policy_missing");
  }

  return Object.freeze(issues);
}
