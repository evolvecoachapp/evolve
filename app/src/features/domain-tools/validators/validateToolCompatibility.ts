import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";

export type ToolCompatibilityValidationCode =
  | "unsupported_tool"
  | "adapter_cannot_handle"
  | "missing_definition";

/**
 * Validate that a tool id is compatible with a resolved adapter.
 */
export function validateToolCompatibility(
  adapter: IDomainToolAdapter | null,
  toolId: string,
): readonly ToolCompatibilityValidationCode[] {
  const issues: ToolCompatibilityValidationCode[] = [];

  if (!adapter) {
    issues.push("unsupported_tool");
    return Object.freeze([...issues]);
  }

  if (!adapter.canHandle(toolId)) {
    issues.push("adapter_cannot_handle");
  }

  if (!adapter.definition(toolId)) {
    issues.push("missing_definition");
  }

  return Object.freeze([...new Set(issues)]);
}
