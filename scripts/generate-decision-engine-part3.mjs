/**
 * Sprint 22.3 — Decision Engine generator part 3
 * (evaluation, planning, resolution, builders, selectors, policies, validators).
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
  "evaluation/PriorityEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionScore } from "../models/DecisionScore";

/**
 * Deterministic priority evaluation — ordinal table only.
 */
export function evaluatePriority(
  candidate: DecisionCandidate,
): Pick<DecisionScore, "priorityComponent"> {
  const component = Math.max(0, 100 - candidate.priority.ordinal * 10);
  return Object.freeze({ priorityComponent: component });
}
`,
);

write(
  "evaluation/ConstraintEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConstraint } from "../models/DecisionConstraint";

/**
 * Deterministic constraint evaluation — blocking keys only.
 */
export function evaluateConstraints(input: {
  readonly candidate: DecisionCandidate;
  readonly constraints: readonly DecisionConstraint[];
}): readonly string[] {
  const violations: string[] = [];
  for (const constraint of input.constraints) {
    if (!constraint.blocking) continue;
    const hit = constraint.subjectKeys.some((k) =>
      input.candidate.sourceKeys.includes(k) ||
      input.candidate.id === k ||
      input.candidate.category === k,
    );
    if (hit && constraint.kind === "mutual_exclusion") {
      violations.push(constraint.id);
    }
  }
  return Object.freeze(violations);
}
`,
);

write(
  "evaluation/ConsistencyEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";

/**
 * Deterministic consistency evaluation — evidence presence only.
 */
export function evaluateConsistency(
  candidate: DecisionCandidate,
): number {
  if (candidate.sourceKeys.length === 0) return 20;
  if (candidate.sourceKeys.length === 1) return 60;
  return 90;
}
`,
);

write(
  "evaluation/ConflictEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConflict } from "../models/DecisionConflict";
import { DecisionConflictKinds } from "../models/DecisionConflict";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeConflict } from "../utils/FreezeDecisionState";

/**
 * Deterministic conflict detection — mutual exclusion by category intents.
 */
export function evaluateConflicts(input: {
  readonly candidates: readonly DecisionCandidate[];
}): readonly DecisionConflict[] {
  const conflicts: DecisionConflict[] = [];
  const byCategory = new Map<string, DecisionCandidate[]>();
  for (const c of input.candidates) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }
  for (const [category, list] of byCategory) {
    const prioritize = list.find((c) => c.intent === "prioritize");
    const defer = list.find((c) => c.intent === "defer" || c.intent === "block");
    if (prioritize && defer) {
      conflicts.push(
        freezeConflict({
          id: \`conflict:\${category}:priority\`,
          kind: DecisionConflictKinds.PRIORITY,
          leftId: prioritize.id,
          rightId: defer.id,
          description: \`Priority conflict in \${category}\`,
          resolved: false,
          metadata: EMPTY_DECISION_METADATA,
        }),
      );
    }
  }
  // Cross-category: safety block vs training continue
  const safetyBlock = input.candidates.find(
    (c) => c.category === "safety" && c.intent === "block",
  );
  const training = input.candidates.find((c) => c.category === "training");
  if (safetyBlock && training) {
    conflicts.push(
      freezeConflict({
        id: "conflict:safety-vs-training",
        kind: DecisionConflictKinds.MUTUAL_EXCLUSION,
        leftId: safetyBlock.id,
        rightId: training.id,
        description: "Safety block conflicts with training continue",
        resolved: false,
        metadata: EMPTY_DECISION_METADATA,
      }),
    );
  }
  return Object.freeze(conflicts);
}
`,
);

write(
  "evaluation/DependencyEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionDependency } from "../models/DecisionDependency";

/**
 * Deterministic dependency evaluation — missing required targets.
 */
export function evaluateDependencies(input: {
  readonly candidates: readonly DecisionCandidate[];
  readonly dependencies: readonly DecisionDependency[];
}): readonly string[] {
  const ids = new Set(input.candidates.map((c) => c.id));
  const missing: string[] = [];
  for (const dep of input.dependencies) {
    if (!dep.required) continue;
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      missing.push(dep.id);
    }
  }
  return Object.freeze(missing);
}
`,
);

write(
  "evaluation/ConfidenceEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConfidence } from "../models/DecisionConfidence";
import { freezeConfidence } from "../utils/FreezeDecisionState";

/**
 * Deterministic confidence evaluation — structural evidence only.
 */
export function evaluateConfidence(
  candidate: DecisionCandidate,
): DecisionConfidence {
  const evidence = candidate.reasons.length + candidate.sourceKeys.length;
  let level: DecisionConfidence["level"] = "unknown";
  let score = 0;
  if (evidence === 0) {
    level = "unknown";
    score = 0;
  } else if (evidence === 1) {
    level = "low";
    score = 40;
  } else if (evidence === 2) {
    level = "medium";
    score = 65;
  } else if (evidence <= 4) {
    level = "high";
    score = 85;
  } else {
    level = "complete";
    score = 100;
  }
  return freezeConfidence({
    level,
    score,
    evidenceCount: evidence,
    notes: Object.freeze([\`evidence=\${evidence}\`]),
  });
}
`,
);

write(
  "evaluation/RiskEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";

/**
 * Deterministic risk component — category table only (no domain math).
 */
export function evaluateRisk(candidate: DecisionCandidate): number {
  if (candidate.category === "safety") return 100;
  if (candidate.intent === "block") return 90;
  if (candidate.category === "recovery") return 70;
  return 40;
}
`,
);

write(
  "evaluation/ImpactEvaluator.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";

/**
 * Deterministic impact component — intent table only.
 */
export function evaluateImpact(candidate: DecisionCandidate): number {
  switch (candidate.intent) {
    case "block":
      return 100;
    case "prioritize":
      return 80;
    case "escalate":
      return 75;
    case "recommend":
      return 60;
    case "continue":
      return 50;
    case "resolve":
      return 55;
    case "defer":
      return 30;
    default:
      return 40;
  }
}
`,
);

write(
  "evaluation/index.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConstraint } from "../models/DecisionConstraint";
import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionEvaluation } from "../models/DecisionEvaluation";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeEvaluation } from "../utils/FreezeDecisionState";
import { evaluateConfidence } from "./ConfidenceEvaluator";
import { evaluateConsistency } from "./ConsistencyEvaluator";
import { evaluateConstraints } from "./ConstraintEvaluator";
import { evaluateImpact } from "./ImpactEvaluator";
import { evaluatePriority } from "./PriorityEvaluator";
import { evaluateRisk } from "./RiskEvaluator";

export * from "./PriorityEvaluator";
export * from "./ConstraintEvaluator";
export * from "./ConsistencyEvaluator";
export * from "./ConflictEvaluator";
export * from "./DependencyEvaluator";
export * from "./ConfidenceEvaluator";
export * from "./RiskEvaluator";
export * from "./ImpactEvaluator";

/**
 * Full deterministic evaluation of a candidate.
 */
export function evaluateCandidate(input: {
  readonly candidate: DecisionCandidate;
  readonly constraints: readonly DecisionConstraint[];
  readonly dependencies: readonly DecisionDependency[];
  readonly at: string;
}): DecisionEvaluation {
  const { candidate } = input;
  const priority = evaluatePriority(candidate);
  const confidence = evaluateConfidence(candidate);
  const consistency = evaluateConsistency(candidate);
  const risk = evaluateRisk(candidate);
  const impact = evaluateImpact(candidate);
  const violations = evaluateConstraints({
    candidate,
    constraints: input.constraints,
  });
  const total = Math.round(
    (priority.priorityComponent +
      confidence.score +
      consistency +
      risk +
      impact) /
      5,
  );
  return freezeEvaluation({
    id: \`eval:\${candidate.id}\`,
    subjectId: candidate.id,
    score: Object.freeze({
      total,
      priorityComponent: priority.priorityComponent,
      confidenceComponent: confidence.score,
      riskComponent: risk,
      impactComponent: impact,
      consistencyComponent: consistency,
    }),
    confidence,
    passed: violations.length === 0,
    violations,
    notes: Object.freeze([] as string[]),
    metadata: EMPTY_DECISION_METADATA,
    evaluatedAt: input.at,
  });
}
`,
);

// Planning
write(
  "planning/DecisionPlanner.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionPlan } from "../models/DecisionPlan";
import { DecisionStepStatuses } from "../models/DecisionStep";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezePlan } from "../utils/FreezeDecisionState";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

/**
 * Decision planner — ordered steps only, no execution.
 */
export function planDecisions(input: {
  readonly planId: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly at: string;
}): DecisionPlan {
  const ordered = sortDecisionsByPriority(input.decisions);
  const steps = ordered.map((decision, index) =>
    Object.freeze({
      id: \`step:\${decision.id}\`,
      decisionId: decision.id,
      order: index,
      category: decision.category,
      intent: decision.intent,
      status: DecisionStepStatuses.PLANNED,
      dependsOn: Object.freeze(
        index === 0 ? [] : [ordered[index - 1]!.id],
      ) as readonly string[],
      metadata: EMPTY_DECISION_METADATA,
    }),
  );
  return freezePlan({
    id: input.planId,
    athleteId: input.athleteId,
    contextId: input.contextId,
    steps: Object.freeze(steps),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "planning/ExecutionPlanner.ts",
  `import type { DecisionPlan } from "../models/DecisionPlan";
import { DecisionStepStatuses } from "../models/DecisionStep";
import { freezePlan } from "../utils/FreezeDecisionState";

/**
 * Execution planner — marks ready/blocked status only (never executes).
 */
export function planExecution(input: {
  readonly plan: DecisionPlan;
  readonly blockedDecisionIds: readonly string[];
}): DecisionPlan {
  const blocked = new Set(input.blockedDecisionIds);
  return freezePlan({
    ...input.plan,
    steps: Object.freeze(
      input.plan.steps.map((step) =>
        Object.freeze({
          ...step,
          status: blocked.has(step.decisionId)
            ? DecisionStepStatuses.BLOCKED
            : DecisionStepStatuses.READY,
          dependsOn: Object.freeze([...step.dependsOn]),
          metadata: step.metadata,
        }),
      ),
    ),
  });
}
`,
);

write(
  "planning/PriorityPlanner.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

/**
 * Priority planner — stable ordinal ordering only.
 */
export function planByPriority(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  return sortDecisionsByPriority(decisions);
}
`,
);

write(
  "planning/DependencyPlanner.ts",
  `import type { DecisionDependency } from "../models/DecisionDependency";
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
`,
);

write(
  "planning/ResolutionPlanner.ts",
  `import type { DecisionConflict } from "../models/DecisionConflict";
import type {
  DecisionResolution,
  DecisionResolutionStrategy,
} from "../models/DecisionResolution";
import { DecisionResolutionStrategies } from "../models/DecisionResolution";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import { freezeResolution } from "../utils/FreezeDecisionState";
import { isHigherPriority } from "../utils/PriorityHelpers";

/**
 * Resolution planner — chooses deterministic strategies (no heuristics/AI).
 */
export function planResolutions(input: {
  readonly conflicts: readonly DecisionConflict[];
  readonly candidates: readonly DecisionCandidate[];
  readonly at: string;
}): readonly DecisionResolution[] {
  const byId = new Map(input.candidates.map((c) => [c.id, c]));
  return Object.freeze(
    input.conflicts.map((conflict) => {
      const left = byId.get(conflict.leftId);
      const right = byId.get(conflict.rightId);
      let strategy: DecisionResolutionStrategy =
        DecisionResolutionStrategies.HIGHER_PRIORITY;
      let winnerId: string | null = conflict.leftId;
      let loserIds: string[] = [conflict.rightId];

      if (left?.category === "safety" || right?.category === "safety") {
        strategy = DecisionResolutionStrategies.SAFETY_FIRST;
        const safety = left?.category === "safety" ? left : right!;
        const other = safety.id === conflict.leftId ? right! : left!;
        winnerId = safety.id;
        loserIds = [other.id];
      } else if (left && right) {
        if (isHigherPriority(right.category, left.category)) {
          winnerId = right.id;
          loserIds = [left.id];
        }
      }

      return freezeResolution({
        id: \`resolution:\${conflict.id}\`,
        conflictId: conflict.id,
        strategy,
        winnerId,
        loserIds: Object.freeze(loserIds),
        notes: Object.freeze([strategy]),
        metadata: EMPTY_DECISION_METADATA,
        resolvedAt: input.at,
      });
    }),
  );
}
`,
);

write(
  "planning/index.ts",
  `export * from "./DecisionPlanner";
export * from "./ExecutionPlanner";
export * from "./PriorityPlanner";
export * from "./DependencyPlanner";
export * from "./ResolutionPlanner";
`,
);

// Resolution
write(
  "resolution/ConflictResolver.ts",
  `import type { DecisionConflict } from "../models/DecisionConflict";
import type { DecisionResolution } from "../models/DecisionResolution";
import { freezeConflict } from "../utils/FreezeDecisionState";

/**
 * Apply planned resolutions to conflicts — deterministic only.
 */
export function resolveConflicts(input: {
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutions: readonly DecisionResolution[];
}): readonly DecisionConflict[] {
  const resolvedIds = new Set(input.resolutions.map((r) => r.conflictId));
  return Object.freeze(
    input.conflicts.map((c) =>
      freezeConflict({
        ...c,
        resolved: resolvedIds.has(c.id),
      }),
    ),
  );
}
`,
);

write(
  "resolution/PriorityResolver.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

/**
 * Priority resolver — stable sort by ordinal.
 */
export function resolvePriorities(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  return sortDecisionsByPriority(decisions);
}
`,
);

write(
  "resolution/DependencyResolver.ts",
  `import type { DecisionDependency } from "../models/DecisionDependency";
import type { CoachingDecision } from "../models/CoachingDecision";
import { planByDependencies } from "../planning/DependencyPlanner";

/**
 * Dependency resolver — reorder by dependency plan.
 */
export function resolveDependencies(input: {
  readonly decisions: readonly CoachingDecision[];
  readonly dependencies: readonly DecisionDependency[];
}): readonly CoachingDecision[] {
  return planByDependencies(input);
}
`,
);

write(
  "resolution/DecisionResolver.ts",
  `import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionResolution } from "../models/DecisionResolution";
import type { DecisionEvaluation } from "../models/DecisionEvaluation";
import type { CoachingDecision } from "../models/CoachingDecision";
import { DecisionOutcomes } from "../models/DecisionOutcome";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeDecision } from "../utils/FreezeDecisionState";

/**
 * Decision resolver — candidates → immutable CoachingDecisions.
 */
export function resolveDecisions(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly candidates: readonly DecisionCandidate[];
  readonly evaluations: readonly DecisionEvaluation[];
  readonly resolutions: readonly DecisionResolution[];
  readonly at: string;
}): readonly CoachingDecision[] {
  const losers = new Set(
    input.resolutions.flatMap((r) => r.loserIds),
  );
  const evalBySubject = new Map(
    input.evaluations.map((e) => [e.subjectId, e]),
  );

  const decisions: CoachingDecision[] = [];
  for (const candidate of input.candidates) {
    if (losers.has(candidate.id)) continue;
    const evaluation = evalBySubject.get(candidate.id);
    const outcome =
      candidate.intent === "block"
        ? DecisionOutcomes.ACCEPTED
        : evaluation && !evaluation.passed
          ? DecisionOutcomes.REJECTED
          : DecisionOutcomes.ACCEPTED;

    if (outcome === DecisionOutcomes.REJECTED) continue;

    decisions.push(
      freezeDecision({
        id: \`decision:\${candidate.id}\`,
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        contextId: input.contextId,
        category: candidate.category,
        intent: candidate.intent,
        outcome,
        title: candidate.title,
        priority: candidate.priority,
        confidence: evaluation?.confidence ?? candidate.confidence,
        score:
          evaluation?.score ??
          Object.freeze({
            total: 50,
            priorityComponent: 50,
            confidenceComponent: 50,
            riskComponent: 50,
            impactComponent: 50,
            consistencyComponent: 50,
          }),
        reasons: candidate.reasons,
        constraints: Object.freeze([]),
        dependencies: Object.freeze([]),
        recommendationRefs: Object.freeze([
          Object.freeze({
            id: \`rec-ref:\${candidate.id}\`,
            decisionId: \`decision:\${candidate.id}\`,
            category: candidate.category,
            priorityOrdinal: candidate.priority.ordinal,
            intent: candidate.intent,
            metadata: EMPTY_DECISION_METADATA,
          }),
        ]),
        sourceKeys: candidate.sourceKeys,
        metadata: EMPTY_DECISION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(decisions);
}
`,
);

write(
  "resolution/MergeResolver.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import { freezeDecision } from "../utils/FreezeDecisionState";

/**
 * Merge resolver — deterministic de-dupe by category+intent (keep higher score).
 */
export function resolveMerge(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  const best = new Map<string, CoachingDecision>();
  for (const decision of decisions) {
    const key = \`\${decision.category}:\${decision.intent}\`;
    const existing = best.get(key);
    if (!existing || decision.score.total > existing.score.total) {
      best.set(key, decision);
    }
  }
  return Object.freeze([...best.values()].map(freezeDecision));
}
`,
);

write(
  "resolution/index.ts",
  `export * from "./ConflictResolver";
export * from "./PriorityResolver";
export * from "./DependencyResolver";
export * from "./DecisionResolver";
export * from "./MergeResolver";
`,
);

// Builders
write(
  "builders/DecisionBuilder.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import { freezeDecision } from "../utils/FreezeDecisionState";

export function buildCoachingDecision(
  decision: CoachingDecision,
): CoachingDecision {
  return freezeDecision(decision);
}
`,
);

write(
  "builders/DecisionSummaryBuilder.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionSummary } from "../models/DecisionSummary";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { formatDecisionHeadline } from "../utils/FormattingHelpers";
import { freezeSummary } from "../utils/FreezeDecisionState";

export function buildDecisionSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly candidateCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly focusAreas: readonly string[];
}): DecisionSummary {
  const primary = input.decisions[0] ?? null;
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionCount: input.decisions.length,
    candidateCount: input.candidateCount,
    conflictCount: input.conflictCount,
    resolutionCount: input.resolutionCount,
    primaryCategory: primary?.category ?? null,
    headline: formatDecisionHeadline(input.decisions),
    focusAreas: Object.freeze([...input.focusAreas]),
    metadata: EMPTY_DECISION_METADATA,
  });
}
`,
);

write(
  "builders/DecisionGraphBuilder.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
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
        id: \`edge:candidate-to-\${d.id}\`,
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
`,
);

write(
  "builders/DecisionPackageBuilder.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";
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
          id: \`timeline:build:\${input.id}\`,
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
`,
);

write(
  "builders/DecisionDescriptorBuilder.ts",
  `import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import { DecisionCategories } from "../models/DecisionCategory";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeDescriptor } from "../utils/FreezeDecisionState";

export function buildDecisionDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): DecisionDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Decision Engine",
    version: "0.1.0",
    capabilities: Object.freeze([
      "buildDecision",
      "evaluateDecision",
      "resolveDecision",
      "describeDecision",
      "validateDecision",
    ]),
    categories: Object.freeze(Object.values(DecisionCategories)),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/DecisionResultBuilder.ts",
  `import type { DecisionResult } from "../models/DecisionResult";
import type { DecisionOperationKind } from "../models/DecisionResult";
import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionSummary } from "../models/DecisionSummary";
import type { DecisionSnapshot } from "../models/DecisionSnapshot";
import type { RecommendationEngineInput } from "../models/RecommendationEngineInput";
import type { DecisionValidation } from "../models/DecisionValidation";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionError } from "../models/DecisionError";
import { freezeResult } from "../utils/FreezeDecisionState";

export function buildDecisionResult(input: {
  readonly id: string;
  readonly operation: DecisionOperationKind;
  readonly success: boolean;
  readonly decisions?: readonly CoachingDecision[];
  readonly package?: DecisionPackage | null;
  readonly summary?: DecisionSummary | null;
  readonly snapshot?: DecisionSnapshot | null;
  readonly recommendationInput?: RecommendationEngineInput | null;
  readonly validation?: DecisionValidation | null;
  readonly descriptor?: DecisionDescriptor | null;
  readonly errors?: readonly DecisionError[];
  readonly createdAt: string;
}): DecisionResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    decisions: Object.freeze([...(input.decisions ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    recommendationInput: input.recommendationInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/RecommendationEngineInputBuilder.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionSummary } from "../models/DecisionSummary";
import type { RecommendationEngineInput } from "../models/RecommendationEngineInput";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeRecommendationInput } from "../utils/FreezeDecisionState";

export function buildRecommendationEngineInput(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly summary: DecisionSummary | null;
  readonly at: string;
}): RecommendationEngineInput {
  return freezeRecommendationInput({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionIds: Object.freeze(input.decisions.map((d) => d.id)),
    recommendations: Object.freeze(
      input.decisions.flatMap((d) => d.recommendationRefs),
    ),
    summary: input.summary,
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/DecisionContextBuilder.ts",
  `import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
import type { DecisionEngineContext } from "../../context-fusion/models/DecisionEngineContext";
import type { DecisionContext } from "../models/DecisionContext";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeContext } from "../utils/FreezeDecisionState";

export function buildDecisionContext(input: {
  readonly id: string;
  readonly unified: UnifiedCoachingContext;
  readonly handoff: DecisionEngineContext | null;
  readonly at: string;
}): DecisionContext {
  return freezeContext({
    id: input.id,
    athleteId: input.unified.athleteId,
    sessionId: input.unified.sessionId,
    conversationId: input.unified.conversationId,
    contextId: input.unified.id,
    unified: input.unified,
    handoff: input.handoff,
    focusAreas: Object.freeze([
      ...(input.handoff?.focusAreas ?? ["orchestration"]),
    ]),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/index.ts",
  `export * from "./DecisionBuilder";
export * from "./DecisionSummaryBuilder";
export * from "./DecisionGraphBuilder";
export * from "./DecisionPackageBuilder";
export * from "./DecisionDescriptorBuilder";
export * from "./DecisionResultBuilder";
export * from "./RecommendationEngineInputBuilder";
export * from "./DecisionContextBuilder";
`,
);

// Selectors
write(
  "selectors/DecisionSelector.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionCategory } from "../models/DecisionCategory";

export function selectDecisionsByCategory(
  decisions: readonly CoachingDecision[],
  category: DecisionCategory,
): readonly CoachingDecision[] {
  return Object.freeze(decisions.filter((d) => d.category === category));
}

export function selectPrimaryDecision(
  decisions: readonly CoachingDecision[],
): CoachingDecision | null {
  return decisions[0] ?? null;
}
`,
);

write(
  "selectors/PrioritySelector.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

export function selectHighestPriority(
  decisions: readonly CoachingDecision[],
): CoachingDecision | null {
  return sortDecisionsByPriority(decisions)[0] ?? null;
}
`,
);

write(
  "selectors/DependencySelector.ts",
  `import type { DecisionDependency } from "../models/DecisionDependency";

export function selectRequiredDependencies(
  dependencies: readonly DecisionDependency[],
): readonly DecisionDependency[] {
  return Object.freeze(dependencies.filter((d) => d.required));
}
`,
);

write(
  "selectors/OutcomeSelector.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionOutcome } from "../models/DecisionOutcome";

export function selectByOutcome(
  decisions: readonly CoachingDecision[],
  outcome: DecisionOutcome,
): readonly CoachingDecision[] {
  return Object.freeze(decisions.filter((d) => d.outcome === outcome));
}
`,
);

write(
  "selectors/RecommendationSelector.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionRecommendationReference } from "../models/DecisionRecommendationReference";

export function selectRecommendationRefs(
  decisions: readonly CoachingDecision[],
): readonly DecisionRecommendationReference[] {
  return Object.freeze(decisions.flatMap((d) => d.recommendationRefs));
}
`,
);

write(
  "selectors/index.ts",
  `export * from "./DecisionSelector";
export * from "./PrioritySelector";
export * from "./DependencySelector";
export * from "./OutcomeSelector";
export * from "./RecommendationSelector";
`,
);

// Policies
write(
  "policies/DecisionPolicy.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";

export function applyDecisionPolicy(pkg: DecisionPackage): readonly string[] {
  const warnings: string[] = [];
  if (pkg.decisions.length === 0) {
    warnings.push("no_decisions_produced");
  }
  return Object.freeze(warnings);
}
`,
);

write(
  "policies/PriorityPolicy.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";

export function applyPriorityPolicy(
  decisions: readonly CoachingDecision[],
): readonly string[] {
  const warnings: string[] = [];
  for (let i = 1; i < decisions.length; i++) {
    if (decisions[i]!.priority.ordinal < decisions[i - 1]!.priority.ordinal) {
      warnings.push("priority_order_violation");
      break;
    }
  }
  return Object.freeze(warnings);
}
`,
);

write(
  "policies/ConsistencyPolicy.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";

export function applyConsistencyPolicy(
  pkg: DecisionPackage,
): readonly string[] {
  const warnings: string[] = [];
  if (pkg.candidates.length > 0 && pkg.evaluations.length === 0) {
    warnings.push("candidates_without_evaluations");
  }
  return Object.freeze(warnings);
}
`,
);

write(
  "policies/ConflictPolicy.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";

export function applyConflictPolicy(pkg: DecisionPackage): readonly string[] {
  const warnings: string[] = [];
  const unresolved = pkg.conflicts.filter((c) => !c.resolved);
  if (unresolved.length > 0) {
    warnings.push(\`unresolved_conflicts:\${unresolved.length}\`);
  }
  return Object.freeze(warnings);
}
`,
);

write(
  "policies/DependencyPolicy.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";

export function applyDependencyPolicy(
  pkg: DecisionPackage,
): readonly string[] {
  const ids = new Set(pkg.candidates.map((c) => c.id));
  const warnings: string[] = [];
  for (const dep of pkg.dependencies) {
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      warnings.push(\`dangling_dependency:\${dep.id}\`);
    }
  }
  return Object.freeze(warnings);
}
`,
);

write(
  "policies/SafetyPolicy.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";

export function applySafetyPolicy(pkg: DecisionPackage): readonly string[] {
  const warnings: string[] = [];
  const safetyBlock = pkg.decisions.find(
    (d) => d.category === "safety" && d.intent === "block",
  );
  const training = pkg.decisions.find((d) => d.category === "training");
  if (safetyBlock && training) {
    warnings.push("safety_block_with_training_present");
  }
  return Object.freeze(warnings);
}
`,
);

write(
  "policies/index.ts",
  `export * from "./DecisionPolicy";
export * from "./PriorityPolicy";
export * from "./ConsistencyPolicy";
export * from "./ConflictPolicy";
export * from "./DependencyPolicy";
export * from "./SafetyPolicy";
`,
);

// Validators
write(
  "validators/validateDecisionIntegrity.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateDecisionIntegrity(
  decisions: readonly CoachingDecision[],
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  for (const d of decisions) {
    if (!d.id || !d.athleteId || !d.contextId) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Decision missing required identity fields",
          [d.id],
        ),
      );
    }
    if (d.reasons.length === 0) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Decision must include at least one reason",
          [d.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDependencies.ts",
  `import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateDependencies(input: {
  readonly candidates: readonly DecisionCandidate[];
  readonly dependencies: readonly DecisionDependency[];
}): readonly DecisionError[] {
  const ids = new Set(input.candidates.map((c) => c.id));
  const errors: DecisionError[] = [];
  for (const dep of input.dependencies) {
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Dependency references unknown candidate",
          [dep.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validatePriorities.ts",
  `import type { CoachingDecision } from "../models/CoachingDecision";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validatePriorities(
  decisions: readonly CoachingDecision[],
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  for (const d of decisions) {
    if (d.priority.ordinal < 0) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Priority ordinal must be non-negative",
          [d.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateConflicts.ts",
  `import type { DecisionConflict } from "../models/DecisionConflict";
import type { DecisionResolution } from "../models/DecisionResolution";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateConflicts(input: {
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutions: readonly DecisionResolution[];
}): readonly DecisionError[] {
  const resolved = new Set(input.resolutions.map((r) => r.conflictId));
  const errors: DecisionError[] = [];
  for (const c of input.conflicts) {
    if (c.resolved && !resolved.has(c.id)) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Conflict marked resolved without resolution record",
          [c.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateConstraints.ts",
  `import type { DecisionConstraint } from "../models/DecisionConstraint";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateConstraints(
  constraints: readonly DecisionConstraint[],
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  for (const c of constraints) {
    if (c.subjectKeys.length === 0) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Constraint requires subject keys",
          [c.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateConsistency.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateConsistency(
  pkg: DecisionPackage,
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  if (pkg.summary && pkg.summary.decisionCount !== pkg.decisions.length) {
    errors.push(
      createDecisionError(
        DecisionErrorCodes.VALIDATION_FAILED,
        "Summary decisionCount mismatch",
        [pkg.id],
      ),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDecisionGraph.ts",
  `import type { DecisionGraph } from "../models/DecisionGraph";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";
import { hasCycle } from "../utils/GraphHelpers";

export function validateDecisionGraph(
  graph: DecisionGraph | null,
): readonly DecisionError[] {
  if (!graph) return Object.freeze([]);
  const errors: DecisionError[] = [];
  if (hasCycle(graph)) {
    errors.push(
      createDecisionError(
        DecisionErrorCodes.VALIDATION_FAILED,
        "Decision graph contains a cycle",
        [graph.id],
      ),
    );
  }
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromId) || !nodeIds.has(edge.toId)) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Graph edge references unknown node",
          [edge.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDecisionPackage.ts",
  `import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionValidation } from "../models/DecisionValidation";
import { freezeValidation } from "../utils/FreezeDecisionState";
import { validateConflicts } from "./validateConflicts";
import { validateConsistency } from "./validateConsistency";
import { validateConstraints } from "./validateConstraints";
import { validateDecisionGraph } from "./validateDecisionGraph";
import { validateDecisionIntegrity } from "./validateDecisionIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validatePriorities } from "./validatePriorities";

export function validateDecisionPackage(
  pkg: DecisionPackage,
): DecisionValidation {
  const errors = [
    ...validateDecisionIntegrity(pkg.decisions),
    ...validateDependencies({
      candidates: pkg.candidates,
      dependencies: pkg.dependencies,
    }),
    ...validatePriorities(pkg.decisions),
    ...validateConflicts({
      conflicts: pkg.conflicts,
      resolutions: pkg.resolutions,
    }),
    ...validateConstraints(pkg.constraints),
    ...validateConsistency(pkg),
    ...validateDecisionGraph(pkg.graph),
  ];
  return freezeValidation({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([...pkg.diagnostics.warnings]),
  });
}
`,
);

write(
  "validators/index.ts",
  `export * from "./validateDecisionIntegrity";
export * from "./validateDependencies";
export * from "./validatePriorities";
export * from "./validateConflicts";
export * from "./validateConstraints";
export * from "./validateConsistency";
export * from "./validateDecisionGraph";
export * from "./validateDecisionPackage";
`,
);

console.log("generate-decision-engine-part3.mjs: layers written");
