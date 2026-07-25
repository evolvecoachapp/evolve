/**
 * Sprint 22.3 — Decision Engine generator part 2
 * (utils, contracts, analysis, evaluation, planning, resolution, builders).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/decision-engine");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "utils/FreezeDecisionState.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConfidence } from "../models/DecisionConfidence";
import type { DecisionConflict } from "../models/DecisionConflict";
import type { DecisionConstraint } from "../models/DecisionConstraint";
import type { DecisionContext } from "../models/DecisionContext";
import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionDiagnostics } from "../models/DecisionDiagnostics";
import type { DecisionEvaluation } from "../models/DecisionEvaluation";
import type { DecisionGraph, DecisionGraphEdge, DecisionGraphNode } from "../models/DecisionGraph";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionMetadata } from "../models/DecisionMetadata";
import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionPlan } from "../models/DecisionPlan";
import type { DecisionPriority } from "../models/DecisionPriority";
import type { DecisionReason } from "../models/DecisionReason";
import type { DecisionRecommendationReference } from "../models/DecisionRecommendationReference";
import type { DecisionResolution } from "../models/DecisionResolution";
import type { DecisionResult } from "../models/DecisionResult";
import type { DecisionScore } from "../models/DecisionScore";
import type { DecisionSnapshot } from "../models/DecisionSnapshot";
import type { DecisionState } from "../models/DecisionState";
import type { DecisionStatistics } from "../models/DecisionStatistics";
import type { DecisionStep } from "../models/DecisionStep";
import type { DecisionSummary } from "../models/DecisionSummary";
import type {
  DecisionTimeline,
  DecisionTimelineItem,
} from "../models/DecisionTimeline";
import type { DecisionValidation } from "../models/DecisionValidation";
import type { RecommendationEngineInput } from "../models/RecommendationEngineInput";

export function freezeMetadata(metadata: DecisionMetadata): DecisionMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezePriority(priority: DecisionPriority): DecisionPriority {
  return Object.freeze({ ...priority });
}

export function freezeConfidence(
  confidence: DecisionConfidence,
): DecisionConfidence {
  return Object.freeze({
    ...confidence,
    notes: Object.freeze([...confidence.notes]),
  });
}

export function freezeScore(score: DecisionScore): DecisionScore {
  return Object.freeze({ ...score });
}

export function freezeReason(reason: DecisionReason): DecisionReason {
  return Object.freeze({
    ...reason,
    evidenceKeys: Object.freeze([...reason.evidenceKeys]),
    metadata: freezeMetadata(reason.metadata),
  });
}

export function freezeConstraint(
  constraint: DecisionConstraint,
): DecisionConstraint {
  return Object.freeze({
    ...constraint,
    subjectKeys: Object.freeze([...constraint.subjectKeys]),
    metadata: freezeMetadata(constraint.metadata),
  });
}

export function freezeDependency(
  dependency: DecisionDependency,
): DecisionDependency {
  return Object.freeze({
    ...dependency,
    metadata: freezeMetadata(dependency.metadata),
  });
}

export function freezeConflict(conflict: DecisionConflict): DecisionConflict {
  return Object.freeze({
    ...conflict,
    metadata: freezeMetadata(conflict.metadata),
  });
}

export function freezeResolution(
  resolution: DecisionResolution,
): DecisionResolution {
  return Object.freeze({
    ...resolution,
    loserIds: Object.freeze([...resolution.loserIds]),
    notes: Object.freeze([...resolution.notes]),
    metadata: freezeMetadata(resolution.metadata),
  });
}

export function freezeRecommendationRef(
  ref: DecisionRecommendationReference,
): DecisionRecommendationReference {
  return Object.freeze({
    ...ref,
    metadata: freezeMetadata(ref.metadata),
  });
}

export function freezeCandidate(
  candidate: DecisionCandidate,
): DecisionCandidate {
  return Object.freeze({
    ...candidate,
    priority: freezePriority(candidate.priority),
    confidence: freezeConfidence(candidate.confidence),
    reasons: Object.freeze(candidate.reasons.map(freezeReason)),
    sourceKeys: Object.freeze([...candidate.sourceKeys]),
    metadata: freezeMetadata(candidate.metadata),
  });
}

export function freezeDecision(decision: CoachingDecision): CoachingDecision {
  return Object.freeze({
    ...decision,
    priority: freezePriority(decision.priority),
    confidence: freezeConfidence(decision.confidence),
    score: freezeScore(decision.score),
    reasons: Object.freeze(decision.reasons.map(freezeReason)),
    constraints: Object.freeze(decision.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(decision.dependencies.map(freezeDependency)),
    recommendationRefs: Object.freeze(
      decision.recommendationRefs.map(freezeRecommendationRef),
    ),
    sourceKeys: Object.freeze([...decision.sourceKeys]),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeEvaluation(
  evaluation: DecisionEvaluation,
): DecisionEvaluation {
  return Object.freeze({
    ...evaluation,
    score: freezeScore(evaluation.score),
    confidence: freezeConfidence(evaluation.confidence),
    violations: Object.freeze([...evaluation.violations]),
    notes: Object.freeze([...evaluation.notes]),
    metadata: freezeMetadata(evaluation.metadata),
  });
}

export function freezeStep(step: DecisionStep): DecisionStep {
  return Object.freeze({
    ...step,
    dependsOn: Object.freeze([...step.dependsOn]),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezePlan(plan: DecisionPlan): DecisionPlan {
  return Object.freeze({
    ...plan,
    steps: Object.freeze(plan.steps.map(freezeStep)),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeGraphNode(node: DecisionGraphNode): DecisionGraphNode {
  return Object.freeze({ ...node });
}

export function freezeGraphEdge(edge: DecisionGraphEdge): DecisionGraphEdge {
  return Object.freeze({ ...edge });
}

export function freezeGraph(graph: DecisionGraph): DecisionGraph {
  return Object.freeze({
    ...graph,
    nodes: Object.freeze(graph.nodes.map(freezeGraphNode)),
    edges: Object.freeze(graph.edges.map(freezeGraphEdge)),
    roots: Object.freeze([...graph.roots]),
    leaves: Object.freeze([...graph.leaves]),
    metadata: freezeMetadata(graph.metadata),
  });
}

export function freezeSummary(summary: DecisionSummary): DecisionSummary {
  return Object.freeze({
    ...summary,
    focusAreas: Object.freeze([...summary.focusAreas]),
    metadata: freezeMetadata(summary.metadata),
  });
}

export function freezeSnapshot(snapshot: DecisionSnapshot): DecisionSnapshot {
  return Object.freeze({
    ...snapshot,
    decisions: Object.freeze(snapshot.decisions.map(freezeDecision)),
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeStatistics(
  statistics: DecisionStatistics,
): DecisionStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeDiagnostics(
  diagnostics: DecisionDiagnostics,
): DecisionDiagnostics {
  return Object.freeze({
    warnings: Object.freeze([...diagnostics.warnings]),
    notes: Object.freeze([...diagnostics.notes]),
    missingSources: Object.freeze([...diagnostics.missingSources]),
    blockedCandidates: Object.freeze([...diagnostics.blockedCandidates]),
  });
}

export function freezeTimelineItem(
  item: DecisionTimelineItem,
): DecisionTimelineItem {
  return Object.freeze({
    ...item,
    metadata: freezeMetadata(item.metadata),
  });
}

export function freezeTimeline(timeline: DecisionTimeline): DecisionTimeline {
  return Object.freeze({
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(timeline.metadata),
  });
}

export function freezeContext(context: DecisionContext): DecisionContext {
  return Object.freeze({
    ...context,
    focusAreas: Object.freeze([...context.focusAreas]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeInput(input: DecisionInput): DecisionInput {
  return Object.freeze({
    ...input,
    decisionContext: input.decisionContext
      ? freezeContext(input.decisionContext)
      : null,
    decisions: Object.freeze(input.decisions.map(freezeDecision)),
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezeRecommendationInput(
  input: RecommendationEngineInput,
): RecommendationEngineInput {
  return Object.freeze({
    ...input,
    decisionIds: Object.freeze([...input.decisionIds]),
    recommendations: Object.freeze(
      input.recommendations.map(freezeRecommendationRef),
    ),
    summary: input.summary ? freezeSummary(input.summary) : null,
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezePackage(pkg: DecisionPackage): DecisionPackage {
  return Object.freeze({
    ...pkg,
    decisionContext: freezeContext(pkg.decisionContext),
    candidates: Object.freeze(pkg.candidates.map(freezeCandidate)),
    decisions: Object.freeze(pkg.decisions.map(freezeDecision)),
    evaluations: Object.freeze(pkg.evaluations.map(freezeEvaluation)),
    conflicts: Object.freeze(pkg.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(pkg.resolutions.map(freezeResolution)),
    constraints: Object.freeze(pkg.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(pkg.dependencies.map(freezeDependency)),
    plan: pkg.plan ? freezePlan(pkg.plan) : null,
    graph: pkg.graph ? freezeGraph(pkg.graph) : null,
    summary: pkg.summary ? freezeSummary(pkg.summary) : null,
    snapshot: pkg.snapshot ? freezeSnapshot(pkg.snapshot) : null,
    statistics: freezeStatistics(pkg.statistics),
    diagnostics: freezeDiagnostics(pkg.diagnostics),
    timeline: freezeTimeline(pkg.timeline),
    recommendationInput: pkg.recommendationInput
      ? freezeRecommendationInput(pkg.recommendationInput)
      : null,
    metadata: freezeMetadata(pkg.metadata),
  });
}

export function freezeValidation(
  validation: DecisionValidation,
): DecisionValidation {
  return Object.freeze({
    valid: validation.valid,
    errors: Object.freeze([...validation.errors]),
    warnings: Object.freeze([...validation.warnings]),
  });
}

export function freezeDescriptor(
  descriptor: DecisionDescriptor,
): DecisionDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    categories: Object.freeze([...descriptor.categories]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeResult(result: DecisionResult): DecisionResult {
  return Object.freeze({
    ...result,
    decisions: Object.freeze(result.decisions.map(freezeDecision)),
    package: result.package ? freezePackage(result.package) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    recommendationInput: result.recommendationInput
      ? freezeRecommendationInput(result.recommendationInput)
      : null,
    validation: result.validation ? freezeValidation(result.validation) : null,
    descriptor: result.descriptor ? freezeDescriptor(result.descriptor) : null,
    errors: Object.freeze([...result.errors]),
  });
}

export function freezeState(state: DecisionState): DecisionState {
  return Object.freeze({
    ...state,
    package: state.package ? freezePackage(state.package) : null,
    decisions: Object.freeze(state.decisions.map(freezeDecision)),
  });
}
`,
);

write(
  "utils/DecisionHelpers.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionCategory } from "../models/DecisionCategory";
import {
  DEFAULT_DECISION_PRIORITIES,
  type DecisionPriority,
} from "../models/DecisionPriority";
import type { CoachingDecision } from "../models/CoachingDecision";
import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";

export function priorityForCategory(
  category: DecisionCategory,
): DecisionPriority {
  const found = DEFAULT_DECISION_PRIORITIES.find((p) => p.category === category);
  return (
    found ??
    Object.freeze({
      category,
      ordinal: 99,
      label: category,
    })
  );
}

export function presentSourceKeys(
  context: UnifiedCoachingContext,
): readonly string[] {
  const keys: string[] = [];
  if (context.athlete) keys.push("athlete");
  if (context.session) keys.push("session");
  if (context.conversation) keys.push("conversation");
  if (context.workout) keys.push("workout");
  if (context.nutrition) keys.push("nutrition");
  if (context.recovery) keys.push("recovery");
  if (context.goal) keys.push("goal");
  if (context.supervisor) keys.push("supervisor");
  return Object.freeze(keys);
}

export function sortCandidatesByPriority(
  candidates: readonly DecisionCandidate[],
): readonly DecisionCandidate[] {
  return Object.freeze(
    [...candidates].sort(
      (a, b) =>
        a.priority.ordinal - b.priority.ordinal || a.id.localeCompare(b.id),
    ),
  );
}

export function sortDecisionsByPriority(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  return Object.freeze(
    [...decisions].sort(
      (a, b) =>
        a.priority.ordinal - b.priority.ordinal || a.id.localeCompare(b.id),
    ),
  );
}

export function decisionIds(
  decisions: readonly CoachingDecision[],
): readonly string[] {
  return Object.freeze(decisions.map((d) => d.id));
}
`,
);

write(
  "utils/GraphHelpers.ts",
  `import type {
  DecisionGraph,
  DecisionGraphEdge,
  DecisionGraphNode,
} from "../models/DecisionGraph";

export function collectRoots(
  nodes: readonly DecisionGraphNode[],
  edges: readonly DecisionGraphEdge[],
): readonly string[] {
  const targets = new Set(edges.map((e) => e.toId));
  return Object.freeze(
    nodes.filter((n) => !targets.has(n.id)).map((n) => n.id),
  );
}

export function collectLeaves(
  nodes: readonly DecisionGraphNode[],
  edges: readonly DecisionGraphEdge[],
): readonly string[] {
  const sources = new Set(edges.map((e) => e.fromId));
  return Object.freeze(
    nodes.filter((n) => !sources.has(n.id)).map((n) => n.id),
  );
}

export function hasCycle(graph: DecisionGraph): boolean {
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) adj.set(node.id, []);
  for (const edge of graph.edges) {
    adj.get(edge.fromId)?.push(edge.toId);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of adj.get(id) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  for (const node of graph.nodes) {
    if (dfs(node.id)) return true;
  }
  return false;
}
`,
);

write(
  "utils/PriorityHelpers.ts",
  `import type { DecisionCategory } from "../models/DecisionCategory";
import { priorityForCategory } from "./DecisionHelpers";

export function compareCategoryPriority(
  left: DecisionCategory,
  right: DecisionCategory,
): number {
  return (
    priorityForCategory(left).ordinal - priorityForCategory(right).ordinal
  );
}

export function isHigherPriority(
  left: DecisionCategory,
  right: DecisionCategory,
): boolean {
  return compareCategoryPriority(left, right) < 0;
}
`,
);

write(
  "utils/StatisticsHelpers.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionStatistics } from "../models/DecisionStatistics";

export function computeStatistics(input: {
  readonly candidateCount: number;
  readonly decisionCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly constraintCount: number;
  readonly dependencyCount: number;
  readonly stepCount: number;
  readonly graphNodeCount: number;
  readonly graphEdgeCount: number;
}): DecisionStatistics {
  return Object.freeze({ ...input });
}

export function statisticsFromPackage(
  pkg: DecisionPackage,
): DecisionStatistics {
  return computeStatistics({
    candidateCount: pkg.candidates.length,
    decisionCount: pkg.decisions.length,
    conflictCount: pkg.conflicts.length,
    resolutionCount: pkg.resolutions.length,
    constraintCount: pkg.constraints.length,
    dependencyCount: pkg.dependencies.length,
    stepCount: pkg.plan?.steps.length ?? 0,
    graphNodeCount: pkg.graph?.nodes.length ?? 0,
    graphEdgeCount: pkg.graph?.edges.length ?? 0,
  });
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionSummary } from "../models/DecisionSummary";

export function formatDecisionHeadline(
  decisions: readonly CoachingDecision[],
): string {
  if (decisions.length === 0) return "No coaching decisions";
  const primary = decisions[0]!;
  return \`\${decisions.length} decision(s); primary=\${primary.category}:\${primary.intent}\`;
}

export function formatSummaryLine(summary: DecisionSummary): string {
  return \`\${summary.headline} [\${summary.focusAreas.join(", ")}]\`;
}
`,
);

write(
  "utils/index.ts",
  `export * from "./FreezeDecisionState";
export * from "./DecisionHelpers";
export * from "./GraphHelpers";
export * from "./PriorityHelpers";
export * from "./StatisticsHelpers";
export * from "./FormattingHelpers";
`,
);

// Contracts
write(
  "contracts/ContextFusionPort.ts",
  `import type { DecisionEngineContext } from "../../context-fusion/models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
import { buildEmptyUnifiedContext } from "../../context-fusion/builders/UnifiedContextBuilder";
import { EMPTY_CONTEXT_METADATA } from "../../context-fusion/models/ContextMetadata";
import { INITIAL_CONTEXT_VERSION } from "../../context-fusion/models/ContextVersion";

/**
 * Upstream Context Fusion contract — Decision Engine consumes fused context only.
 */
export interface ContextFusionPort {
  loadUnifiedContext(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): UnifiedCoachingContext | null;

  loadDecisionEngineContext(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): DecisionEngineContext | null;
}

export function createMockContextFusionPort(
  overrides: Partial<UnifiedCoachingContext> = {},
): ContextFusionPort {
  return {
    loadUnifiedContext(input) {
      const base = buildEmptyUnifiedContext({
        id: input.contextId,
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        at: input.at,
      });
      const athlete = Object.freeze({
        id: "slice:athlete:mock",
        sourceKind: "athlete" as const,
        referenceId: input.athleteId,
        label: "athlete",
        facts: Object.freeze({ ready: true as const }),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: input.at,
      });
      const workout = Object.freeze({
        id: "slice:workout:mock",
        sourceKind: "workout" as const,
        referenceId: "workout:mock",
        label: "workout",
        facts: Object.freeze({ focus: "strength" as const }),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: input.at,
      });
      const recovery = Object.freeze({
        id: "slice:recovery:mock",
        sourceKind: "recovery" as const,
        referenceId: "recovery:mock",
        label: "recovery",
        facts: Object.freeze({ status: "available" as const }),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: input.at,
      });
      return Object.freeze({
        ...base,
        ...overrides,
        athlete: "athlete" in overrides ? overrides.athlete ?? null : athlete,
        workout: "workout" in overrides ? overrides.workout ?? null : workout,
        recovery: "recovery" in overrides ? overrides.recovery ?? null : recovery,
        sources: Object.freeze([
          Object.freeze({
            id: "source:athlete",
            kind: "athlete" as const,
            label: "athlete",
            referenceId: input.athleteId,
            version: INITIAL_CONTEXT_VERSION,
            available: true,
            notes: Object.freeze([] as string[]),
            metadata: EMPTY_CONTEXT_METADATA,
            contributedAt: input.at,
          }),
          Object.freeze({
            id: "source:workout",
            kind: "workout" as const,
            label: "workout",
            referenceId: "workout:mock",
            version: INITIAL_CONTEXT_VERSION,
            available: true,
            notes: Object.freeze([] as string[]),
            metadata: EMPTY_CONTEXT_METADATA,
            contributedAt: input.at,
          }),
          Object.freeze({
            id: "source:recovery",
            kind: "recovery" as const,
            label: "recovery",
            referenceId: "recovery:mock",
            version: INITIAL_CONTEXT_VERSION,
            available: true,
            notes: Object.freeze([] as string[]),
            metadata: EMPTY_CONTEXT_METADATA,
            contributedAt: input.at,
          }),
        ]),
      });
    },
    loadDecisionEngineContext(input) {
      const context = this.loadUnifiedContext(input);
      if (!context) return null;
      return Object.freeze({
        id: \`dec-ctx:\${input.contextId}\`,
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        contextId: input.contextId,
        version: context.version,
        context,
        summary: context.summary,
        focusAreas: Object.freeze(["training", "recovery"]),
        metadata: EMPTY_CONTEXT_METADATA,
        createdAt: input.at,
      });
    },
  };
}
`,
);

write(
  "contracts/AthleteStatePort.ts",
  `/**
 * Upstream Athlete State Engine contract — facts presence only.
 */
export interface AthleteStatePort {
  hasAthleteState(input: {
    readonly athleteId: string;
  }): boolean;
}

export function createMockAthleteStatePort(
  present = true,
): AthleteStatePort {
  return {
    hasAthleteState() {
      return present;
    },
  };
}
`,
);

write(
  "contracts/CoachSupervisorPort.ts",
  `/**
 * Coach Supervisor contract — coordination flags only (no orchestration here).
 */
export interface CoachSupervisorPort {
  describeSupervisorFocus(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
  }): readonly string[];
}

export function createMockCoachSupervisorPort(
  focus: readonly string[] = Object.freeze(["orchestration"]),
): CoachSupervisorPort {
  return {
    describeSupervisorFocus() {
      return Object.freeze([...focus]);
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./ContextFusionPort";
export * from "./AthleteStatePort";
export * from "./CoachSupervisorPort";
`,
);

// Analysis modules
const analyses = [
  ["Training", "training", "workout"],
  ["Nutrition", "nutrition", "nutrition"],
  ["Recovery", "recovery", "recovery"],
  ["Goal", "goal", "goal"],
  ["Lifestyle", "lifestyle", "conversation"],
];

for (const [name, category, sourceKey] of analyses) {
  write(
    `analysis/${name}Analysis.ts`,
    `import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic ${category} analysis — structural presence only.
 * No domain calculations. No AI.
 */
export function analyze${name}(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  const slice = ctx.${sourceKey === "conversation" ? "conversation" : sourceKey};
  if (!slice) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: \`candidate:${category}:continue\`,
      category: DecisionCategories.${category.toUpperCase() === "LIFESTYLE" ? "LIFESTYLE" : category.toUpperCase()},
      intent: DecisionIntents.CONTINUE,
      title: \`Continue ${category} orchestration\`,
      priority: priorityForCategory(DecisionCategories.${category.toUpperCase() === "LIFESTYLE" ? "LIFESTYLE" : category.toUpperCase()}),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 60,
        evidenceCount: 1,
        notes: Object.freeze([\`source:\${slice.sourceKind} present\`]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "${category}.source_present",
          category: "${category}",
          statement: "${name} source slice is available in unified context",
          evidenceKeys: Object.freeze(["${sourceKey}"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["${sourceKey}"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
`,
  );
}

write(
  "analysis/ConsistencyAnalysis.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { presentSourceKeys, priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic consistency analysis — source-set structural checks only.
 */
export function analyzeConsistency(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const keys = presentSourceKeys(input.decisionContext.unified);
  if (keys.length >= 2) {
    return Object.freeze([
      freezeCandidate({
        id: "candidate:orchestration:consistency",
        category: DecisionCategories.ORCHESTRATION,
        intent: DecisionIntents.CONTINUE,
        title: "Maintain multi-source consistency",
        priority: priorityForCategory(DecisionCategories.ORCHESTRATION),
        confidence: Object.freeze({
          level: "high" as const,
          score: 80,
          evidenceCount: keys.length,
          notes: Object.freeze([\`sources=\${keys.length}\`]),
        }),
        reasons: Object.freeze([
          Object.freeze({
            code: "consistency.multi_source",
            category: "orchestration",
            statement: "Multiple fused sources are present",
            evidenceKeys: keys,
            metadata: EMPTY_DECISION_METADATA,
          }),
        ]),
        sourceKeys: keys,
        metadata: EMPTY_DECISION_METADATA,
      }),
    ]);
  }
  return Object.freeze([]);
}
`,
);

write(
  "analysis/RiskAnalysis.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic risk analysis — missing safety-critical sources only.
 * No domain risk scoring.
 */
export function analyzeRisk(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  if (ctx.athlete && ctx.recovery) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: "candidate:safety:block_incomplete",
      category: DecisionCategories.SAFETY,
      intent: DecisionIntents.BLOCK,
      title: "Block incomplete safety context",
      priority: priorityForCategory(DecisionCategories.SAFETY),
      confidence: Object.freeze({
        level: "high" as const,
        score: 90,
        evidenceCount: 1,
        notes: Object.freeze(["missing athlete or recovery slice"]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "risk.incomplete_safety_sources",
          category: "safety",
          statement: "Athlete or recovery source missing from fused context",
          evidenceKeys: Object.freeze(["athlete", "recovery"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(
        [ctx.athlete ? "athlete" : null, ctx.recovery ? "recovery" : null].filter(
          Boolean,
        ) as string[],
      ),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
`,
);

write(
  "analysis/PriorityAnalysis.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic priority analysis — emit prioritize candidate when recovery present.
 */
export function analyzePriority(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  if (!input.decisionContext.unified.recovery) return Object.freeze([]);
  return Object.freeze([
    freezeCandidate({
      id: "candidate:recovery:prioritize",
      category: DecisionCategories.RECOVERY,
      intent: DecisionIntents.PRIORITIZE,
      title: "Prioritize recovery orchestration",
      priority: priorityForCategory(DecisionCategories.RECOVERY),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 70,
        evidenceCount: 1,
        notes: Object.freeze(["recovery source present"]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "priority.recovery_present",
          category: "recovery",
          statement: "Recovery source warrants priority consideration",
          evidenceKeys: Object.freeze(["recovery"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["recovery"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
`,
);

write(
  "analysis/DependencyAnalysis.ts",
  `import type { DecisionDependency } from "../models/DecisionDependency";
import { DecisionDependencyKinds } from "../models/DecisionDependency";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import { freezeDependency } from "../utils/FreezeDecisionState";

/**
 * Deterministic dependency analysis — structural edges only.
 */
export function analyzeDependencies(input: {
  readonly candidates: readonly DecisionCandidate[];
}): readonly DecisionDependency[] {
  const deps: DecisionDependency[] = [];
  const recovery = input.candidates.find((c) => c.category === "recovery");
  const training = input.candidates.find((c) => c.category === "training");
  if (recovery && training) {
    deps.push(
      freezeDependency({
        id: "dep:training-requires-recovery",
        kind: DecisionDependencyKinds.REQUIRES,
        fromId: training.id,
        toId: recovery.id,
        required: true,
        metadata: EMPTY_DECISION_METADATA,
      }),
    );
  }
  return Object.freeze(deps);
}
`,
);

write(
  "analysis/ContextAnalysis.ts",
  `import type { DecisionContext } from "../models/DecisionContext";
import { presentSourceKeys } from "../utils/DecisionHelpers";

export interface ContextAnalysisReport {
  readonly sourceKeys: readonly string[];
  readonly hasAthlete: boolean;
  readonly hasSession: boolean;
  readonly conflictCount: number;
  readonly focusAreas: readonly string[];
}

/**
 * Deterministic context analysis — inventory of fused facts only.
 */
export function analyzeContext(input: {
  readonly decisionContext: DecisionContext;
}): ContextAnalysisReport {
  const ctx = input.decisionContext.unified;
  return Object.freeze({
    sourceKeys: presentSourceKeys(ctx),
    hasAthlete: ctx.athlete !== null,
    hasSession: ctx.session !== null,
    conflictCount: ctx.conflicts.length,
    focusAreas: Object.freeze([...input.decisionContext.focusAreas]),
  });
}
`,
);

write(
  "analysis/index.ts",
  `export * from "./TrainingAnalysis";
export * from "./NutritionAnalysis";
export * from "./RecoveryAnalysis";
export * from "./GoalAnalysis";
export * from "./LifestyleAnalysis";
export * from "./ConsistencyAnalysis";
export * from "./RiskAnalysis";
export * from "./PriorityAnalysis";
export * from "./DependencyAnalysis";
export * from "./ContextAnalysis";
`,
);

console.log("generate-decision-engine-part2.mjs: utils/contracts/analysis written");
