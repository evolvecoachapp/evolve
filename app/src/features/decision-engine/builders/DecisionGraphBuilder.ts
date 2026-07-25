import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionGraph } from "../models/DecisionGraph";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { collectLeaves, collectRoots } from "../utils/GraphHelpers";
import { freezeGraph } from "../utils/FreezeDecisionState";

export function buildDecisionGraph(input: {
  readonly id: string;
  readonly candidates: readonly DecisionCandidate[];
  readonly decisions: readonly CoachingDecision[];
  readonly dependencies: readonly DecisionDependency[];
}): DecisionGraph {
  const nodes = [
    ...input.candidates.map((c) =>
      Object.freeze({
        id: c.id,
        kind: "candidate" as const,
        label: c.title,
        category: c.category,
      }),
    ),
    ...input.decisions.map((d) =>
      Object.freeze({
        id: d.id,
        kind: "decision" as const,
        label: d.title,
        category: d.category,
      }),
    ),
  ];
  const edges = [
    ...input.dependencies.map((d) =>
      Object.freeze({
        id: d.id,
        fromId: d.fromId,
        toId: d.toId,
        kind: d.kind,
      }),
    ),
    ...input.decisions.map((d) =>
      Object.freeze({
        id: `edge:candidate-to-${d.id}`,
        fromId: d.id.startsWith("decision:")
          ? d.id.slice("decision:".length)
          : d.id,
        toId: d.id,
        kind: "promotes",
      }),
    ),
  ];
  const candidateIds = new Set(input.candidates.map((c) => c.id));
  const frozenNodes = Object.freeze(nodes);
  const frozenEdges = Object.freeze(
    edges.filter(
      (e) =>
        e.kind !== "promotes" ||
        candidateIds.has(e.fromId),
    ),
  );
  return freezeGraph({
    id: input.id,
    nodes: frozenNodes,
    edges: frozenEdges,
    roots: collectRoots(frozenNodes, frozenEdges),
    leaves: collectLeaves(frozenNodes, frozenEdges),
    metadata: EMPTY_DECISION_METADATA,
  });
}
