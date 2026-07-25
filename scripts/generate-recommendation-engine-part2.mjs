/**
 * Sprint 22.4 — Recommendation Engine generator part 2
 * (utils, contracts, planning, prioritization, packaging).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/recommendation-engine");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "utils/FreezeRecommendationState.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationAction } from "../models/RecommendationAction";
import type { RecommendationConfidence } from "../models/RecommendationConfidence";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import type { RecommendationConstraint } from "../models/RecommendationConstraint";
import type { RecommendationContext } from "../models/RecommendationContext";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationDiagnostics } from "../models/RecommendationDiagnostics";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationMetadata } from "../models/RecommendationMetadata";
import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationPlan } from "../models/RecommendationPlan";
import type { RecommendationPriority } from "../models/RecommendationPriority";
import type { RecommendationReference } from "../models/RecommendationReference";
import type { RecommendationResolution } from "../models/RecommendationResolution";
import type { RecommendationResult } from "../models/RecommendationResult";
import type { RecommendationSequence } from "../models/RecommendationSequence";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationState } from "../models/RecommendationState";
import type { RecommendationStatistics } from "../models/RecommendationStatistics";
import type { RecommendationStep } from "../models/RecommendationStep";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import type { RecommendationTarget } from "../models/RecommendationTarget";
import type {
  RecommendationTimeline,
  RecommendationTimelineItem,
} from "../models/RecommendationTimeline";
import type { RecommendationValidation } from "../models/RecommendationValidation";
import type { RecommendationView } from "../models/RecommendationView";

export function freezeMetadata(
  metadata: RecommendationMetadata,
): RecommendationMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezePriority(
  priority: RecommendationPriority,
): RecommendationPriority {
  return Object.freeze({ ...priority });
}

export function freezeConfidence(
  confidence: RecommendationConfidence,
): RecommendationConfidence {
  return Object.freeze({
    ...confidence,
    notes: Object.freeze([...confidence.notes]),
  });
}

export function freezeAction(action: RecommendationAction): RecommendationAction {
  return Object.freeze({
    ...action,
    parameters: Object.freeze({ ...action.parameters }),
    metadata: freezeMetadata(action.metadata),
  });
}

export function freezeStep(step: RecommendationStep): RecommendationStep {
  return Object.freeze({
    ...step,
    action: freezeAction(step.action),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezeSequence(
  sequence: RecommendationSequence,
): RecommendationSequence {
  return Object.freeze({
    ...sequence,
    steps: Object.freeze(sequence.steps.map(freezeStep)),
    metadata: freezeMetadata(sequence.metadata),
  });
}

export function freezeConstraint(
  constraint: RecommendationConstraint,
): RecommendationConstraint {
  return Object.freeze({
    ...constraint,
    subjectKeys: Object.freeze([...constraint.subjectKeys]),
    metadata: freezeMetadata(constraint.metadata),
  });
}

export function freezeDependency(
  dependency: RecommendationDependency,
): RecommendationDependency {
  return Object.freeze({
    ...dependency,
    metadata: freezeMetadata(dependency.metadata),
  });
}

export function freezeConflict(
  conflict: RecommendationConflict,
): RecommendationConflict {
  return Object.freeze({
    ...conflict,
    metadata: freezeMetadata(conflict.metadata),
  });
}

export function freezeResolution(
  resolution: RecommendationResolution,
): RecommendationResolution {
  return Object.freeze({
    ...resolution,
    loserIds: Object.freeze([...resolution.loserIds]),
    notes: Object.freeze([...resolution.notes]),
    metadata: freezeMetadata(resolution.metadata),
  });
}

export function freezeReference(
  ref: RecommendationReference,
): RecommendationReference {
  return Object.freeze({
    ...ref,
    metadata: freezeMetadata(ref.metadata),
  });
}

export function freezeTarget(target: RecommendationTarget): RecommendationTarget {
  return Object.freeze({
    ...target,
    metadata: freezeMetadata(target.metadata),
  });
}

export function freezeGroup(group: RecommendationGroup): RecommendationGroup {
  return Object.freeze({
    ...group,
    recommendationIds: Object.freeze([...group.recommendationIds]),
    metadata: freezeMetadata(group.metadata),
  });
}

export function freezeRecommendation(
  recommendation: CoachingRecommendation,
): CoachingRecommendation {
  return Object.freeze({
    ...recommendation,
    priority: freezePriority(recommendation.priority),
    confidence: freezeConfidence(recommendation.confidence),
    actions: Object.freeze(recommendation.actions.map(freezeAction)),
    sequence: recommendation.sequence
      ? freezeSequence(recommendation.sequence)
      : null,
    constraints: Object.freeze(recommendation.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(
      recommendation.dependencies.map(freezeDependency),
    ),
    targets: Object.freeze(recommendation.targets.map(freezeTarget)),
    sourceKeys: Object.freeze([...recommendation.sourceKeys]),
    metadata: freezeMetadata(recommendation.metadata),
  });
}

export function freezePlan(plan: RecommendationPlan): RecommendationPlan {
  return Object.freeze({
    ...plan,
    orderedIds: Object.freeze([...plan.orderedIds]),
    steps: Object.freeze(plan.steps.map(freezeStep)),
    sequences: Object.freeze(plan.sequences.map(freezeSequence)),
    groups: Object.freeze(plan.groups.map(freezeGroup)),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeSummary(
  summary: RecommendationSummary,
): RecommendationSummary {
  return Object.freeze({
    ...summary,
    focusAreas: Object.freeze([...summary.focusAreas]),
    metadata: freezeMetadata(summary.metadata),
  });
}

export function freezeSnapshot(
  snapshot: RecommendationSnapshot,
): RecommendationSnapshot {
  return Object.freeze({
    ...snapshot,
    recommendations: Object.freeze(
      snapshot.recommendations.map(freezeRecommendation),
    ),
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeStatistics(
  statistics: RecommendationStatistics,
): RecommendationStatistics {
  return Object.freeze({
    ...statistics,
    byCategory: Object.freeze({ ...statistics.byCategory }),
    byIntent: Object.freeze({ ...statistics.byIntent }),
    byType: Object.freeze({ ...statistics.byType }),
  });
}

export function freezeDiagnostics(
  diagnostics: RecommendationDiagnostics,
): RecommendationDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...diagnostics.notes]),
    warnings: Object.freeze([...diagnostics.warnings]),
    blockedIds: Object.freeze([...diagnostics.blockedIds]),
    deferredIds: Object.freeze([...diagnostics.deferredIds]),
    processingSteps: Object.freeze([...diagnostics.processingSteps]),
  });
}

export function freezeTimelineItem(
  item: RecommendationTimelineItem,
): RecommendationTimelineItem {
  return Object.freeze({
    ...item,
    metadata: freezeMetadata(item.metadata),
  });
}

export function freezeTimeline(
  timeline: RecommendationTimeline,
): RecommendationTimeline {
  return Object.freeze({
    ...timeline,
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
  });
}

export function freezeView(view: RecommendationView): RecommendationView {
  return Object.freeze({
    ...view,
    primary: view.primary ? freezeRecommendation(view.primary) : null,
    ordered: Object.freeze(view.ordered.map(freezeRecommendation)),
    groups: Object.freeze(view.groups.map(freezeGroup)),
    metadata: freezeMetadata(view.metadata),
  });
}

export function freezeExplainabilityInput(
  input: ExplainabilityInput,
): ExplainabilityInput {
  return Object.freeze({
    ...input,
    recommendationIds: Object.freeze([...input.recommendationIds]),
    decisionIds: Object.freeze([...input.decisionIds]),
    summary: input.summary ? freezeSummary(input.summary) : null,
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezeContext(
  context: RecommendationContext,
): RecommendationContext {
  return Object.freeze({
    ...context,
    decisionIds: Object.freeze([...context.decisionIds]),
    references: Object.freeze(context.references.map(freezeReference)),
    focusAreas: Object.freeze([...context.focusAreas]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezePackage(
  pkg: RecommendationPackage,
): RecommendationPackage {
  return Object.freeze({
    ...pkg,
    recommendationContext: freezeContext(pkg.recommendationContext),
    recommendations: Object.freeze(
      pkg.recommendations.map(freezeRecommendation),
    ),
    conflicts: Object.freeze(pkg.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(pkg.resolutions.map(freezeResolution)),
    constraints: Object.freeze(pkg.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(pkg.dependencies.map(freezeDependency)),
    groups: Object.freeze(pkg.groups.map(freezeGroup)),
    plan: pkg.plan ? freezePlan(pkg.plan) : null,
    view: pkg.view ? freezeView(pkg.view) : null,
    summary: pkg.summary ? freezeSummary(pkg.summary) : null,
    snapshot: pkg.snapshot ? freezeSnapshot(pkg.snapshot) : null,
    statistics: freezeStatistics(pkg.statistics),
    diagnostics: freezeDiagnostics(pkg.diagnostics),
    timeline: freezeTimeline(pkg.timeline),
    explainabilityInput: pkg.explainabilityInput
      ? freezeExplainabilityInput(pkg.explainabilityInput)
      : null,
    metadata: freezeMetadata(pkg.metadata),
  });
}

export function freezeInput(input: RecommendationInput): RecommendationInput {
  return Object.freeze({
    ...input,
    recommendationContext: input.recommendationContext
      ? freezeContext(input.recommendationContext)
      : null,
    decisions: Object.freeze([...input.decisions]),
    recommendations: Object.freeze(
      input.recommendations.map(freezeRecommendation),
    ),
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezeResult(result: RecommendationResult): RecommendationResult {
  return Object.freeze({
    ...result,
    recommendations: Object.freeze(
      result.recommendations.map(freezeRecommendation),
    ),
    package: result.package ? freezePackage(result.package) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    explainabilityInput: result.explainabilityInput
      ? freezeExplainabilityInput(result.explainabilityInput)
      : null,
    validation: result.validation
      ? Object.freeze({
          ...result.validation,
          errors: Object.freeze([...result.validation.errors]),
          warnings: Object.freeze([...result.validation.warnings]),
        })
      : null,
    descriptor: result.descriptor
      ? Object.freeze({
          ...result.descriptor,
          capabilities: Object.freeze([...result.descriptor.capabilities]),
          boundaries: Object.freeze([...result.descriptor.boundaries]),
        })
      : null,
    errors: Object.freeze([...result.errors]),
  });
}

export function freezeState(state: RecommendationState): RecommendationState {
  return Object.freeze({
    ...state,
    package: state.package ? freezePackage(state.package) : null,
    recommendations: Object.freeze(
      state.recommendations.map(freezeRecommendation),
    ),
  });
}

export function freezeDescriptor(
  descriptor: RecommendationDescriptor,
): RecommendationDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    boundaries: Object.freeze([...descriptor.boundaries]),
  });
}

export function freezeValidation(
  validation: RecommendationValidation,
): RecommendationValidation {
  return Object.freeze({
    ...validation,
    errors: Object.freeze([...validation.errors]),
    warnings: Object.freeze([...validation.warnings]),
  });
}
`,
);

write(
  "utils/RecommendationHelpers.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationCategory } from "../models/RecommendationCategory";

export function sortRecommendationsByPriority(
  items: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.priority.ordinal !== b.priority.ordinal) {
        return a.priority.ordinal - b.priority.ordinal;
      }
      if (a.priority.urgency !== b.priority.urgency) {
        return b.priority.urgency - a.priority.urgency;
      }
      return a.id.localeCompare(b.id);
    }),
  );
}

export function groupIdsByCategory(
  items: readonly CoachingRecommendation[],
): ReadonlyMap<RecommendationCategory, readonly string[]> {
  const map = new Map<RecommendationCategory, string[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item.id);
    map.set(item.category, list);
  }
  const frozen = new Map<RecommendationCategory, readonly string[]>();
  for (const [k, v] of map) {
    frozen.set(k, Object.freeze([...v]));
  }
  return frozen;
}

export function recommendationIds(
  items: readonly CoachingRecommendation[],
): readonly string[] {
  return Object.freeze(items.map((r) => r.id));
}
`,
);

write(
  "utils/PriorityHelpers.ts",
  `import type { RecommendationPriority } from "../models/RecommendationPriority";
import { DEFAULT_RECOMMENDATION_PRIORITIES } from "../models/RecommendationPriority";

export function comparePriority(
  a: RecommendationPriority,
  b: RecommendationPriority,
): number {
  if (a.ordinal !== b.ordinal) return a.ordinal - b.ordinal;
  return b.urgency - a.urgency;
}

export function defaultOrdinalForCategory(category: string): number {
  const found = DEFAULT_RECOMMENDATION_PRIORITIES.find(
    (p) => p.category === category,
  );
  return found?.ordinal ?? 99;
}
`,
);

write(
  "utils/StatisticsHelpers.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationStatistics } from "../models/RecommendationStatistics";
import { freezeStatistics } from "./FreezeRecommendationState";

export function computeRecommendationStatistics(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly conflictCount: number;
  readonly dependencyCount: number;
  readonly groupCount: number;
}): RecommendationStatistics {
  const byCategory: Record<string, number> = {};
  const byIntent: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let urgencySum = 0;
  for (const r of input.recommendations) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    byIntent[r.intent] = (byIntent[r.intent] ?? 0) + 1;
    byType[r.type] = (byType[r.type] ?? 0) + 1;
    urgencySum += r.priority.urgency;
  }
  const total = input.recommendations.length;
  return freezeStatistics({
    total,
    byCategory,
    byIntent,
    byType,
    conflictCount: input.conflictCount,
    dependencyCount: input.dependencyCount,
    groupCount: input.groupCount,
    averageUrgency: total === 0 ? 0 : Math.round(urgencySum / total),
  });
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";

/**
 * Structured formatting helpers — no natural language generation.
 */
export function formatRecommendationKey(
  recommendation: CoachingRecommendation,
): string {
  return \`\${recommendation.category}:\${recommendation.type}:\${recommendation.id}\`;
}

export function formatOrderedKeys(
  recommendations: readonly CoachingRecommendation[],
): readonly string[] {
  return Object.freeze(recommendations.map(formatRecommendationKey));
}
`,
);

write(
  "utils/index.ts",
  `export * from "./FreezeRecommendationState";
export * from "./RecommendationHelpers";
export * from "./PriorityHelpers";
export * from "./StatisticsHelpers";
export * from "./FormattingHelpers";
`,
);

write(
  "contracts/DecisionEnginePort.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { RecommendationEngineInput } from "../../decision-engine/models/RecommendationEngineInput";
import { EMPTY_DECISION_METADATA } from "../../decision-engine/models/DecisionMetadata";
import { DecisionOutcomes } from "../../decision-engine/models/DecisionOutcome";
import { DecisionIntents } from "../../decision-engine/models/DecisionIntent";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";

/**
 * Upstream Decision Engine contract — Recommendation Engine consumes decisions only.
 */
export interface DecisionEnginePort {
  loadDecisions(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): readonly CoachingDecision[];

  loadRecommendationHandoff(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): RecommendationEngineInput | null;
}

function createMockDecision(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
  readonly category: "training" | "recovery" | "safety";
  readonly ordinal: number;
  readonly intent: "recommend" | "block" | "continue";
}): CoachingDecision {
  const id = \`decision:\${input.category}:mock\`;
  return Object.freeze({
    id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    category: input.category,
    intent: input.intent,
    outcome: DecisionOutcomes.ACCEPTED,
    title: \`\${input.category} decision\`,
    priority: Object.freeze({
      category: input.category,
      ordinal: input.ordinal,
      label: input.category,
    }),
    confidence: Object.freeze({
      level: "high" as const,
      score: 90,
      notes: Object.freeze([] as string[]),
    }),
    score: Object.freeze({
      total: 90 - input.ordinal * 5,
      priorityComponent: 100 - input.ordinal * 10,
      consistencyComponent: 90,
      riskComponent: input.category === "safety" ? 20 : 70,
      impactComponent: 80,
    }),
    reasons: Object.freeze([
      Object.freeze({
        id: \`reason:\${id}\`,
        code: "mock_reason",
        description: "mock",
        evidenceKeys: Object.freeze([\`source:\${input.category}\`]),
        metadata: EMPTY_DECISION_METADATA,
      }),
    ]),
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    recommendationRefs: Object.freeze([
      Object.freeze({
        id: \`ref:\${id}\`,
        decisionId: id,
        category: input.category,
        priorityOrdinal: input.ordinal,
        intent: input.intent,
        metadata: EMPTY_DECISION_METADATA,
      }),
    ]),
    sourceKeys: Object.freeze([\`source:\${input.category}\`]),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}

export function createMockDecisionEnginePort(): DecisionEnginePort {
  return {
    loadDecisions(input) {
      return Object.freeze([
        createMockDecision({
          ...input,
          category: "safety",
          ordinal: 0,
          intent: DecisionIntents.BLOCK,
        }),
        createMockDecision({
          ...input,
          category: "recovery",
          ordinal: 1,
          intent: DecisionIntents.RECOMMEND,
        }),
        createMockDecision({
          ...input,
          category: "training",
          ordinal: 2,
          intent: DecisionIntents.CONTINUE,
        }),
      ]);
    },
    loadRecommendationHandoff(input) {
      const decisions = this.loadDecisions(input);
      return Object.freeze({
        id: \`rec-input:mock:\${input.contextId}\`,
        athleteId: input.athleteId,
        contextId: input.contextId,
        decisionIds: Object.freeze(decisions.map((d) => d.id)),
        recommendations: Object.freeze(
          decisions.flatMap((d) => d.recommendationRefs),
        ),
        summary: null,
        metadata: EMPTY_DECISION_METADATA,
        createdAt: input.at,
      });
    },
  };
}

// silence unused import if tree-shaken oddly
void EMPTY_RECOMMENDATION_METADATA;
`,
);

write(
  "contracts/AthleteStatePort.ts",
  `/**
 * Upstream Athlete State presence contract — no domain calculations.
 */
export interface AthleteStatePort {
  isAthletePresent(input: {
    readonly athleteId: string;
    readonly at: string;
  }): boolean;
}

export function createMockAthleteStatePort(
  present = true,
): AthleteStatePort {
  return {
    isAthletePresent() {
      return present;
    },
  };
}
`,
);

write(
  "contracts/ContextFusionPort.ts",
  `/**
 * Upstream Context Fusion presence / focus contract — no fusion logic.
 */
export interface ContextFusionPort {
  describeFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockContextFusionPort(
  focusAreas: readonly string[] = Object.freeze(["training", "recovery"]),
): ContextFusionPort {
  return {
    describeFocusAreas() {
      return Object.freeze([...focusAreas]);
    },
  };
}
`,
);

write(
  "contracts/CoachSupervisorPort.ts",
  `/**
 * Upstream Coach Supervisor focus contract — no orchestration.
 */
export interface CoachSupervisorPort {
  describeSupervisorFocus(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
  }): readonly string[];
}

export function createMockCoachSupervisorPort(
  focusAreas: readonly string[] = Object.freeze(["safety"]),
): CoachSupervisorPort {
  return {
    describeSupervisorFocus() {
      return Object.freeze([...focusAreas]);
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./DecisionEnginePort";
export * from "./AthleteStatePort";
export * from "./ContextFusionPort";
export * from "./CoachSupervisorPort";
`,
);

write(
  "planning/RecommendationPlanner.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationPlan } from "../models/RecommendationPlan";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezePlan } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic recommendation plan — no execution.
 */
export function planRecommendations(input: {
  readonly planId: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly at: string;
}): RecommendationPlan {
  const ordered = sortRecommendationsByPriority(input.recommendations);
  return freezePlan({
    id: input.planId,
    athleteId: input.athleteId,
    contextId: input.contextId,
    orderedIds: Object.freeze(ordered.map((r) => r.id)),
    steps: Object.freeze([]),
    sequences: Object.freeze([]),
    groups: Object.freeze([]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "planning/ActionPlanner.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationStep } from "../models/RecommendationStep";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeStep } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic action planning — structured steps only.
 */
export function planActions(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationStep[] {
  const ordered = sortRecommendationsByPriority(recommendations);
  const steps: RecommendationStep[] = [];
  let order = 0;
  for (const rec of ordered) {
    for (const action of rec.actions) {
      steps.push(
        freezeStep({
          id: \`step:\${rec.id}:\${action.id}\`,
          order: order++,
          action,
          label: action.key,
          optional: rec.intent === "defer" || rec.intent === "monitor",
          metadata: EMPTY_RECOMMENDATION_METADATA,
        }),
      );
    }
  }
  return Object.freeze(steps);
}
`,
);

write(
  "planning/PriorityPlanner.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic priority planning — reordering only.
 */
export function planPriorities(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return sortRecommendationsByPriority(recommendations);
}
`,
);

write(
  "planning/GroupingPlanner.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeGroup } from "../utils/FreezeRecommendationState";
import { groupIdsByCategory } from "../utils/RecommendationHelpers";

/**
 * Deterministic grouping by category — no NL.
 */
export function planGroups(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationGroup[] {
  const byCategory = groupIdsByCategory(recommendations);
  const groups: RecommendationGroup[] = [];
  for (const [category, ids] of byCategory) {
    groups.push(
      freezeGroup({
        id: \`group:\${category}\`,
        category,
        recommendationIds: ids,
        label: category,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  return Object.freeze(
    groups.sort((a, b) => a.category.localeCompare(b.category)),
  );
}
`,
);

write(
  "planning/DependencyPlanner.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import { RecommendationDependencyKinds } from "../models/RecommendationDependency";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeDependency } from "../utils/FreezeRecommendationState";

/**
 * Deterministic dependency planning from recommendation links.
 */
export function planDependencies(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationDependency[] {
  const deps: RecommendationDependency[] = [];
  const byCategory = new Map<string, CoachingRecommendation>();
  for (const r of recommendations) {
    byCategory.set(r.category, r);
  }
  const safety = byCategory.get("safety");
  const training = byCategory.get("training");
  if (safety && training) {
    deps.push(
      freezeDependency({
        id: \`dep:\${safety.id}->\${training.id}\`,
        kind: RecommendationDependencyKinds.BLOCKS,
        fromId: safety.id,
        toId: training.id,
        required: true,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  const recovery = byCategory.get("recovery");
  if (recovery && training) {
    deps.push(
      freezeDependency({
        id: \`dep:\${recovery.id}->\${training.id}\`,
        kind: RecommendationDependencyKinds.FOLLOWS,
        fromId: recovery.id,
        toId: training.id,
        required: false,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  for (const r of recommendations) {
    for (const d of r.dependencies) {
      deps.push(freezeDependency(d));
    }
  }
  return Object.freeze(deps);
}
`,
);

write(
  "planning/SequencePlanner.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationSequence } from "../models/RecommendationSequence";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeSequence } from "../utils/FreezeRecommendationState";
import { planActions } from "./ActionPlanner";

/**
 * Deterministic sequence planning — ordered steps only.
 */
export function planSequences(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationSequence[] {
  const steps = planActions(recommendations);
  if (steps.length === 0) return Object.freeze([]);
  return Object.freeze([
    freezeSequence({
      id: "sequence:primary",
      steps,
      ordered: true,
      metadata: EMPTY_RECOMMENDATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "planning/index.ts",
  `export * from "./RecommendationPlanner";
export * from "./ActionPlanner";
export * from "./PriorityPlanner";
export * from "./GroupingPlanner";
export * from "./DependencyPlanner";
export * from "./SequencePlanner";
`,
);

write(
  "prioritization/PriorityResolver.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic priority resolution — ordinal / urgency tables only.
 */
export function resolvePriorities(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return sortRecommendationsByPriority(recommendations);
}
`,
);

write(
  "prioritization/UrgencyResolver.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic urgency resolution — safety boost only.
 */
export function resolveUrgency(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations.map((r) => {
      if (r.category !== "safety") return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        priority: Object.freeze({
          ...r.priority,
          urgency: Math.max(r.priority.urgency, 100),
          ordinal: 0,
        }),
      });
    }),
  );
}
`,
);

write(
  "prioritization/DependencyResolver.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic dependency resolution — attach required deps; defer blocked.
 */
export function resolveDependencies(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly dependencies: readonly RecommendationDependency[];
}): readonly CoachingRecommendation[] {
  const blocked = new Set<string>();
  for (const dep of input.dependencies) {
    if (dep.kind === "blocks" && dep.required) {
      blocked.add(dep.toId);
    }
  }
  return Object.freeze(
    input.recommendations.map((r) => {
      if (!blocked.has(r.id)) return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        intent: "defer",
        metadata: Object.freeze({
          tags: Object.freeze([...r.metadata.tags, "blocked_by_dependency"]),
          attributes: Object.freeze({ ...r.metadata.attributes }),
        }),
      });
    }),
  );
}
`,
);

write(
  "prioritization/OrderingResolver.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic ordering — priority then dependency follows edges.
 */
export function resolveOrdering(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly dependencies: readonly RecommendationDependency[];
}): readonly CoachingRecommendation[] {
  const ordered = [...sortRecommendationsByPriority(input.recommendations)];
  const index = new Map(ordered.map((r, i) => [r.id, i]));
  for (const dep of input.dependencies) {
    if (dep.kind !== "follows") continue;
    const from = index.get(dep.fromId);
    const to = index.get(dep.toId);
    if (from === undefined || to === undefined) continue;
    if (from < to) continue;
    const [item] = ordered.splice(from, 1);
    const newTo = ordered.findIndex((r) => r.id === dep.toId);
    ordered.splice(newTo, 0, item);
    ordered.forEach((r, i) => index.set(r.id, i));
  }
  return Object.freeze(ordered);
}
`,
);

write(
  "prioritization/ConflictResolver.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import type { RecommendationResolution } from "../models/RecommendationResolution";
import {
  RecommendationResolutionStrategies,
} from "../models/RecommendationResolution";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeConflict, freezeResolution } from "../utils/FreezeRecommendationState";
import { comparePriority } from "../utils/PriorityHelpers";

/**
 * Deterministic conflict resolution — higher priority wins.
 */
export function resolveConflicts(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly conflicts: readonly RecommendationConflict[];
}): {
  readonly conflicts: readonly RecommendationConflict[];
  readonly resolutions: readonly RecommendationResolution[];
  readonly recommendations: readonly CoachingRecommendation[];
} {
  const byId = new Map(input.recommendations.map((r) => [r.id, r]));
  const loserIds = new Set<string>();
  const resolutions: RecommendationResolution[] = [];
  const resolvedConflicts: RecommendationConflict[] = [];

  for (const conflict of input.conflicts) {
    const left = byId.get(conflict.leftId);
    const right = byId.get(conflict.rightId);
    let winnerId: string | null = null;
    let losers: string[] = [];
    if (left && right) {
      const cmp = comparePriority(left.priority, right.priority);
      if (cmp <= 0) {
        winnerId = left.id;
        losers = [right.id];
      } else {
        winnerId = right.id;
        losers = [left.id];
      }
    } else {
      winnerId = left?.id ?? right?.id ?? null;
      losers = [];
    }
    for (const id of losers) loserIds.add(id);
    resolutions.push(
      freezeResolution({
        id: \`resolution:\${conflict.id}\`,
        conflictId: conflict.id,
        strategy: RecommendationResolutionStrategies.KEEP_HIGHER_PRIORITY,
        winnerId,
        loserIds: Object.freeze(losers),
        notes: Object.freeze(["higher_priority_wins"]),
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
    resolvedConflicts.push(
      freezeConflict({
        ...conflict,
        resolved: true,
      }),
    );
  }

  const recommendations = Object.freeze(
    input.recommendations.filter((r) => !loserIds.has(r.id)),
  );

  return Object.freeze({
    conflicts: Object.freeze(resolvedConflicts),
    resolutions: Object.freeze(resolutions),
    recommendations,
  });
}
`,
);

write(
  "prioritization/index.ts",
  `export * from "./PriorityResolver";
export * from "./UrgencyResolver";
export * from "./DependencyResolver";
export * from "./OrderingResolver";
export * from "./ConflictResolver";
`,
);

write(
  "packaging/RecommendationPackager.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import type { RecommendationConstraint } from "../models/RecommendationConstraint";
import type { RecommendationContext } from "../models/RecommendationContext";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationPlan } from "../models/RecommendationPlan";
import type { RecommendationResolution } from "../models/RecommendationResolution";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import type { RecommendationTimeline } from "../models/RecommendationTimeline";
import type { RecommendationView } from "../models/RecommendationView";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezePackage } from "../utils/FreezeRecommendationState";
import { computeRecommendationStatistics } from "../utils/StatisticsHelpers";

/**
 * Deterministic packaging — structured package only.
 */
export function packageRecommendations(input: {
  readonly id: string;
  readonly recommendationContext: RecommendationContext;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly conflicts: readonly RecommendationConflict[];
  readonly resolutions: readonly RecommendationResolution[];
  readonly constraints: readonly RecommendationConstraint[];
  readonly dependencies: readonly RecommendationDependency[];
  readonly groups: readonly RecommendationGroup[];
  readonly plan: RecommendationPlan | null;
  readonly view: RecommendationView | null;
  readonly summary: RecommendationSummary | null;
  readonly snapshot: RecommendationSnapshot | null;
  readonly timeline: RecommendationTimeline;
  readonly explainabilityInput: ExplainabilityInput | null;
  readonly diagnosticsNotes: readonly string[];
  readonly at: string;
}): RecommendationPackage {
  return freezePackage({
    id: input.id,
    athleteId: input.recommendationContext.athleteId,
    contextId: input.recommendationContext.contextId,
    recommendationContext: input.recommendationContext,
    recommendations: input.recommendations,
    conflicts: input.conflicts,
    resolutions: input.resolutions,
    constraints: input.constraints,
    dependencies: input.dependencies,
    groups: input.groups,
    plan: input.plan,
    view: input.view,
    summary: input.summary,
    snapshot: input.snapshot,
    statistics: computeRecommendationStatistics({
      recommendations: input.recommendations,
      conflictCount: input.conflicts.length,
      dependencyCount: input.dependencies.length,
      groupCount: input.groups.length,
    }),
    diagnostics: Object.freeze({
      notes: Object.freeze([...input.diagnosticsNotes]),
      warnings: Object.freeze([] as string[]),
      blockedIds: Object.freeze(
        input.recommendations
          .filter((r) => r.metadata.tags.includes("blocked_by_dependency"))
          .map((r) => r.id),
      ),
      deferredIds: Object.freeze(
        input.recommendations
          .filter((r) => r.intent === "defer")
          .map((r) => r.id),
      ),
      processingSteps: Object.freeze([
        "plan",
        "prioritize",
        "resolve",
        "package",
      ]),
    }),
    timeline: input.timeline,
    explainabilityInput: input.explainabilityInput,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "packaging/RecommendationAssembler.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationCollection } from "../models/RecommendationCollection";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";

/**
 * Deterministic assembly into a collection — no NL.
 */
export function assembleRecommendations(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly at: string;
}): RecommendationCollection {
  return Object.freeze({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    items: Object.freeze([...input.recommendations]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "packaging/RecommendationFormatter.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationView } from "../models/RecommendationView";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeView } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Structured formatter — keys / ordering only, no natural language.
 */
export function formatRecommendationView(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly groups: readonly RecommendationGroup[];
  readonly at: string;
}): RecommendationView {
  const ordered = sortRecommendationsByPriority(input.recommendations);
  return freezeView({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    primary: ordered[0] ?? null,
    ordered,
    groups: input.groups,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "packaging/RecommendationExporter.ts",
  `import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationOutput } from "../models/RecommendationOutput";

/**
 * Structured export — no serialization side effects.
 */
export function exportRecommendationOutput(
  pkg: RecommendationPackage,
): RecommendationOutput {
  return Object.freeze({
    recommendations: pkg.recommendations,
    package: pkg,
    explainabilityInput: pkg.explainabilityInput,
  });
}
`,
);

write(
  "packaging/PackageBuilder.ts",
  `export { packageRecommendations as buildPackage } from "./RecommendationPackager";
`,
);

write(
  "packaging/index.ts",
  `export * from "./RecommendationPackager";
export * from "./RecommendationAssembler";
export * from "./RecommendationFormatter";
export * from "./RecommendationExporter";
export * from "./PackageBuilder";
`,
);

console.log("recommendation-engine part 2 written");
