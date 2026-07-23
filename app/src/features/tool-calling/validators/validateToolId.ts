import { normalizeToolId } from "../utils/normalizeToolId";

export type ToolIdValidationCode =
  | "missing_tool_id"
  | "invalid_tool_id_format";

const TOOL_ID_PATTERN = /^[a-z][a-z0-9_]*$/;

/**
 * Validate a tool id (after normalization).
 */
export function validateToolId(toolId: string): readonly ToolIdValidationCode[] {
  const issues: ToolIdValidationCode[] = [];

  if (typeof toolId !== "string" || toolId.trim().length === 0) {
    return Object.freeze(["missing_tool_id" as const]);
  }

  const normalized = normalizeToolId(toolId);
  if (!TOOL_ID_PATTERN.test(normalized)) {
    issues.push("invalid_tool_id_format");
  }

  return Object.freeze([...new Set(issues)]);
}
