import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";

/**
 * Resolve Domain Tool Adapters by adapter id or tool id.
 * No execution.
 */
export class AdapterResolver {
  readonly id = "resolver:adapter:default";

  private readonly byAdapterId = new Map<string, IDomainToolAdapter>();
  private readonly byToolId = new Map<string, IDomainToolAdapter>();

  constructor(adapters: readonly IDomainToolAdapter[] = []) {
    for (const adapter of adapters) {
      this.register(adapter);
    }
  }

  register(adapter: IDomainToolAdapter): void {
    this.byAdapterId.set(adapter.id(), adapter);
    for (const toolId of adapter.supportedToolIds()) {
      this.byToolId.set(toolId, adapter);
    }
  }

  resolveByAdapterId(adapterId: string): IDomainToolAdapter | null {
    return this.byAdapterId.get(adapterId) ?? null;
  }

  resolveByToolId(toolId: string): IDomainToolAdapter | null {
    return this.byToolId.get(toolId) ?? null;
  }

  listAdapters(): readonly IDomainToolAdapter[] {
    return Object.freeze([...this.byAdapterId.values()]);
  }

  listAdapterIds(): readonly string[] {
    return Object.freeze([...this.byAdapterId.keys()]);
  }

  isAvailable(toolId: string): boolean {
    return this.byToolId.has(toolId);
  }
}
