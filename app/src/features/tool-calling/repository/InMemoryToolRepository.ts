import type { ToolDefinition } from "../models/ToolDefinition";
import { ToolError } from "../models/ToolError";
import { validateToolDefinition } from "../validators/validateTool";
import type { ToolRepository } from "./ToolRepository";

/**
 * Ephemeral in-process ToolRepository.
 *
 * Suitable for tests and offline catalogs — not durable storage.
 */
export class InMemoryToolRepository implements ToolRepository {
  private readonly definitions = new Map<string, ToolDefinition>();

  async listDefinitions(): Promise<readonly ToolDefinition[]> {
    return Object.freeze(
      [...this.definitions.values()].map((definition) =>
        cloneDefinition(definition),
      ),
    );
  }

  async getDefinition(name: string): Promise<ToolDefinition | null> {
    const definition = this.definitions.get(name);
    return definition ? cloneDefinition(definition) : null;
  }

  async saveDefinition(definition: ToolDefinition): Promise<ToolDefinition> {
    const issues = validateToolDefinition(definition);
    if (issues.length > 0) {
      throw new ToolError(
        "invalid_definition",
        `Invalid tool definition: ${issues.join(",")}`,
        { toolName: definition.name, issues },
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
  seed(definitions: readonly ToolDefinition[]): void {
    this.definitions.clear();
    for (const definition of definitions) {
      this.definitions.set(definition.name, cloneDefinition(definition));
    }
  }
}

function cloneDefinition(definition: ToolDefinition): ToolDefinition {
  return Object.freeze({
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    capabilities: Object.freeze([...definition.capabilities]),
    schema: Object.freeze({
      parameters: Object.freeze(
        definition.schema.parameters.map((parameter) =>
          Object.freeze({ ...parameter }),
        ),
      ),
      returns: definition.schema.returns,
    }),
    metadata: Object.freeze({
      version: definition.metadata.version,
      tags: Object.freeze([...definition.metadata.tags]),
      createdAt: definition.metadata.createdAt,
    }),
  });
}
