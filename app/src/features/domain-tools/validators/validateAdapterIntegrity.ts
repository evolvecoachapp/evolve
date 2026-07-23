import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";
import { DOMAIN_TOOL_DOMAINS } from "../models/DomainToolDomain";

export type AdapterIntegrityValidationCode =
  | "missing_adapter_id"
  | "missing_domain"
  | "unknown_domain"
  | "empty_supported_tools"
  | "definition_mismatch"
  | "duplicate_tool_id";

/**
 * Validate adapter registration integrity.
 */
export function validateAdapterIntegrity(
  adapter: IDomainToolAdapter,
): readonly AdapterIntegrityValidationCode[] {
  const issues: AdapterIntegrityValidationCode[] = [];

  if (typeof adapter.id() !== "string" || adapter.id().trim().length === 0) {
    issues.push("missing_adapter_id");
  }

  const domain = adapter.domain();
  if (typeof domain !== "string" || domain.trim().length === 0) {
    issues.push("missing_domain");
  } else if (
    !(DOMAIN_TOOL_DOMAINS as readonly string[]).includes(domain)
  ) {
    issues.push("unknown_domain");
  }

  const tools = adapter.supportedToolIds();
  if (!Array.isArray(tools) || tools.length === 0) {
    issues.push("empty_supported_tools");
  } else {
    const seen = new Set<string>();
    for (const toolId of tools) {
      if (seen.has(toolId)) {
        issues.push("duplicate_tool_id");
      }
      seen.add(toolId);
      if (!adapter.canHandle(toolId) || !adapter.definition(toolId)) {
        issues.push("definition_mismatch");
      }
    }
  }

  return Object.freeze([...new Set(issues)]);
}

/**
 * Validate a collection of adapters for unique tool ids across adapters.
 */
export function validateAdapterCollectionIntegrity(
  adapters: readonly IDomainToolAdapter[],
): readonly AdapterIntegrityValidationCode[] {
  const issues: AdapterIntegrityValidationCode[] = [];
  const seen = new Set<string>();

  for (const adapter of adapters) {
    issues.push(...validateAdapterIntegrity(adapter));
    for (const toolId of adapter.supportedToolIds()) {
      if (seen.has(toolId)) {
        issues.push("duplicate_tool_id");
      }
      seen.add(toolId);
    }
  }

  return Object.freeze([...new Set(issues)]);
}
