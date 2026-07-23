import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolDescriptor } from "../../tool-calling/models/ToolDescriptor";
import { createDefaultDomainToolAdapters } from "../adapters/createDefaultAdapters";
import { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";
import {
  validateAdapterCollectionIntegrity,
} from "../validators/validateAdapterIntegrity";
import { validateToolCompatibility } from "../validators/validateToolCompatibility";

export interface DomainToolServiceDeps {
  readonly adapters?: readonly IDomainToolAdapter[];
  readonly clock?: () => string;
  readonly nowMs?: () => number;
}

/**
 * Domain Tool Service — resolve adapter, execute, return FoundationToolResult.
 *
 * No domain business logic. Orchestration only.
 */
export class DomainToolService {
  private readonly adaptersByToolId = new Map<string, IDomainToolAdapter>();
  private readonly adapters: IDomainToolAdapter[];
  private readonly clock: () => string;
  private readonly nowMs: () => number;
  private frozen = false;

  constructor(deps: DomainToolServiceDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
    this.adapters = [...(deps.adapters ?? createDefaultDomainToolAdapters())];
    for (const adapter of this.adapters) {
      this.indexAdapter(adapter);
    }
  }

  /**
   * Register an additional adapter (e.g. NutritionToolAdapter).
   * Must be called before freeze().
   */
  registerAdapter(adapter: IDomainToolAdapter): void {
    if (this.frozen) {
      throw new Error("DomainToolService is frozen; cannot register adapters");
    }
    this.adapters.push(adapter);
    this.indexAdapter(adapter);
  }

  freeze(): void {
    this.frozen = true;
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  resolveAdapter(toolId: string): IDomainToolAdapter | null {
    return this.adaptersByToolId.get(toolId) ?? null;
  }

  listAdapters(): readonly IDomainToolAdapter[] {
    return Object.freeze([...this.adapters]);
  }

  listDomainTools(): readonly ToolDescriptor[] {
    const descriptors: ToolDescriptor[] = [];
    for (const adapter of this.adapters) {
      descriptors.push(...adapter.listTools());
    }
    return Object.freeze(descriptors);
  }

  describeDomainTool(toolId: string): ToolDescriptor | null {
    return this.resolveAdapter(toolId)?.describe(toolId) ?? null;
  }

  validateIntegrity(): readonly string[] {
    return validateAdapterCollectionIntegrity(this.adapters);
  }

  /**
   * Resolve adapter → execute → immutable FoundationToolResult.
   */
  async executeDomainTool(
    request: ToolCallRequest,
  ): Promise<FoundationToolResult> {
    const startedMs = this.nowMs();
    const toolId = request.call.toolId;
    const adapter = this.resolveAdapter(toolId);
    const compatibility = validateToolCompatibility(adapter, toolId);

    if (!adapter || compatibility.length > 0) {
      return new FoundationToolResultBuilder()
        .fromRequest({
          requestId: request.id,
          callId: request.call.id,
          toolId,
          completedAt: request.context.now || this.clock(),
          durationMs: this.nowMs() - startedMs,
        })
        .failed("unsupported_tool", "No domain adapter for tool", {
          toolId,
          issues: compatibility,
        })
        .build();
    }

    return adapter.execute(request);
  }

  private indexAdapter(adapter: IDomainToolAdapter): void {
    for (const toolId of adapter.supportedToolIds()) {
      if (this.adaptersByToolId.has(toolId)) {
        throw new Error(`Duplicate domain tool id registration: ${toolId}`);
      }
      this.adaptersByToolId.set(toolId, adapter);
    }
  }
}

export function createDomainToolService(
  deps: DomainToolServiceDeps = {},
): DomainToolService {
  return new DomainToolService(deps);
}
