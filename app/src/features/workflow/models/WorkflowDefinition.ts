import type { WorkflowCapability } from "./WorkflowCapability";
import type { WorkflowMetadata } from "./WorkflowMetadata";

/** Immutable catalog entry describing an available workflow. */
export interface WorkflowDefinition {
  readonly name: string;
  readonly description: string;
  readonly capabilities: readonly WorkflowCapability[];
  readonly metadata: WorkflowMetadata;
}
