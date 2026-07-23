import type { RoutingPhase } from "../models/RoutingPhase";
import type { RoutingTarget } from "../models/RoutingTarget";
import { createPhaseSelector } from "../selectors/PhaseSelector";

/**
 * Plans phase buckets for routing targets.
 */
export class PhasePlanner {
  private readonly selector = createPhaseSelector();

  plan(targets: readonly RoutingTarget[]): readonly RoutingPhase[] {
    return this.selector.select(targets);
  }
}

export function createPhasePlanner(): PhasePlanner {
  return new PhasePlanner();
}
