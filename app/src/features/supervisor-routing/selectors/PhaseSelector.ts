import type { RoutingPhase } from "../models/RoutingPhase";
import {
  ROUTING_PHASE_ORDER,
  RoutingPhaseKinds,
  type RoutingPhaseKind,
} from "../models/RoutingPhase";
import type { RoutingTarget } from "../models/RoutingTarget";

/**
 * Selects phase buckets for targets (deterministic schedule).
 */
export class PhaseSelector {
  select(targets: readonly RoutingTarget[]): readonly RoutingPhase[] {
    const byPhase = new Map<RoutingPhaseKind, string[]>();
    for (const kind of ROUTING_PHASE_ORDER) {
      byPhase.set(kind, []);
    }

    for (const target of targets) {
      const bucket = byPhase.get(target.phase) ?? [];
      bucket.push(target.id);
      byPhase.set(target.phase, bucket);
    }

    // Default: all collaborate-phase targets if none assigned specially
    const collaborate = byPhase.get(RoutingPhaseKinds.COLLABORATE) ?? [];
    if (
      ROUTING_PHASE_ORDER.every(
        (kind) => (byPhase.get(kind) ?? []).length === 0,
      )
    ) {
      // no-op — empty phases
    }

    return Object.freeze(
      ROUTING_PHASE_ORDER.map((kind, index) =>
        Object.freeze({
          id: `phase:${kind}`,
          kind,
          index,
          subjectIds: Object.freeze(
            [...(byPhase.get(kind) ?? [])].sort((a, b) => a.localeCompare(b)),
          ),
          description: kind === RoutingPhaseKinds.COLLABORATE
            ? `Collaborate targets: ${collaborate.length}`
            : null,
        }),
      ).filter((phase) => phase.subjectIds.length > 0 || phase.kind === RoutingPhaseKinds.COLLABORATE),
    );
  }

  defaultPhase(): RoutingPhaseKind {
    return RoutingPhaseKinds.COLLABORATE;
  }
}

export function createPhaseSelector(): PhaseSelector {
  return new PhaseSelector();
}
