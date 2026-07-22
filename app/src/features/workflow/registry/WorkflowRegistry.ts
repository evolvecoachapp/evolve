import type { WorkflowCapability } from "../models/WorkflowCapability";
import type { WorkflowDefinition } from "../models/WorkflowDefinition";
import type { AIWorkflow } from "../workflows/AIWorkflow";

/**
 * Immutable catalog of executable workflows.
 *
 * Registration happens before freeze; lookups never mutate.
 */
export interface WorkflowRegistry {
  /** Register a workflow before the registry is frozen. */
  register(workflow: AIWorkflow): void;
  get(name: string): AIWorkflow | null;
  has(name: string): boolean;
  list(): readonly AIWorkflow[];
  listDefinitions(): readonly WorkflowDefinition[];
  listCapabilities(): readonly WorkflowCapability[];
  /** Whether further registration is blocked. */
  isFrozen(): boolean;
}
