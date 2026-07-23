import type { ITool } from "../contracts/ITool";
import type { IToolRegistry } from "../contracts/IToolRegistry";
import type { ToolCapability } from "../models/ToolCapability";
import type { ToolCategory } from "../models/ToolCategory";
import type { ToolDefinition } from "../models/ToolDefinition";
import type { ToolDescriptor } from "../models/ToolDescriptor";
import { ToolError } from "../models/ToolError";
import type { ToolRegistrySnapshot } from "../models/ToolRegistrySnapshot";
import type { AITool } from "../tools/AITool";
import { adaptAITool } from "../utils/adaptAITool";
import {
  freezeDescriptor,
  freezeRegistrySnapshot,
} from "../utils/freezeObjects";
import { normalizeToolId } from "../utils/normalizeToolId";
import { validateTool } from "../validators/validateTool";
import { validateToolId } from "../validators/validateToolId";
import type { ToolRegistry } from "./ToolRegistry";

/**
 * In-memory Tool Registry.
 *
 * Supports legacy `AITool` registration and foundation `ITool` registration.
 * Mutable until freeze(); thereafter immutable.
 * No business logic.
 */
export class InMemoryToolRegistry implements ToolRegistry {
  private readonly legacyTools = new Map<string, AITool>();
  private readonly tools = new Map<string, ITool>();
  private frozen = false;

  /** Legacy AITool registration. */
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
    const id = normalizeToolId(name);
    if (this.legacyTools.has(name) || this.tools.has(id)) {
      throw new ToolError(
        "duplicate_tool",
        `Tool already registered: ${name}`,
        { toolName: name },
      );
    }

    this.legacyTools.set(name, tool);
    this.tools.set(id, adaptAITool(tool));
  }

  /** Foundation ITool registration. */
  registerITool(tool: ITool): void {
    if (this.frozen) {
      throw new ToolError(
        "registry_frozen",
        "Cannot register tools on a frozen registry.",
        { toolId: tool.id() },
      );
    }

    const id = normalizeToolId(tool.id());
    const idIssues = validateToolId(id);
    if (idIssues.length > 0) {
      throw new ToolError(
        "invalid_tool",
        `Invalid tool id: ${idIssues.join(",")}`,
        { toolId: id, issues: idIssues },
      );
    }

    if (this.tools.has(id)) {
      throw new ToolError(
        "duplicate_tool",
        `Tool already registered: ${id}`,
        { toolId: id },
      );
    }

    this.tools.set(id, tool);
  }

  get(name: string): AITool | null {
    return this.legacyTools.get(name) ?? null;
  }

  has(nameOrId: string): boolean {
    const id = normalizeToolId(nameOrId);
    return this.legacyTools.has(nameOrId) || this.tools.has(id);
  }

  isAvailable(toolId: string): boolean {
    return this.resolve(toolId) !== null;
  }

  resolve(toolId: string): ITool | null {
    return this.tools.get(normalizeToolId(toolId)) ?? null;
  }

  list(): readonly AITool[] {
    return Object.freeze([...this.legacyTools.values()]);
  }

  listFoundationTools(): readonly ITool[] {
    return Object.freeze([...this.tools.values()]);
  }

  listDescriptors(): readonly ToolDescriptor[] {
    return Object.freeze(
      [...this.tools.values()].map((tool) => {
        const def = tool.definition();
        return freezeDescriptor({
          id: def.id,
          name: def.name,
          description: def.description,
          category: def.category,
          capabilities: def.capabilities,
        });
      }),
    );
  }

  listDefinitions(): readonly ToolDefinition[] {
    return Object.freeze(
      [...this.tools.values()].map((tool) => tool.definition()),
    );
  }

  listByCategory(category: ToolCategory): readonly ITool[] {
    return Object.freeze(
      [...this.tools.values()].filter(
        (tool) => tool.definition().category === category,
      ),
    );
  }

  listCapabilities(): readonly ToolCapability[] {
    const capabilities = new Set<ToolCapability>();
    for (const tool of this.tools.values()) {
      for (const capability of tool.definition().capabilities) {
        capabilities.add(capability);
      }
    }
    return Object.freeze([...capabilities]);
  }

  snapshot(
    capturedAt: string = new Date().toISOString(),
  ): ToolRegistrySnapshot {
    const descriptors = this.listDescriptors();
    const categories = new Set<ToolCategory>();
    for (const d of descriptors) {
      categories.add(d.category);
    }

    return freezeRegistrySnapshot({
      toolCount: descriptors.length,
      frozen: this.frozen,
      descriptors,
      categories: Object.freeze([...categories]),
      capabilities: this.listCapabilities(),
      capturedAt,
    });
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

/**
 * IToolRegistry facade over InMemoryToolRegistry.
 */
export class FoundationToolRegistry implements IToolRegistry {
  private readonly inner: InMemoryToolRegistry;

  constructor(inner: InMemoryToolRegistry = new InMemoryToolRegistry()) {
    this.inner = inner;
  }

  getInner(): InMemoryToolRegistry {
    return this.inner;
  }

  register(tool: ITool): void {
    this.inner.registerITool(tool);
  }

  resolve(toolId: string): ITool | null {
    return this.inner.resolve(toolId);
  }

  has(toolId: string): boolean {
    return this.inner.has(toolId);
  }

  isAvailable(toolId: string): boolean {
    return this.inner.isAvailable(toolId);
  }

  list(): readonly ITool[] {
    return this.inner.listFoundationTools();
  }

  listDescriptors(): readonly ToolDescriptor[] {
    return this.inner.listDescriptors();
  }

  listDefinitions(): readonly ToolDefinition[] {
    return this.inner.listDefinitions();
  }

  listByCategory(category: ToolCategory): readonly ITool[] {
    return this.inner.listByCategory(category);
  }

  listCapabilities(): readonly ToolCapability[] {
    return this.inner.listCapabilities();
  }

  snapshot(capturedAt?: string): ToolRegistrySnapshot {
    return this.inner.snapshot(capturedAt);
  }

  isFrozen(): boolean {
    return this.inner.isFrozen();
  }

  freeze(): void {
    this.inner.freeze();
  }
}
