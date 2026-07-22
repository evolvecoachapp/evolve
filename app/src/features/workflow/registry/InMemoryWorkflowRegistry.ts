import type { WorkflowCapability } from "../models/WorkflowCapability";
import type { WorkflowDefinition } from "../models/WorkflowDefinition";
import { WorkflowError } from "../models/WorkflowError";
import type { AIWorkflow } from "../workflows/AIWorkflow";
import { validateWorkflow } from "../validators/validateWorkflow";
import type { WorkflowRegistry } from "./WorkflowRegistry";

/**
 * In-memory WorkflowRegistry.
 *
 * Mutable until freeze(); thereafter immutable.
 */
export class InMemoryWorkflowRegistry implements WorkflowRegistry {
  private readonly workflows = new Map<string, AIWorkflow>();
  private frozen = false;

  register(workflow: AIWorkflow): void {
    if (this.frozen) {
      throw new WorkflowError(
        "registry_frozen",
        "Cannot register workflows on a frozen registry.",
        { workflowName: workflow.name() },
      );
    }

    const issues = validateWorkflow(workflow);
    if (issues.length > 0) {
      throw new WorkflowError(
        "invalid_workflow",
        `Invalid workflow: ${issues.join(",")}`,
        { workflowName: workflow.name(), issues },
      );
    }

    const name = workflow.name();
    if (this.workflows.has(name)) {
      throw new WorkflowError(
        "duplicate_workflow",
        `Workflow already registered: ${name}`,
        { workflowName: name },
      );
    }

    this.workflows.set(name, workflow);
  }

  get(name: string): AIWorkflow | null {
    return this.workflows.get(name) ?? null;
  }

  has(name: string): boolean {
    return this.workflows.has(name);
  }

  list(): readonly AIWorkflow[] {
    return Object.freeze([...this.workflows.values()]);
  }

  listDefinitions(): readonly WorkflowDefinition[] {
    return Object.freeze(
      [...this.workflows.values()].map((workflow) =>
        Object.freeze({
          name: workflow.name(),
          description: workflow.description(),
          capabilities: Object.freeze([...workflow.capabilities()]),
          metadata: Object.freeze({
            version: "1.0.0",
            tags: Object.freeze([...workflow.capabilities()]),
            createdAt: "1970-01-01T00:00:00.000Z",
          }),
        }),
      ),
    );
  }

  listCapabilities(): readonly WorkflowCapability[] {
    const capabilities = new Set<WorkflowCapability>();
    for (const workflow of this.workflows.values()) {
      for (const capability of workflow.capabilities()) {
        capabilities.add(capability);
      }
    }
    return Object.freeze([...capabilities]);
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  /** Block further registration. Idempotent. */
  freeze(): this {
    this.frozen = true;
    return this;
  }
}
