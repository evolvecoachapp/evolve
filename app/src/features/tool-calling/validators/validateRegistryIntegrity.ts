import type { IToolRegistry } from "../contracts/IToolRegistry";
import { validateToolId } from "./validateToolId";

export type RegistryIntegrityValidationCode =
  | "empty_registry"
  | "duplicate_tool_id"
  | "invalid_registered_tool_id"
  | "definition_id_mismatch";

/**
 * Validate registry integrity (ids, definitions, uniqueness).
 */
export function validateRegistryIntegrity(
  registry: IToolRegistry,
): readonly RegistryIntegrityValidationCode[] {
  const issues: RegistryIntegrityValidationCode[] = [];
  const tools = registry.list();

  if (tools.length === 0) {
    issues.push("empty_registry");
  }

  const seen = new Set<string>();
  for (const tool of tools) {
    const id = tool.id();
    const idIssues = validateToolId(id);
    if (idIssues.length > 0) {
      issues.push("invalid_registered_tool_id");
    }
    if (seen.has(id)) {
      issues.push("duplicate_tool_id");
    }
    seen.add(id);

    if (tool.definition().id !== id) {
      issues.push("definition_id_mismatch");
    }
  }

  return Object.freeze([...new Set(issues)]);
}
