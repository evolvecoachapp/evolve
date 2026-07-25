/**
 * Sprint 23.1 — Continuous Adaptation Engine generator (part 3: comparison, timeline, builders, validators).
 * Run after part 2: node scripts/generate-continuous-adaptation-part3.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/continuous-adaptation");
let fileCount = 0;

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

// ─── COMPARISON (immutable key/id diffs) ──────────────────────────────────────

write(
  "comparison/diffHelpers.ts",
  `export interface KeyDiff {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly shared: readonly string[];
}

export function diffKeys(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  const a = new Set(before);
  const b = new Set(after);
  const added: string[] = [];
  const removed: string[] = [];
  const shared: string[] = [];
  for (const k of b) {
    if (a.has(k)) shared.push(k);
    else added.push(k);
  }
  for (const k of a) {
    if (!b.has(k)) removed.push(k);
  }
  return Object.freeze({
    added: Object.freeze(added.sort()),
    removed: Object.freeze(removed.sort()),
    shared: Object.freeze(shared.sort()),
  });
}
`,
);

write(
  "comparison/StateComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareStateKeys(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/SnapshotComparator.ts",
  `import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export interface SnapshotDiff {
  readonly decisionIds: KeyDiff;
  readonly signalKeys: KeyDiff;
}

export function compareSnapshots(
  before: AdaptationSnapshot | null,
  after: AdaptationSnapshot | null,
): SnapshotDiff {
  const beforeIds = before ? before.decisions.map((d) => d.id) : [];
  const afterIds = after ? after.decisions.map((d) => d.id) : [];
  const beforeSignals = before ? before.signalKeys : [];
  const afterSignals = after ? after.signalKeys : [];
  return Object.freeze({
    decisionIds: diffKeys(beforeIds, afterIds),
    signalKeys: diffKeys(beforeSignals, afterSignals),
  });
}
`,
);

write(
  "comparison/TimelineComparator.ts",
  `import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareTimelines(
  before: AdaptationTimeline | null,
  after: AdaptationTimeline | null,
): KeyDiff {
  const beforeIds = before ? before.items.map((i) => i.id) : [];
  const afterIds = after ? after.items.map((i) => i.id) : [];
  return diffKeys(beforeIds, afterIds);
}
`,
);

write(
  "comparison/GoalComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareGoalKeys(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/DecisionComparator.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareDecisionIds(
  before: readonly CoachingDecision[],
  after: readonly CoachingDecision[],
): KeyDiff {
  return diffKeys(
    before.map((d) => d.id),
    after.map((d) => d.id),
  );
}
`,
);

write(
  "comparison/RecommendationComparator.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareRecommendationIds(
  before: readonly CoachingRecommendation[],
  after: readonly CoachingRecommendation[],
): KeyDiff {
  return diffKeys(
    before.map((r) => r.id),
    after.map((r) => r.id),
  );
}
`,
);

write(
  "comparison/index.ts",
  `export * from "./DecisionComparator";
export * from "./diffHelpers";
export * from "./GoalComparator";
export * from "./RecommendationComparator";
export * from "./SnapshotComparator";
export * from "./StateComparator";
export * from "./TimelineComparator";
`,
);

// ─── TIMELINE (historical organization only) ──────────────────────────────────

write(
  "timeline/TimelineBuilder.ts",
  `import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationTimeline, AdaptationTimelineItem } from "../models/AdaptationTimeline";
import { freezeTimeline, freezeTimelineItem } from "../utils/FreezeAdaptationState";
import { sortTimelineItems } from "../utils/TimelineHelpers";

export function buildAdaptationTimeline(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): AdaptationTimeline {
  const items: AdaptationTimelineItem[] = input.decisions.map((d) =>
    freezeTimelineItem({
      id: \`tl-item:\${d.id}\`,
      subjectId: d.id,
      operation: "adaptation_decision",
      at: d.createdAt,
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  return freezeTimeline({
    id: input.id,
    athleteId: input.athleteId,
    items: sortTimelineItems(items),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "timeline/HistoryBuilder.ts",
  `import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationHistory, AdaptationHistoryEntry } from "../models/AdaptationHistory";
import { freezeHistory, freezeHistoryEntry } from "../utils/FreezeAdaptationState";

export function buildAdaptationHistory(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly historyKeys: readonly string[];
  readonly at: string;
}): AdaptationHistory {
  const fromDecisions: AdaptationHistoryEntry[] = input.decisions.map((d) =>
    freezeHistoryEntry({
      id: \`hist:\${d.id}\`,
      subjectId: d.id,
      kind: "decision",
      at: d.createdAt,
      signalKeys: d.signalKeys,
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  const fromKeys: AdaptationHistoryEntry[] = input.historyKeys.map((k, i) =>
    freezeHistoryEntry({
      id: \`hist:key:\${i}:\${k}\`,
      subjectId: k,
      kind: "history_key",
      at: input.at,
      signalKeys: Object.freeze([k]),
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  return freezeHistory({
    id: input.id,
    athleteId: input.athleteId,
    entries: Object.freeze([...fromDecisions, ...fromKeys]),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "timeline/TrendBuilder.ts",
  `import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationTimelineItem } from "../models/AdaptationTimeline";
import { freezeTimelineItem } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

/**
 * Historical organization of trend signal keys only — no forecasting.
 */
export function buildTrendItems(input: {
  readonly trendKeys: readonly string[];
  readonly at: string;
}): readonly AdaptationTimelineItem[] {
  const keys = uniqueSorted(input.trendKeys.filter((k) => k.includes("trend")));
  return Object.freeze(
    keys.map((k, i) =>
      freezeTimelineItem({
        id: \`trend-item:\${i}:\${k}\`,
        subjectId: k,
        operation: "trend_signal",
        at: input.at,
        metadata: EMPTY_ADAPTATION_METADATA,
      }),
    ),
  );
}
`,
);

write(
  "timeline/SnapshotBuilder.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import { freezeSnapshot } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

export function buildTimelineSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly summary: AdaptationSummary | null;
  readonly at: string;
}): AdaptationSnapshot {
  const signalKeys = uniqueSorted(input.decisions.flatMap((d) => d.signalKeys));
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisions: input.decisions,
    summary: input.summary,
    signalKeys,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "timeline/WindowBuilder.ts",
  `import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import type { AdaptationWindow } from "../models/AdaptationWindow";
import { freezeWindow } from "../utils/FreezeAdaptationState";

export function buildAdaptationWindow(input: {
  readonly id: string;
  readonly timeline: AdaptationTimeline | null;
  readonly startAt: string;
  readonly endAt: string;
}): AdaptationWindow {
  const itemIds = input.timeline
    ? input.timeline.items
        .filter((i) => i.at >= input.startAt && i.at <= input.endAt)
        .map((i) => i.id)
    : [];
  return freezeWindow({
    id: input.id,
    startAt: input.startAt,
    endAt: input.endAt,
    itemIds: Object.freeze(itemIds),
    metadata: EMPTY_ADAPTATION_METADATA,
  });
}
`,
);

write(
  "timeline/index.ts",
  `export * from "./HistoryBuilder";
export * from "./SnapshotBuilder";
export * from "./TimelineBuilder";
export * from "./TrendBuilder";
export * from "./WindowBuilder";
`,
);

// ─── BUILDERS ─────────────────────────────────────────────────────────────────

write(
  "builders/AdaptationBuilder.ts",
  `import { AdaptationCategories, type AdaptationCategory } from "../models/AdaptationCategory";
import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import type { AdaptationCondition } from "../models/AdaptationCondition";
import type { AdaptationConstraint } from "../models/AdaptationConstraint";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDependency } from "../models/AdaptationDependency";
import type { AdaptationEvaluation } from "../models/AdaptationEvaluation";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import type { AdaptationReason } from "../models/AdaptationReason";
import { AdaptationReasonCodes } from "../models/AdaptationReason";
import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import { freezeDecision, freezeReason, freezeCondition } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

export function buildAdaptationDecision(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: AdaptationCategory;
  readonly triggers: readonly AdaptationTrigger[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
  readonly evaluation: AdaptationEvaluation;
  readonly dependencies?: readonly AdaptationDependency[];
  readonly constraints?: readonly AdaptationConstraint[];
  readonly sourceKeys?: readonly string[];
  readonly at: string;
}): AdaptationDecision {
  const present = input.triggers.filter((t) => t.present);
  const conditions: AdaptationCondition[] = present.map((t) =>
    freezeCondition({
      id: \`cond:\${t.id}\`,
      key: t.signalKey,
      subjectId: t.subjectId,
      met: true,
      signalKeys: Object.freeze([t.signalKey]),
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  const reasons: AdaptationReason[] = present.map((t) =>
    freezeReason({
      id: \`reason:\${t.id}\`,
      code: AdaptationReasonCodes.SIGNAL_PRESENT,
      subjectId: input.id,
      category: input.category,
      statementKey: \`signal.\${t.kind}.present\`,
      signalKeys: Object.freeze([t.signalKey]),
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  if (present.length > 0) {
    reasons.push(
      freezeReason({
        id: \`reason:priority:\${input.id}\`,
        code: AdaptationReasonCodes.PRIORITY_ORDERING,
        subjectId: input.id,
        category: input.category,
        statementKey: \`priority.\${input.evaluation.priority.label}\`,
        signalKeys: input.evaluation.signalKeys,
        metadata: EMPTY_ADAPTATION_METADATA,
      }),
    );
  }
  const signalKeys = uniqueSorted([
    ...present.map((t) => t.signalKey),
    ...input.evaluation.signalKeys,
  ]);
  return freezeDecision({
    id: input.id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    category: input.category,
    triggers: input.triggers,
    conditions: Object.freeze(conditions),
    candidates: input.candidates,
    opportunities: input.opportunities,
    reasons: Object.freeze(reasons),
    evaluation: input.evaluation,
    priority: input.evaluation.priority,
    severity: input.evaluation.severity,
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
    constraints: Object.freeze([...(input.constraints ?? [])]),
    signalKeys,
    sourceKeys: Object.freeze([...(input.sourceKeys ?? [])]),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function categoryFromSignals(signalKeys: readonly string[]): AdaptationCategory {
  if (signalKeys.some((k) => k.includes("recovery"))) return AdaptationCategories.RECOVERY;
  if (signalKeys.some((k) => k.includes("workout") || k.includes("performance")))
    return AdaptationCategories.WORKOUT;
  if (signalKeys.some((k) => k.includes("nutrition"))) return AdaptationCategories.NUTRITION;
  if (signalKeys.some((k) => k.includes("goal"))) return AdaptationCategories.GOAL;
  if (signalKeys.some((k) => k.includes("adherence"))) return AdaptationCategories.ADHERENCE;
  if (signalKeys.some((k) => k.includes("state"))) return AdaptationCategories.STATE;
  return AdaptationCategories.GENERAL;
}
`,
);

write(
  "builders/DecisionBuilder.ts",
  `export { buildAdaptationDecision, categoryFromSignals } from "./AdaptationBuilder";
`,
);

write(
  "builders/SummaryBuilder.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import { freezeSummary } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

export function buildAdaptationSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): AdaptationSummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionCount: input.decisions.length,
    opportunityCount: input.decisions.reduce((n, d) => n + d.opportunities.length, 0),
    triggerCount: input.decisions.reduce((n, d) => n + d.triggers.length, 0),
    categoryKeys: uniqueSorted(input.decisions.map((d) => d.category)),
    signalKeys: uniqueSorted(input.decisions.flatMap((d) => d.signalKeys)),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/PackageBuilder.ts",
  `import type { AdaptationConstraint } from "../models/AdaptationConstraint";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDependency } from "../models/AdaptationDependency";
import type { AdaptationDiagnostics } from "../models/AdaptationDiagnostics";
import type { AdaptationHistory } from "../models/AdaptationHistory";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationPackage } from "../models/AdaptationPackage";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationStatistics } from "../models/AdaptationStatistics";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import type { AdaptationWindow } from "../models/AdaptationWindow";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import { freezePackage, freezeDiagnostics } from "../utils/FreezeAdaptationState";

export function buildAdaptationPackage(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly summary: AdaptationSummary | null;
  readonly snapshot: AdaptationSnapshot | null;
  readonly timeline: AdaptationTimeline | null;
  readonly history: AdaptationHistory | null;
  readonly window: AdaptationWindow | null;
  readonly statistics: AdaptationStatistics;
  readonly processingSteps: readonly string[];
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
  readonly dependencies?: readonly AdaptationDependency[];
  readonly constraints?: readonly AdaptationConstraint[];
  readonly at: string;
}): AdaptationPackage {
  const diagnostics: AdaptationDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["continuous_adaptation_pipeline"]),
    warnings: Object.freeze([] as string[]),
    processingSteps: Object.freeze([...input.processingSteps]),
  });
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisions: input.decisions,
    summary: input.summary,
    snapshot: input.snapshot,
    timeline: input.timeline,
    history: input.history,
    window: input.window,
    statistics: input.statistics,
    diagnostics,
    workoutAdaptationInput: input.workoutAdaptationInput,
    nutritionAdaptationInput: input.nutritionAdaptationInput,
    recoveryAdaptationInput: input.recoveryAdaptationInput,
    goalProgressInput: input.goalProgressInput,
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
    constraints: Object.freeze([...(input.constraints ?? [])]),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/SnapshotBuilder.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import { freezeSnapshot } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

export function buildAdaptationSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly summary: AdaptationSummary | null;
  readonly at: string;
}): AdaptationSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisions: input.decisions,
    summary: input.summary,
    signalKeys: uniqueSorted(input.decisions.flatMap((d) => d.signalKeys)),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/ResultBuilder.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationError } from "../models/AdaptationError";
import type { AdaptationPackage } from "../models/AdaptationPackage";
import type {
  AdaptationOperationKind,
  AdaptationResult,
} from "../models/AdaptationResult";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import type { AdaptationValidation } from "../models/AdaptationValidation";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import { freezeResult } from "../utils/FreezeAdaptationState";

export function buildAdaptationResult(input: {
  readonly id: string;
  readonly operation: AdaptationOperationKind;
  readonly success: boolean;
  readonly decisions?: readonly AdaptationDecision[];
  readonly package?: AdaptationPackage | null;
  readonly summary?: AdaptationSummary | null;
  readonly snapshot?: AdaptationSnapshot | null;
  readonly workoutAdaptationInput?: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput?: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput?: RecoveryAdaptationInput | null;
  readonly goalProgressInput?: GoalProgressInput | null;
  readonly validation?: AdaptationValidation | null;
  readonly descriptor?: AdaptationDescriptor | null;
  readonly errors?: readonly AdaptationError[];
  readonly createdAt: string;
}): AdaptationResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    decisions: Object.freeze([...(input.decisions ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    workoutAdaptationInput: input.workoutAdaptationInput ?? null,
    nutritionAdaptationInput: input.nutritionAdaptationInput ?? null,
    recoveryAdaptationInput: input.recoveryAdaptationInput ?? null,
    goalProgressInput: input.goalProgressInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/DescriptorBuilder.ts",
  `import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import { freezeDescriptor } from "../utils/FreezeAdaptationState";

export function buildAdaptationDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): AdaptationDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Continuous Adaptation Engine",
    version: "23.1.0",
    capabilities: Object.freeze([
      "evaluateAdaptation",
      "detectAdaptation",
      "describeAdaptation",
      "createAdaptationSnapshot",
      "validateAdaptation",
    ]),
    boundaries: Object.freeze([
      "no_openai_sdk",
      "no_prompt_builder",
      "no_tool_runtime",
      "no_action_engine",
      "no_ai_reasoning",
      "no_recommendation_generation",
      "no_business_calculations",
      "no_persistence",
      "no_networking",
      "no_ui",
      "no_plan_modification",
      "detection_only",
      "deterministic_only",
    ]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/HandoffBuilder.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { AdaptationCategories } from "../models/AdaptationCategory";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import {
  freezeGoalHandoff,
  freezeNutritionHandoff,
  freezeRecoveryHandoff,
  freezeWorkoutHandoff,
} from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

function handoffBase(
  decisions: readonly AdaptationDecision[],
  categories: readonly string[],
) {
  const filtered = decisions.filter((d) => categories.includes(d.category));
  return {
    decisionIds: Object.freeze(filtered.map((d) => d.id)),
    signalKeys: uniqueSorted(filtered.flatMap((d) => d.signalKeys)),
    categoryKeys: uniqueSorted(filtered.map((d) => d.category)),
  };
}

/** Handoff inputs only — never modify plans. */
export function buildWorkoutAdaptationInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): WorkoutAdaptationInput {
  const base = handoffBase(input.decisions, [
    AdaptationCategories.WORKOUT,
    AdaptationCategories.PERFORMANCE,
  ]);
  return freezeWorkoutHandoff({
    id: \`handoff:workout:\${input.contextId}\`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function buildNutritionAdaptationInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): NutritionAdaptationInput {
  const base = handoffBase(input.decisions, [AdaptationCategories.NUTRITION]);
  return freezeNutritionHandoff({
    id: \`handoff:nutrition:\${input.contextId}\`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function buildRecoveryAdaptationInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): RecoveryAdaptationInput {
  const base = handoffBase(input.decisions, [AdaptationCategories.RECOVERY]);
  return freezeRecoveryHandoff({
    id: \`handoff:recovery:\${input.contextId}\`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function buildGoalProgressInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): GoalProgressInput {
  const base = handoffBase(input.decisions, [AdaptationCategories.GOAL]);
  return freezeGoalHandoff({
    id: \`handoff:goal:\${input.contextId}\`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/index.ts",
  `export * from "./AdaptationBuilder";
export * from "./DecisionBuilder";
export * from "./DescriptorBuilder";
export * from "./HandoffBuilder";
export * from "./PackageBuilder";
export * from "./ResultBuilder";
export * from "./SnapshotBuilder";
export * from "./SummaryBuilder";
`,
);

// ─── VALIDATORS ───────────────────────────────────────────────────────────────

write(
  "validators/validateAdaptationIntegrity.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateAdaptationIntegrity(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  const ids = new Set<string>();
  for (const d of decisions) {
    if (!d.id)
      errors.push(createAdaptationError(AdaptationErrorCodes.INVALID_INPUT, "Decision id required"));
    if (ids.has(d.id))
      errors.push(
        createAdaptationError(AdaptationErrorCodes.VALIDATION_FAILED, "Duplicate decision id", d.id),
      );
    ids.add(d.id);
    if (!d.athleteId)
      errors.push(
        createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Athlete id required", d.id),
      );
    if (!d.contextId)
      errors.push(
        createAdaptationError(AdaptationErrorCodes.INVALID_INPUT, "Context id required", d.id),
      );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateTimelineConsistency.ts",
  `import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateTimelineConsistency(
  timeline: AdaptationTimeline | null,
): readonly AdaptationError[] {
  if (!timeline) return Object.freeze([]);
  const errors: AdaptationError[] = [];
  const ids = new Set<string>();
  for (const item of timeline.items) {
    if (ids.has(item.id)) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.INCONSISTENT_TIMELINE,
          "Duplicate timeline item id",
          item.id,
        ),
      );
    }
    ids.add(item.id);
    if (!item.at) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.INCONSISTENT_TIMELINE,
          "Timeline item missing timestamp",
          item.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateTriggerConsistency.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateTriggerConsistency(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    for (const t of d.triggers) {
      if (t.present && !d.signalKeys.includes(t.signalKey)) {
        errors.push(
          createAdaptationError(
            AdaptationErrorCodes.INCONSISTENT_TRIGGER,
            \`Present trigger signal missing from decision signalKeys: \${t.signalKey}\`,
            d.id,
          ),
        );
      }
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDependencies.ts",
  `import type { AdaptationDependency } from "../models/AdaptationDependency";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateDependencies(
  dependencies: readonly AdaptationDependency[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const dep of dependencies) {
    if (!dep.fromId || !dep.toId) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.VALIDATION_FAILED,
          "Dependency requires fromId and toId",
          dep.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateHistory.ts",
  `import type { AdaptationHistory } from "../models/AdaptationHistory";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateHistory(
  history: AdaptationHistory | null,
): readonly AdaptationError[] {
  if (!history) return Object.freeze([]);
  const errors: AdaptationError[] = [];
  if (!history.athleteId) {
    errors.push(
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "History athlete id required", history.id),
    );
  }
  const ids = new Set<string>();
  for (const e of history.entries) {
    if (ids.has(e.id)) {
      errors.push(
        createAdaptationError(AdaptationErrorCodes.VALIDATION_FAILED, "Duplicate history entry", e.id),
      );
    }
    ids.add(e.id);
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateSnapshot.ts",
  `import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateSnapshot(
  snapshot: AdaptationSnapshot | null,
): readonly AdaptationError[] {
  if (!snapshot) return Object.freeze([]);
  const errors: AdaptationError[] = [];
  if (!snapshot.athleteId) {
    errors.push(
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Snapshot athlete id required", snapshot.id),
    );
  }
  if (!snapshot.contextId) {
    errors.push(
      createAdaptationError(AdaptationErrorCodes.INVALID_INPUT, "Snapshot context id required", snapshot.id),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validatePackage.ts",
  `import type { AdaptationPackage } from "../models/AdaptationPackage";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";
import type { AdaptationValidation } from "../models/AdaptationValidation";
import { validateAdaptationIntegrity } from "./validateAdaptationIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateHistory } from "./validateHistory";
import { validateSnapshot } from "./validateSnapshot";
import { validateTimelineConsistency } from "./validateTimelineConsistency";
import { validateTriggerConsistency } from "./validateTriggerConsistency";

export function validateAdaptationPackage(pkg: AdaptationPackage): AdaptationValidation {
  const issues: AdaptationError[] = [
    ...validateAdaptationIntegrity(pkg.decisions),
    ...validateTriggerConsistency(pkg.decisions),
    ...validateTimelineConsistency(pkg.timeline),
    ...validateHistory(pkg.history),
    ...validateSnapshot(pkg.snapshot),
    ...validateDependencies(pkg.dependencies),
  ];
  if (!pkg.athleteId) {
    issues.push(
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Package athlete id required", pkg.id),
    );
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/index.ts",
  `export * from "./validateAdaptationIntegrity";
export * from "./validateDependencies";
export * from "./validateHistory";
export * from "./validatePackage";
export * from "./validateSnapshot";
export * from "./validateTimelineConsistency";
export * from "./validateTriggerConsistency";
`,
);

console.log(`Generated ${fileCount} files under continuous-adaptation (part 3).`);
