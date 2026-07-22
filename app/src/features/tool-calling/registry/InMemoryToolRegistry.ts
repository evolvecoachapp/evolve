import type { ToolCapability } from "../models/ToolCapability";
import type { ToolDefinition } from "../models/ToolDefinition";
import { ToolError } from "../models/ToolError";
import type { AITool } from "../tools/AITool";
import { validateTool } from "../validators/validateTool";
import type { ToolRegistry } from "./ToolRegistry";

/**
 * In-memory ToolRegistry.
 *
 * Mutable until freeze(); thereafter immutable.
 */
export class InMemoryToolRegistry implements ToolRegistry {
  private readonly tools = new Map<string, AITool>();
  private frozen = false;

  register(tool: AITool): void {
    if (this.frozen) {
      throw new ToolError(
        "registry_frozen",
        "Cannot register tools on a frozen registry.",
        { toolName: tool.name() },
      );
    }

    const issues = validateTool(tool);
    if (issues.length > 0) {
      throw new ToolError(
        "invalid_tool",
        `Invalid tool: ${issues.join(",")}`,
        { toolName: tool.name(), issues },
      );
    }

    const name = tool.name();
    if (this.tools.has(name)) {
      throw new ToolError(
        "duplicate_tool",
        `Tool already registered: ${name}`,
        { toolName: name },
      );
    }

    this.tools.set(name, tool);
  }

  get(name: string): AITool | null {
    return this.tools.get(name) ?? null;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): readonly AITool[] {
    return Object.freeze([...this.tools.values()]);
  }

  listDefinitions(): readonly ToolDefinition[] {
    return Object.freeze(
      [...this.tools.values()].map((tool) =>
        Object.freeze({
          name: tool.name(),
          description: tool.description(),
          capabilities: Object.freeze([...tool.capabilities()]),
          metadata: Object.freeze({
            version: "1.0.0",
            tags: Object.freeze([...tool.capabilities()]),
            createdAt: "1970-01-01T00:00:00.000Z",
          }),
        }),
      ),
    );
  }

  listCapabilities(): readonly ToolCapability[] {
    const capabilities = new Set<ToolCapability>();
    for (const tool of this.tools.values()) {
      for (const capability of tool.capabilities()) {
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
