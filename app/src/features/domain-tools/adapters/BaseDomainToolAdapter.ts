import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolDefinition } from "../../tool-calling/models/ToolDefinition";
import type { ToolDescriptor } from "../../tool-calling/models/ToolDescriptor";
import { createToolDefinition } from "../../tool-calling/models/ToolDefinition";
import type { ToolCapability } from "../../tool-calling/models/ToolCapability";
import type { ToolSchema } from "../../tool-calling/models/ToolSchema";
import { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";
import type { DomainToolDomain } from "../models/DomainToolDomain";
import { validateAdapterExecutionContext } from "../validators/validateAdapterExecutionContext";

export interface DomainToolCatalogEntry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly capabilities: readonly ToolCapability[];
  readonly schema: ToolSchema;
}

export interface BaseDomainToolAdapterDeps {
  readonly clock?: () => string;
  readonly nowMs?: () => number;
}

/**
 * Shared adapter scaffolding — orchestration only.
 */
export abstract class BaseDomainToolAdapter implements IDomainToolAdapter {
  protected readonly clock: () => string;
  protected readonly nowMs: () => number;
  private readonly catalog: ReadonlyMap<string, ToolDefinition>;

  protected constructor(
    private readonly adapterId: string,
    private readonly adapterDomain: DomainToolDomain,
    entries: readonly DomainToolCatalogEntry[],
    deps: BaseDomainToolAdapterDeps = {},
  ) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
    const map = new Map<string, ToolDefinition>();
    for (const entry of entries) {
      map.set(
        entry.id,
        createToolDefinition({
          id: entry.id,
          name: entry.name,
          description: entry.description,
          category: "domain",
          capabilities: entry.capabilities,
          schema: entry.schema,
          metadata: Object.freeze({
            version: "1.0.0",
            tags: Object.freeze([adapterDomain, entry.id]),
            createdAt: "2026-07-23T00:00:00.000Z",
          }),
        }),
      );
    }
    this.catalog = map;
  }

  id(): string {
    return this.adapterId;
  }

  domain(): DomainToolDomain {
    return this.adapterDomain;
  }

  supportedToolIds(): readonly string[] {
    return Object.freeze([...this.catalog.keys()]);
  }

  canHandle(toolId: string): boolean {
    return this.catalog.has(toolId);
  }

  definition(toolId: string): ToolDefinition | null {
    return this.catalog.get(toolId) ?? null;
  }

  describe(toolId: string): ToolDescriptor | null {
    const definition = this.definition(toolId);
    if (!definition) {
      return null;
    }
    return Object.freeze({
      id: definition.id,
      name: definition.name,
      description: definition.description,
      category: definition.category,
      capabilities: definition.capabilities,
    });
  }

  listTools(): readonly ToolDescriptor[] {
    return Object.freeze(
      [...this.catalog.keys()]
        .map((toolId) => this.describe(toolId))
        .filter((d): d is ToolDescriptor => d !== null),
    );
  }

  async execute(request: ToolCallRequest): Promise<FoundationToolResult> {
    const startedMs = this.nowMs();
    const toolId = request.call.toolId;
    const completedAt = request.context.now || this.clock();
    const base = new FoundationToolResultBuilder().fromRequest({
      requestId: request.id,
      callId: request.call.id,
      toolId,
      completedAt,
    });

    if (!this.canHandle(toolId)) {
      return base
        .withDurationMs(this.nowMs() - startedMs)
        .failed("unsupported_tool", "Adapter does not support tool", {
          toolId,
          adapterId: this.adapterId,
        })
        .build();
    }

    const contextIssues = validateAdapterExecutionContext(request.context);
    if (contextIssues.length > 0) {
      return base
        .withDurationMs(this.nowMs() - startedMs)
        .failed("invalid_context", "Execution context invalid", {
          issues: contextIssues,
        })
        .build();
    }

    try {
      return await this.executeMapped(request, startedMs, base);
    } catch (error: unknown) {
      return base
        .withDurationMs(this.nowMs() - startedMs)
        .failed(
          "execution_failed",
          error instanceof Error ? error.message : "Domain tool failed",
          { toolId, adapterId: this.adapterId },
        )
        .build();
    }
  }

  protected abstract executeMapped(
    request: ToolCallRequest,
    startedMs: number,
    base: FoundationToolResultBuilder,
  ): Promise<FoundationToolResult>;

  protected finishSuccess(
    base: FoundationToolResultBuilder,
    startedMs: number,
    data: unknown,
  ): FoundationToolResult {
    return base
      .withDurationMs(this.nowMs() - startedMs)
      .succeeded(data)
      .build();
  }

  protected finishFailure(
    base: FoundationToolResultBuilder,
    startedMs: number,
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ): FoundationToolResult {
    return base
      .withDurationMs(this.nowMs() - startedMs)
      .failed(code, message, details)
      .build();
  }
}
