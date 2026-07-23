import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import type { AdapterResolver } from "./AdapterResolver";

/**
 * Resolve whether a capability (tool id) is available via adapters.
 * No execution.
 */
export class CapabilityResolver {
  readonly id = "resolver:capability:default";

  constructor(private readonly adapterResolver: AdapterResolver) {}

  canExecute(toolId: string): boolean {
    const adapter = this.adapterResolver.resolveByToolId(toolId);
    return adapter != null && adapter.canHandle(toolId);
  }

  resolveAdapter(toolId: string): IDomainToolAdapter | null {
    if (!this.canExecute(toolId)) return null;
    return this.adapterResolver.resolveByToolId(toolId);
  }

  listAvailableToolIds(): readonly string[] {
    const ids: string[] = [];
    for (const adapter of this.adapterResolver.listAdapters()) {
      ids.push(...adapter.supportedToolIds());
    }
    return Object.freeze(ids.sort((a, b) => a.localeCompare(b)));
  }
}
