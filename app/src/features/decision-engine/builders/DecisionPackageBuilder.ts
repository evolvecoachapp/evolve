import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionContext } from "../models/DecisionContext";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionEvaluation } from "../models/DecisionEvaluation";
import type { DecisionConflict } from "../models/DecisionConflict";
import type { DecisionResolution } from "../models/DecisionResolution";
import type { DecisionConstraint } from "../models/DecisionConstraint";
import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionPlan } from "../models/DecisionPlan";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionSummary } from "../models/DecisionSummary";
import type { DecisionSnapshot } from "../models/DecisionSnapshot";
import type { RecommendationEngineInput } from "../models/RecommendationEngineInput";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { DecisionTimelineEventKinds } from "../models/DecisionTimeline";
import { computeStatistics } from "../utils/StatisticsHelpers";
import { freezePackage } from "../utils/FreezeDecisionState";

export function buildDecisionPackage(input: {
  readonly id: string;
  readonly decisionContext: DecisionContext;
  readonly candidates: readonly DecisionCandidate[];
  readonly decisions: readonly CoachingDecision[];
  readonly evaluations: readonly DecisionEvaluation[];
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutions: readonly DecisionResolution[];
  readonly constraints: readonly DecisionConstraint[];
  readonly dependencies: readonly DecisionDependency[];
  readonly plan: DecisionPlan | null;
  readonly graph: DecisionGraph | null;
  readonly summary: DecisionSummary | null;
  readonly snapshot: DecisionSnapshot | null;
  readonly recommendationInput: RecommendationEngineInput | null;
  readonly warnings?: readonly string[];
  readonly missingSources?: readonly string[];
  readonly blockedCandidates?: readonly string[];
  readonly at: string;
}): DecisionPackage {
  return freezePackage({
    id: input.id,
    athleteId: input.decisionContext.athleteId,
    contextId: input.decisionContext.contextId,
    decisionContext: input.decisionContext,
    candidates: input.candidates,
    decisions: input.decisions,
    evaluations: input.evaluations,
    conflicts: input.conflicts,
    resolutions: input.resolutions,
    constraints: input.constraints,
    dependencies: input.dependencies,
    plan: input.plan,
    graph: input.graph,
    summary: input.summary,
    snapshot: input.snapshot,
    statistics: computeStatistics({
      candidateCount: input.candidates.length,
      decisionCount: input.decisions.length,
      conflictCount: input.conflicts.length,
      resolutionCount: input.resolutions.length,
      constraintCount: input.constraints.length,
      dependencyCount: input.dependencies.length,
      stepCount: input.plan?.steps.length ?? 0,
      graphNodeCount: input.graph?.nodes.length ?? 0,
      graphEdgeCount: input.graph?.edges.length ?? 0,
    }),
    diagnostics: Object.freeze({
      warnings: Object.freeze([...(input.warnings ?? [])]),
      notes: Object.freeze([] as string[]),
      missingSources: Object.freeze([...(input.missingSources ?? [])]),
      blockedCandidates: Object.freeze([...(input.blockedCandidates ?? [])]),
    }),
    timeline: Object.freeze({
      items: Object.freeze([
        Object.freeze({
          id: `timeline:build:${input.id}`,
          kind: DecisionTimelineEventKinds.BUILD,
          label: "Decision package built",
          at: input.at,
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      metadata: EMPTY_DECISION_METADATA,
    }),
    recommendationInput: input.recommendationInput,
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}
