import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import type { AdapterResolver } from "../resolver/AdapterResolver";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";

/**
 * Deterministic adapter selection for a step.
 */
export class AdapterSelector {
  readonly id = "selector:adapter:default";

  constructor(private readonly adapterResolver: AdapterResolver) {}

  select(step: ToolExecutionStep): IDomainToolAdapter | null {
    if (step.adapterId) {
      return this.adapterResolver.resolveByAdapterId(step.adapterId);
    }
    if (step.toolId) {
      return this.adapterResolver.resolveByToolId(step.toolId);
    }
    return null;
  }

  selectAllAvailable(): readonly IDomainToolAdapter[] {
    return this.adapterResolver.listAdapters();
  }
}
