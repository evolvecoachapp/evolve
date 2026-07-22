import type { ToolRequest } from "../models/ToolRequest";

/**
 * Type guard distinguishing ToolRequest from AIResponse / other outcomes.
 */
export function isToolRequest(value: unknown): value is ToolRequest {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.toolName === "string" &&
    Array.isArray(candidate.arguments) &&
    typeof candidate.requestedAt === "string" &&
    !("finishReason" in candidate) &&
    !("message" in candidate)
  );
}
