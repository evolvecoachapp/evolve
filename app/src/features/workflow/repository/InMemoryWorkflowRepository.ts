import type { WorkflowDefinition } from "../models/WorkflowDefinition";
import { WorkflowError } from "../models/WorkflowError";
import { validateWorkflowDefinition } from "../validators/validateWorkflow";
import type { WorkflowRepository } from "./WorkflowRepository";

/**
 * Ephemeral in-process WorkflowRepository.
 *
 * Suitable for tests and offline catalogs — not durable storage.
 */
export class InMemoryWorkflowRepository implements WorkflowRepository {
  private readonly definitions = new Map<string, WorkflowDefinition>();

  async listDefinitions(): Promise<readonly WorkflowDefinition[]> {
    return Object.freeze(
      [...this.definitions.values()].map((definition) =>
        cloneDefinition(definition),
      ),
    );
  }

  async getDefinition(name: string): Promise<WorkflowDefinition | null> {
    const definition = this.definitions.get(name);
    return definition ? cloneDefinition(definition) : null;
  }

  async saveDefinition(
    definition: WorkflowDefinition,
  ): Promise<WorkflowDefinition> {
    const issues = validateWorkflowDefinition(definition);
    if (issues.length > 0) {
      throw new WorkflowError(
        "invalid_definition",
        `Invalid workflow definition: ${issues.join(",")}`,
        { workflowName: definition.name, issues },
      );
    }

    const cloned = cloneDefinition(definition);
    this.definitions.set(cloned.name, cloned);
    return cloneDefinition(cloned);
  }

  async deleteDefinition(name: string): Promise<boolean> {
    return this.definitions.delete(name);
  }

  /** Test helper — replace catalog synchronously. */
  seed(definitions: readonly WorkflowDefinition[]): void {
    this.definitions.clear();
    for (const definition of definitions) {
      this.definitions.set(definition.name, cloneDefinition(definition));
    }
  }
}

function cloneDefinition(definition: WorkflowDefinition): WorkflowDefinition {
  return Object.freeze({
    name: definition.name,
    description: definition.description,
    capabilities: Object.freeze([...definition.capabilities]),
    metadata: Object.freeze({
      version: definition.metadata.version,
      tags: Object.freeze([...definition.metadata.tags]),
      createdAt: definition.metadata.createdAt,
    }),
  });
}
