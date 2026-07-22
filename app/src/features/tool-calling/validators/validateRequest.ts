import type { ToolRequest } from "../models/ToolRequest";

/** Structured validation issue codes — never prose. */
export type ToolRequestValidationCode =
  | "missing_id"
  | "missing_tool_name"
  | "invalid_arguments"
  | "missing_requested_at";

/**
 * Validate a ToolRequest structural integrity.
 */
export function validateRequest(
  request: ToolRequest,
): readonly ToolRequestValidationCode[] {
  const issues: ToolRequestValidationCode[] = [];

  if (typeof request.id !== "string" || request.id.trim().length === 0) {
    issues.push("missing_id");
  }

  if (
    typeof request.toolName !== "string" ||
    request.toolName.trim().length === 0
  ) {
    issues.push("missing_tool_name");
  }

  if (!Array.isArray(request.arguments)) {
    issues.push("invalid_arguments");
  } else {
    for (const arg of request.arguments) {
      if (
        !arg ||
        typeof arg.name !== "string" ||
        arg.name.trim().length === 0
      ) {
        issues.push("invalid_arguments");
        break;
      }
    }
  }

  if (
    typeof request.requestedAt !== "string" ||
    request.requestedAt.trim().length === 0
  ) {
    issues.push("missing_requested_at");
  }

  return Object.freeze([...new Set(issues)]);
}
