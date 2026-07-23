import type { ToolExecutionContext } from "../models/ToolExecutionContext";

export type ExecutionContextValidationCode =
  | "missing_now"
  | "invalid_attributes";

/**
 * Validate ToolExecutionContext structural integrity.
 */
export function validateExecutionContext(
  context: ToolExecutionContext,
): readonly ExecutionContextValidationCode[] {
  const issues: ExecutionContextValidationCode[] = [];

  if (typeof context.now !== "string" || context.now.trim().length === 0) {
    issues.push("missing_now");
  }

  if (
    context.attributes === null ||
    typeof context.attributes !== "object" ||
    Array.isArray(context.attributes)
  ) {
    issues.push("invalid_attributes");
  }

  return Object.freeze([...new Set(issues)]);
}
