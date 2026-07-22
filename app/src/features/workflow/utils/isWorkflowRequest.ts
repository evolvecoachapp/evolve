import type { WorkflowRequest } from "../models/WorkflowRequest";

/**
 * Type guard distinguishing WorkflowRequest from ToolRequest / AIResponse.
 */
export function isWorkflowRequest(value: unknown): value is WorkflowRequest {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.workflowName === "string" &&
    Array.isArray(candidate.arguments) &&
    typeof candidate.requestedAt === "string" &&
    !("toolName" in candidate) &&
    !("finishReason" in candidate) &&
    !("message" in candidate)
  );
}
