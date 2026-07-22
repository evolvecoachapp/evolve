import type { ToolArgument } from "../models/ToolArgument";
import type { AITool } from "../tools/AITool";

/** Structured validation issue codes — never prose. */
export type ToolArgumentsValidationCode =
  | "invalid_arguments_shape"
  | "duplicate_argument_name"
  | "tool_rejected_arguments";

/**
 * Validate tool arguments shape and tool-specific rules.
 */
export function validateArguments(
  args: readonly ToolArgument[],
  tool?: AITool,
): readonly ToolArgumentsValidationCode[] {
  const issues: ToolArgumentsValidationCode[] = [];

  if (!Array.isArray(args)) {
    return Object.freeze(["invalid_arguments_shape" as const]);
  }

  const names = new Set<string>();
  for (const arg of args) {
    if (!arg || typeof arg.name !== "string" || arg.name.trim().length === 0) {
      issues.push("invalid_arguments_shape");
      break;
    }
    if (names.has(arg.name)) {
      issues.push("duplicate_argument_name");
      break;
    }
    names.add(arg.name);
  }

  if (tool) {
    const toolIssues = tool.validateArguments(args);
    if (toolIssues.length > 0) {
      issues.push("tool_rejected_arguments");
    }
  }

  return Object.freeze([...new Set(issues)]);
}
