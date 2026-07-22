import type { InMemoryWorkflowRegistry } from "../registry/InMemoryWorkflowRegistry";
import type { WorkflowRegistry } from "../registry/WorkflowRegistry";
import { WorkflowError } from "../models/WorkflowError";

/**
 * Freeze a registry so no further workflows can be registered.
 *
 * Accepts InMemoryWorkflowRegistry (or any registry exposing freeze()).
 */
export function freezeWorkflowRegistry(
  registry: WorkflowRegistry,
): WorkflowRegistry {
  if (typeof (registry as InMemoryWorkflowRegistry).freeze === "function") {
    (registry as InMemoryWorkflowRegistry).freeze();
    return registry;
  }

  throw new WorkflowError(
    "registry_not_freezable",
    "Workflow registry does not support freeze().",
  );
}
