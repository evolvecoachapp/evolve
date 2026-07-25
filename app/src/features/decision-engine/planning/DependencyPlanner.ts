import type { DecisionDependency } from "../models/DecisionDependency";
import type { CoachingDecision } from "../models/CoachingDecision";

/**
 * Dependency planner — topological-ish order by requires edges.
 */
export function planByDependencies(input: {
  readonly decisions: readonly CoachingDecision[];
  readonly dependencies: readonly DecisionDependency[];
}): readonly CoachingDecision[] {
  const byId = new Map(input.decisions.map((d) => [d.id, d]));
  const remaining = new Set(input.decisions.map((d) => d.id));
  const ordered: CoachingDecision[] = [];
  const requires = input.dependencies.filter((d) => d.kind === "requires");

  while (remaining.size > 0) {
    let progressed = false;
    for (const id of [...remaining]) {
      const blockers = requires.filter(
        (d) => d.fromId === id && remaining.has(d.toId),
      );
      if (blockers.length === 0) {
        ordered.push(byId.get(id)!);
        remaining.delete(id);
        progressed = true;
      }
    }
    if (!progressed) {
      for (const id of [...remaining]) {
        ordered.push(byId.get(id)!);
        remaining.delete(id);
      }
    }
  }
  return Object.freeze(ordered);
}
