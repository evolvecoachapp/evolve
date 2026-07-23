import type { AIExecutionRequest } from "../models/AIExecutionRequest";

/**
 * Soft validation of an execution request.
 */
export function validateExecutionRequest(
  request: AIExecutionRequest | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!request) {
    return Object.freeze(["execution_request_missing"]);
  }

  if (!request.id?.trim()) {
    issues.push("execution_request_id_missing");
  }

  if (!request.promptPackage) {
    issues.push("execution_request_prompt_package_missing");
  } else if (!request.promptPackage.id?.trim()) {
    issues.push("execution_request_prompt_package_id_missing");
  }

  if (!request.providerId?.trim()) {
    issues.push("execution_request_provider_id_missing");
  }

  if (!request.createdAt?.trim()) {
    issues.push("execution_request_created_at_missing");
  }

  if (!request.options) {
    issues.push("execution_request_options_missing");
  } else if (request.options.stream === true) {
    issues.push("execution_request_streaming_not_supported");
  }

  if (request.policy?.execution?.allowStreaming === true) {
    issues.push("execution_policy_streaming_not_supported");
  }

  if (request.policy?.execution?.allowTools === true) {
    issues.push("execution_policy_tools_not_supported");
  }

  if (
    request.cancellation?.requested === true &&
    request.policy?.cancellation?.enabled !== true
  ) {
    issues.push("execution_cancellation_requested_without_policy");
  }

  return Object.freeze(issues);
}
