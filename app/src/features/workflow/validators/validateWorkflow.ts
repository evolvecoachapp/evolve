import type { WorkflowCapability } from "../models/WorkflowCapability";
import { WORKFLOW_CAPABILITIES } from "../models/WorkflowCapability";
import type { WorkflowDefinition } from "../models/WorkflowDefinition";
import type { AIWorkflow } from "../workflows/AIWorkflow";

/** Structured validation issue codes — never prose. */
export type WorkflowValidationCode =
  | "missing_name"
  | "missing_description"
  | "missing_capabilities"
  | "invalid_capability"
  | "missing_metadata_version"
  | "missing_metadata_created_at"
  | "invalid_metadata_tags";

/**
 * Validate an AIWorkflow structural contract.
 */
export function validateWorkflow(
  workflow: AIWorkflow,
): readonly WorkflowValidationCode[] {
  const issues: WorkflowValidationCode[] = [];

  if (
    typeof workflow.name() !== "string" ||
    workflow.name().trim().length === 0
  ) {
    issues.push("missing_name");
  }

  if (
    typeof workflow.description() !== "string" ||
    workflow.description().trim().length === 0
  ) {
    issues.push("missing_description");
  }

  const capabilities = workflow.capabilities();
  if (!Array.isArray(capabilities) || capabilities.length === 0) {
    issues.push("missing_capabilities");
  } else {
    for (const capability of capabilities) {
      if (
        typeof capability !== "string" ||
        !(WORKFLOW_CAPABILITIES as readonly string[]).includes(capability)
      ) {
        issues.push("invalid_capability");
        break;
      }
    }
  }

  return Object.freeze([...new Set(issues)]);
}

/**
 * Validate a WorkflowDefinition catalog entry.
 */
export function validateWorkflowDefinition(
  definition: WorkflowDefinition,
): readonly WorkflowValidationCode[] {
  const issues: WorkflowValidationCode[] = [];

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
        !(WORKFLOW_CAPABILITIES as readonly string[]).includes(capability)
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

export type { WorkflowCapability };
