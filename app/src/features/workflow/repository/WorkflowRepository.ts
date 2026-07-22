import type { WorkflowDefinition } from "../models/WorkflowDefinition";

/**
 * Catalog store for available workflow definitions.
 *
 * No durable persistence in this sprint.
 */
export interface WorkflowRepository {
  listDefinitions(): Promise<readonly WorkflowDefinition[]>;
  getDefinition(name: string): Promise<WorkflowDefinition | null>;
  saveDefinition(definition: WorkflowDefinition): Promise<WorkflowDefinition>;
  deleteDefinition(name: string): Promise<boolean>;
}
