import type { ToolCapability } from "../models/ToolCapability";
import { TOOL_CAPABILITIES } from "../models/ToolCapability";
import type { ToolDefinition } from "../models/ToolDefinition";
import type { AITool } from "../tools/AITool";

/** Structured validation issue codes — never prose. */
export type ToolValidationCode =
  | "missing_name"
  | "missing_description"
  | "missing_capabilities"
  | "invalid_capability"
  | "missing_metadata_version"
  | "missing_metadata_created_at"
  | "invalid_metadata_tags";

/**
 * Validate an AITool structural contract.
 */
export function validateTool(tool: AITool): readonly ToolValidationCode[] {
  const issues: ToolValidationCode[] = [];

  if (typeof tool.name() !== "string" || tool.name().trim().length === 0) {
    issues.push("missing_name");
  }

  if (
    typeof tool.description() !== "string" ||
    tool.description().trim().length === 0
  ) {
    issues.push("missing_description");
  }

  const capabilities = tool.capabilities();
  if (!Array.isArray(capabilities) || capabilities.length === 0) {
    issues.push("missing_capabilities");
  } else {
    for (const capability of capabilities) {
      if (
        typeof capability !== "string" ||
        !(TOOL_CAPABILITIES as readonly string[]).includes(capability)
      ) {
        issues.push("invalid_capability");
        break;
      }
    }
  }

  return Object.freeze([...new Set(issues)]);
}

/**
 * Validate a ToolDefinition catalog entry.
 */
export function validateToolDefinition(
  definition: ToolDefinition,
): readonly ToolValidationCode[] {
  const issues: ToolValidationCode[] = [];

  if (
    typeof definition.name !== "string" ||
    definition.name.trim().length === 0
  ) {
    issues.push("missing_name");
  }

  if (
    typeof definition.description !== "string" ||
    definition.description.trim().length === 0
  ) {
    issues.push("missing_description");
  }

  if (
    !Array.isArray(definition.capabilities) ||
    definition.capabilities.length === 0
  ) {
    issues.push("missing_capabilities");
  } else {
    for (const capability of definition.capabilities) {
      if (
        typeof capability !== "string" ||
        !(TOOL_CAPABILITIES as readonly string[]).includes(capability)
      ) {
        issues.push("invalid_capability");
        break;
      }
    }
  }

  if (
    typeof definition.metadata?.version !== "string" ||
    definition.metadata.version.trim().length === 0
  ) {
    issues.push("missing_metadata_version");
  }

  if (
    typeof definition.metadata?.createdAt !== "string" ||
    definition.metadata.createdAt.trim().length === 0
  ) {
    issues.push("missing_metadata_created_at");
  }

  if (!Array.isArray(definition.metadata?.tags)) {
    issues.push("invalid_metadata_tags");
  }

  return Object.freeze([...new Set(issues)]);
}

/** @deprecated Prefer validateTool — alias for catalog clarity. */
export function validateCapability(
  capability: unknown,
): readonly ToolValidationCode[] {
  if (
    typeof capability !== "string" ||
    !(TOOL_CAPABILITIES as readonly string[]).includes(capability)
  ) {
    return Object.freeze(["invalid_capability" as const]);
  }
  return Object.freeze([]);
}

export type { ToolCapability };
