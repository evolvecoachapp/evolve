/**
 * Sprint 23.1 — Continuous Adaptation Engine generator (part 2: utils, monitoring, evaluation, detection).
 * Run after part 1: node scripts/generate-continuous-adaptation-part2.mjs
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

// ─── UTILS ────────────────────────────────────────────────────────────────────

write(
  "utils/FreezeAdaptationState.ts",
  `import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import type { AdaptationCondition } from "../models/AdaptationCondition";
import type { AdaptationConstraint } from "../models/AdaptationConstraint";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDependency } from "../models/AdaptationDependency";
import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationDiagnostics } from "../models/AdaptationDiagnostics";
import type { AdaptationEvaluation } from "../models/AdaptationEvaluation";
import type { AdaptationHistory, AdaptationHistoryEntry } from "../models/AdaptationHistory";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationMetadata } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import type { AdaptationOutput } from "../models/AdaptationOutput";
import type { AdaptationPackage } from "../models/AdaptationPackage";
import type { AdaptationPriority } from "../models/AdaptationPriority";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AdaptationReference } from "../models/AdaptationReference";
import type { AdaptationResult } from "../models/AdaptationResult";
import type { AdaptationSeverity } from "../models/AdaptationSeverity";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationState } from "../models/AdaptationState";
import type { AdaptationStatistics } from "../models/AdaptationStatistics";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import type { AdaptationTimeline, AdaptationTimelineItem } from "../models/AdaptationTimeline";
import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import type { AdaptationValidation } from "../models/AdaptationValidation";
import type { AdaptationWindow } from "../models/AdaptationWindow";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";

export function freezeMetadata(m: AdaptationMetadata): AdaptationMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezePriority(p: AdaptationPriority): AdaptationPriority {
  return Object.freeze({ ...p });
}

export function freezeSeverity(s: AdaptationSeverity): AdaptationSeverity {
  return Object.freeze({ ...s });
}

export function freezeReason(r: AdaptationReason): AdaptationReason {
  return Object.freeze({
    ...r,
    signalKeys: Object.freeze([...r.signalKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeTrigger(t: AdaptationTrigger): AdaptationTrigger {
  return Object.freeze({ ...t, metadata: freezeMetadata(t.metadata) });
}

export function freezeCondition(c: AdaptationCondition): AdaptationCondition {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeCandidate(c: AdaptationCandidate): AdaptationCandidate {
  return Object.freeze({
    ...c,
    triggerIds: Object.freeze([...c.triggerIds]),
    signalKeys: Object.freeze([...c.signalKeys]),
    priority: freezePriority(c.priority),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeOpportunity(o: AdaptationOpportunity): AdaptationOpportunity {
  return Object.freeze({
    ...o,
    candidateIds: Object.freeze([...o.candidateIds]),
    signalKeys: Object.freeze([...o.signalKeys]),
    severity: freezeSeverity(o.severity),
    metadata: freezeMetadata(o.metadata),
  });
}

export function freezeEvaluation(e: AdaptationEvaluation): AdaptationEvaluation {
  return Object.freeze({
    ...e,
    priority: freezePriority(e.priority),
    severity: freezeSeverity(e.severity),
    signalKeys: Object.freeze([...e.signalKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeDependency(d: AdaptationDependency): AdaptationDependency {
  return Object.freeze({ ...d, metadata: freezeMetadata(d.metadata) });
}

export function freezeConstraint(c: AdaptationConstraint): AdaptationConstraint {
  return Object.freeze({
    ...c,
    subjectKeys: Object.freeze([...c.subjectKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeReference(r: AdaptationReference): AdaptationReference {
  return Object.freeze({ ...r, metadata: freezeMetadata(r.metadata) });
}

export function freezeDecision(d: AdaptationDecision): AdaptationDecision {
  return Object.freeze({
    ...d,
    triggers: Object.freeze(d.triggers.map(freezeTrigger)),
    conditions: Object.freeze(d.conditions.map(freezeCondition)),
    candidates: Object.freeze(d.candidates.map(freezeCandidate)),
    opportunities: Object.freeze(d.opportunities.map(freezeOpportunity)),
    reasons: Object.freeze(d.reasons.map(freezeReason)),
    evaluation: freezeEvaluation(d.evaluation),
    priority: freezePriority(d.priority),
    severity: freezeSeverity(d.severity),
    dependencies: Object.freeze(d.dependencies.map(freezeDependency)),
    constraints: Object.freeze(d.constraints.map(freezeConstraint)),
    signalKeys: Object.freeze([...d.signalKeys]),
    sourceKeys: Object.freeze([...d.sourceKeys]),
    metadata: freezeMetadata(d.metadata),
  });
}

export function freezeSummary(s: AdaptationSummary): AdaptationSummary {
  return Object.freeze({
    ...s,
    categoryKeys: Object.freeze([...s.categoryKeys]),
    signalKeys: Object.freeze([...s.signalKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeSnapshot(s: AdaptationSnapshot): AdaptationSnapshot {
  return Object.freeze({
    ...s,
    decisions: Object.freeze(s.decisions.map(freezeDecision)),
    summary: s.summary ? freezeSummary(s.summary) : null,
    signalKeys: Object.freeze([...s.signalKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeTimelineItem(i: AdaptationTimelineItem): AdaptationTimelineItem {
  return Object.freeze({ ...i, metadata: freezeMetadata(i.metadata) });
}

export function freezeTimeline(t: AdaptationTimeline): AdaptationTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeHistoryEntry(e: AdaptationHistoryEntry): AdaptationHistoryEntry {
  return Object.freeze({
    ...e,
    signalKeys: Object.freeze([...e.signalKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeHistory(h: AdaptationHistory): AdaptationHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeWindow(w: AdaptationWindow): AdaptationWindow {
  return Object.freeze({
    ...w,
    itemIds: Object.freeze([...w.itemIds]),
    metadata: freezeMetadata(w.metadata),
  });
}

export function freezeStatistics(s: AdaptationStatistics): AdaptationStatistics {
  return Object.freeze({
    ...s,
    byCategory: Object.freeze({ ...s.byCategory }),
    bySeverity: Object.freeze({ ...s.bySeverity }),
  });
}

export function freezeDiagnostics(d: AdaptationDiagnostics): AdaptationDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeWorkoutHandoff(i: WorkoutAdaptationInput): WorkoutAdaptationInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeNutritionHandoff(i: NutritionAdaptationInput): NutritionAdaptationInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeRecoveryHandoff(i: RecoveryAdaptationInput): RecoveryAdaptationInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeGoalHandoff(i: GoalProgressInput): GoalProgressInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeContext(c: AdaptationContext): AdaptationContext {
  return Object.freeze({
    ...c,
    focusAreaKeys: Object.freeze([...c.focusAreaKeys]),
    stateKeys: Object.freeze([...c.stateKeys]),
    decisionIds: Object.freeze([...c.decisionIds]),
    recommendationIds: Object.freeze([...c.recommendationIds]),
    explanationIds: Object.freeze([...c.explanationIds]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezePackage(p: AdaptationPackage): AdaptationPackage {
  return Object.freeze({
    ...p,
    decisions: Object.freeze(p.decisions.map(freezeDecision)),
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    history: p.history ? freezeHistory(p.history) : null,
    window: p.window ? freezeWindow(p.window) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    workoutAdaptationInput: p.workoutAdaptationInput
      ? freezeWorkoutHandoff(p.workoutAdaptationInput)
      : null,
    nutritionAdaptationInput: p.nutritionAdaptationInput
      ? freezeNutritionHandoff(p.nutritionAdaptationInput)
      : null,
    recoveryAdaptationInput: p.recoveryAdaptationInput
      ? freezeRecoveryHandoff(p.recoveryAdaptationInput)
      : null,
    goalProgressInput: p.goalProgressInput ? freezeGoalHandoff(p.goalProgressInput) : null,
    dependencies: Object.freeze(p.dependencies.map(freezeDependency)),
    constraints: Object.freeze(p.constraints.map(freezeConstraint)),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeInput(i: AdaptationInput): AdaptationInput {
  return Object.freeze({
    ...i,
    decisions: Object.freeze([...i.decisions]),
    recommendations: Object.freeze([...i.recommendations]),
    explanations: Object.freeze([...i.explanations]),
    stateKeys: Object.freeze([...i.stateKeys]),
    performanceKeys: Object.freeze([...i.performanceKeys]),
    recoveryKeys: Object.freeze([...i.recoveryKeys]),
    nutritionKeys: Object.freeze([...i.nutritionKeys]),
    goalKeys: Object.freeze([...i.goalKeys]),
    adherenceKeys: Object.freeze([...i.adherenceKeys]),
    historyKeys: Object.freeze([...i.historyKeys]),
    timelineKeys: Object.freeze([...i.timelineKeys]),
    signalFlags: Object.freeze({ ...i.signalFlags }),
    priorSnapshot: i.priorSnapshot ? freezeSnapshot(i.priorSnapshot) : null,
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeOutput(o: AdaptationOutput): AdaptationOutput {
  return Object.freeze({
    decisions: Object.freeze(o.decisions.map(freezeDecision)),
    package: o.package ? freezePackage(o.package) : null,
    workoutAdaptationInput: o.workoutAdaptationInput
      ? freezeWorkoutHandoff(o.workoutAdaptationInput)
      : null,
    nutritionAdaptationInput: o.nutritionAdaptationInput
      ? freezeNutritionHandoff(o.nutritionAdaptationInput)
      : null,
    recoveryAdaptationInput: o.recoveryAdaptationInput
      ? freezeRecoveryHandoff(o.recoveryAdaptationInput)
      : null,
    goalProgressInput: o.goalProgressInput ? freezeGoalHandoff(o.goalProgressInput) : null,
  });
}

export function freezeResult(r: AdaptationResult): AdaptationResult {
  return Object.freeze({
    ...r,
    decisions: Object.freeze(r.decisions.map(freezeDecision)),
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    workoutAdaptationInput: r.workoutAdaptationInput
      ? freezeWorkoutHandoff(r.workoutAdaptationInput)
      : null,
    nutritionAdaptationInput: r.nutritionAdaptationInput
      ? freezeNutritionHandoff(r.nutritionAdaptationInput)
      : null,
    recoveryAdaptationInput: r.recoveryAdaptationInput
      ? freezeRecoveryHandoff(r.recoveryAdaptationInput)
      : null,
    goalProgressInput: r.goalProgressInput ? freezeGoalHandoff(r.goalProgressInput) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}

export function freezeState(s: AdaptationState): AdaptationState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    decisions: Object.freeze(s.decisions.map(freezeDecision)),
  });
}

export function freezeDescriptor(d: AdaptationDescriptor): AdaptationDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: AdaptationValidation): AdaptationValidation {
  return Object.freeze({ ...v, issues: Object.freeze([...v.issues]) });
}
`,
);

write(
  "utils/AdaptationHelpers.ts",
  `import type { AdaptationInput } from "../models/AdaptationInput";

export function collectPresentSignalKeys(input: AdaptationInput): readonly string[] {
  const keys = new Set<string>();
  for (const k of input.stateKeys) keys.add(k);
  for (const k of input.performanceKeys) keys.add(k);
  for (const k of input.recoveryKeys) keys.add(k);
  for (const k of input.nutritionKeys) keys.add(k);
  for (const k of input.goalKeys) keys.add(k);
  for (const k of input.adherenceKeys) keys.add(k);
  for (const k of input.historyKeys) keys.add(k);
  for (const k of input.timelineKeys) keys.add(k);
  for (const [flag, present] of Object.entries(input.signalFlags)) {
    if (present) keys.add(flag);
  }
  return Object.freeze([...keys].sort());
}

export function countPresentFlags(flags: Readonly<Record<string, boolean>>): number {
  let n = 0;
  for (const v of Object.values(flags)) if (v) n += 1;
  return n;
}

export function uniqueSorted(keys: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(keys)].sort());
}

export function keysPresent(keys: readonly string[], prefix?: string): readonly string[] {
  if (!prefix) return uniqueSorted(keys);
  return uniqueSorted(keys.filter((k) => k.startsWith(prefix)));
}
`,
);

write(
  "utils/TimelineHelpers.ts",
  `import type { AdaptationTimelineItem } from "../models/AdaptationTimeline";

export function sortTimelineItems(
  items: readonly AdaptationTimelineItem[],
): readonly AdaptationTimelineItem[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.at < b.at) return -1;
      if (a.at > b.at) return 1;
      return a.id.localeCompare(b.id);
    }),
  );
}

export function timelineSubjectIds(
  items: readonly AdaptationTimelineItem[],
): readonly string[] {
  return Object.freeze([...new Set(items.map((i) => i.subjectId))].sort());
}
`,
);

write(
  "utils/StatisticsHelpers.ts",
  `import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationStatistics } from "../models/AdaptationStatistics";
import { freezeStatistics } from "./FreezeAdaptationState";

export function buildStatistics(
  decisions: readonly AdaptationDecision[],
): AdaptationStatistics {
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let totalTriggers = 0;
  let totalOpportunities = 0;
  const signals = new Set<string>();

  for (const d of decisions) {
    byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
    bySeverity[d.severity.level] = (bySeverity[d.severity.level] ?? 0) + 1;
    totalTriggers += d.triggers.length;
    totalOpportunities += d.opportunities.length;
    for (const k of d.signalKeys) signals.add(k);
  }

  return freezeStatistics({
    totalDecisions: decisions.length,
    totalTriggers,
    totalOpportunities,
    byCategory: Object.freeze({ ...byCategory }),
    bySeverity: Object.freeze({ ...bySeverity }),
    signalCount: signals.size,
  });
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `export function formatKeyList(keys: readonly string[]): string {
  return keys.join(",");
}

export function formatId(prefix: string, ...parts: readonly string[]): string {
  return [prefix, ...parts].join(":");
}
`,
);

write(
  "utils/index.ts",
  `export * from "./AdaptationHelpers";
export * from "./FormattingHelpers";
export * from "./FreezeAdaptationState";
export * from "./StatisticsHelpers";
export * from "./TimelineHelpers";
`,
);

// ─── MONITORING (observation only) ────────────────────────────────────────────

const monitorTemplate = (name, domain, keysField) => `import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface ${name}Observation {
  readonly id: string;
  readonly domain: "${domain}";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observe${name.replace("Monitor", "")}(
  input: AdaptationInput,
  at: string,
): ${name}Observation {
  const keys = uniqueSorted(input.${keysField});
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("${domain}"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: \`obs:${domain}:\${input.id}\`,
    domain: "${domain}",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("${domain}")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const ${name} = {
  observe: observe${name.replace("Monitor", "")},
  metadata: EMPTY_ADAPTATION_METADATA,
};
`;

write("monitoring/StateMonitor.ts", monitorTemplate("StateMonitor", "state", "stateKeys"));
write(
  "monitoring/PerformanceMonitor.ts",
  monitorTemplate("PerformanceMonitor", "performance", "performanceKeys"),
);
write(
  "monitoring/RecoveryMonitor.ts",
  monitorTemplate("RecoveryMonitor", "recovery", "recoveryKeys"),
);
write(
  "monitoring/NutritionMonitor.ts",
  monitorTemplate("NutritionMonitor", "nutrition", "nutritionKeys"),
);
write("monitoring/GoalMonitor.ts", monitorTemplate("GoalMonitor", "goal", "goalKeys"));
write(
  "monitoring/AdherenceMonitor.ts",
  monitorTemplate("AdherenceMonitor", "adherence", "adherenceKeys"),
);
write(
  "monitoring/HistoryMonitor.ts",
  monitorTemplate("HistoryMonitor", "history", "historyKeys"),
);
write(
  "monitoring/TimelineMonitor.ts",
  monitorTemplate("TimelineMonitor", "timeline", "timelineKeys"),
);

write(
  "monitoring/index.ts",
  `export * from "./AdherenceMonitor";
export * from "./GoalMonitor";
export * from "./HistoryMonitor";
export * from "./NutritionMonitor";
export * from "./PerformanceMonitor";
export * from "./RecoveryMonitor";
export * from "./StateMonitor";
export * from "./TimelineMonitor";
`,
);

// ─── EVALUATION (deterministic tables) ────────────────────────────────────────

write(
  "evaluation/AdaptationEvaluator.ts",
  `import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import type { AdaptationEvaluation } from "../models/AdaptationEvaluation";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import { priorityForOrdinal } from "../models/AdaptationPriority";
import { severityForSignalCount } from "../models/AdaptationSeverity";
import { freezeEvaluation } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";
import { evaluateConsistencyOrdinal } from "./ConsistencyEvaluator";
import { evaluateDependencyCount } from "./DependencyEvaluator";
import { evaluateRiskOrdinal } from "./RiskEvaluator";

export function evaluateAdaptationSignals(input: {
  readonly subjectId: string;
  readonly triggers: readonly AdaptationTrigger[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
  readonly dependencyFromIds: readonly string[];
}): AdaptationEvaluation {
  const presentTriggers = input.triggers.filter((t) => t.present);
  const signalKeys = uniqueSorted([
    ...presentTriggers.map((t) => t.signalKey),
    ...input.candidates.flatMap((c) => c.signalKeys),
    ...input.opportunities.flatMap((o) => o.signalKeys),
  ]);
  const priority = priorityForOrdinal(Math.min(3, presentTriggers.length === 0 ? 3 : presentTriggers.length - 1));
  const severity = severityForSignalCount(signalKeys.length);
  return freezeEvaluation({
    id: \`eval:\${input.subjectId}\`,
    subjectId: input.subjectId,
    priority,
    severity,
    riskOrdinal: evaluateRiskOrdinal(severity.ordinal, presentTriggers.length),
    consistencyOrdinal: evaluateConsistencyOrdinal(presentTriggers.length, input.candidates.length),
    dependencyCount: evaluateDependencyCount(input.dependencyFromIds),
    signalKeys,
    metadata: EMPTY_ADAPTATION_METADATA,
  });
}
`,
);

write(
  "evaluation/PriorityEvaluator.ts",
  `import { priorityForOrdinal, type AdaptationPriority } from "../models/AdaptationPriority";

/** Deterministic ordinal lookup only. */
export function evaluatePriority(ordinal: number): AdaptationPriority {
  return priorityForOrdinal(ordinal);
}

/** Fixed category → ordinal table. */
const CATEGORY_ORDINAL: Readonly<Record<string, number>> = Object.freeze({
  recovery: 0,
  workout: 1,
  nutrition: 2,
  goal: 2,
  performance: 1,
  adherence: 3,
  state: 2,
  general: 3,
});

export function evaluatePriorityForCategory(category: string): AdaptationPriority {
  return priorityForOrdinal(CATEGORY_ORDINAL[category] ?? 3);
}
`,
);

write(
  "evaluation/SeverityEvaluator.ts",
  `import { severityForSignalCount, type AdaptationSeverity } from "../models/AdaptationSeverity";

/** Deterministic signal-count table only. */
export function evaluateSeverity(signalCount: number): AdaptationSeverity {
  return severityForSignalCount(signalCount);
}
`,
);

write(
  "evaluation/DependencyEvaluator.ts",
  `/** Deterministic count of dependency ids only. */
export function evaluateDependencyCount(fromIds: readonly string[]): number {
  return new Set(fromIds).size;
}
`,
);

write(
  "evaluation/ConsistencyEvaluator.ts",
  `/**
 * Deterministic ordinal table:
 * triggers vs candidates alignment → 0 (aligned) .. 3 (sparse).
 */
export function evaluateConsistencyOrdinal(
  presentTriggerCount: number,
  candidateCount: number,
): number {
  if (presentTriggerCount === 0 && candidateCount === 0) return 0;
  if (presentTriggerCount === candidateCount) return 0;
  if (Math.abs(presentTriggerCount - candidateCount) === 1) return 1;
  if (Math.abs(presentTriggerCount - candidateCount) === 2) return 2;
  return 3;
}
`,
);

write(
  "evaluation/RiskEvaluator.ts",
  `/**
 * Deterministic table: riskOrdinal = clamp(severityOrdinal + triggerBonus, 0, 4)
 * where triggerBonus is 0 if triggers<=1 else 1 if triggers<=3 else 2.
 */
export function evaluateRiskOrdinal(severityOrdinal: number, presentTriggerCount: number): number {
  const bonus = presentTriggerCount <= 1 ? 0 : presentTriggerCount <= 3 ? 1 : 2;
  return Math.max(0, Math.min(4, severityOrdinal + bonus));
}
`,
);

write(
  "evaluation/index.ts",
  `export * from "./AdaptationEvaluator";
export * from "./ConsistencyEvaluator";
export * from "./DependencyEvaluator";
export * from "./PriorityEvaluator";
export * from "./RiskEvaluator";
export * from "./SeverityEvaluator";
`,
);

// ─── DETECTION (signal presence only) ─────────────────────────────────────────

const detectorTemplate = (name, kind, signalPrefixes) => `import { AdaptationCategories } from "../models/AdaptationCategory";
import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import { AdaptationTriggerKinds, type AdaptationTrigger } from "../models/AdaptationTrigger";
import type { AdaptationInput } from "../models/AdaptationInput";
import { priorityForOrdinal } from "../models/AdaptationPriority";
import { severityForSignalCount } from "../models/AdaptationSeverity";
import { freezeCandidate, freezeOpportunity, freezeTrigger } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

const PREFIXES = Object.freeze(${JSON.stringify(signalPrefixes)} as string[]);

function matchingKeys(input: AdaptationInput): readonly string[] {
  const all = uniqueSorted([
    ...input.stateKeys,
    ...input.performanceKeys,
    ...input.recoveryKeys,
    ...input.nutritionKeys,
    ...input.goalKeys,
    ...input.adherenceKeys,
    ...input.historyKeys,
    ...input.timelineKeys,
    ...Object.entries(input.signalFlags).filter(([, v]) => v).map(([k]) => k),
  ]);
  return uniqueSorted(all.filter((k) => PREFIXES.some((p) => k.includes(p))));
}

/** Detect signal key/flag presence only — no prediction. */
export function detect${name.replace("Detector", "")}(input: AdaptationInput): {
  readonly triggers: readonly AdaptationTrigger[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
} {
  const keys = matchingKeys(input);
  const triggers = Object.freeze(
    keys.map((signalKey, i) =>
      freezeTrigger({
        id: \`trigger:${kind}:\${i}:\${input.id}\`,
        kind: AdaptationTriggerKinds.${kind.toUpperCase()},
        signalKey,
        subjectId: input.athleteId,
        present: true,
        metadata: EMPTY_ADAPTATION_METADATA,
      }),
    ),
  );
  const candidates = Object.freeze(
    keys.length === 0
      ? []
      : [
          freezeCandidate({
            id: \`candidate:${kind}:\${input.id}\`,
            category: AdaptationCategories.GENERAL,
            subjectId: input.athleteId,
            triggerIds: Object.freeze(triggers.map((t) => t.id)),
            signalKeys: keys,
            priority: priorityForOrdinal(Math.min(3, Math.max(0, keys.length - 1))),
            metadata: EMPTY_ADAPTATION_METADATA,
          }),
        ],
  );
  const opportunities = Object.freeze(
    keys.length === 0
      ? []
      : [
          freezeOpportunity({
            id: \`opportunity:${kind}:\${input.id}\`,
            category: AdaptationCategories.GENERAL,
            subjectId: input.athleteId,
            candidateIds: Object.freeze(candidates.map((c) => c.id)),
            signalKeys: keys,
            severity: severityForSignalCount(keys.length),
            metadata: EMPTY_ADAPTATION_METADATA,
          }),
        ],
  );
  return Object.freeze({ triggers, candidates, opportunities });
}

export const ${name} = { detect: detect${name.replace("Detector", "")} };
`;

write(
  "detection/PlateauDetector.ts",
  detectorTemplate("PlateauDetector", "plateau", ["plateau", "flat"]),
);
write(
  "detection/RegressionDetector.ts",
  detectorTemplate("RegressionDetector", "regression", ["regression", "decline"]),
);
write(
  "detection/ProgressDetector.ts",
  detectorTemplate("ProgressDetector", "progress", ["progress", "improve"]),
);
write(
  "detection/RecoveryDetector.ts",
  detectorTemplate("RecoveryDetector", "recovery", ["recovery"]),
);
write(
  "detection/ConsistencyDetector.ts",
  detectorTemplate("ConsistencyDetector", "consistency", ["consistency", "stable"]),
);
write(
  "detection/AdherenceDetector.ts",
  detectorTemplate("AdherenceDetector", "adherence", ["adherence", "compliance"]),
);
write(
  "detection/TrendDetector.ts",
  detectorTemplate("TrendDetector", "trend", ["trend"]),
);

write(
  "detection/index.ts",
  `export * from "./AdherenceDetector";
export * from "./ConsistencyDetector";
export * from "./PlateauDetector";
export * from "./ProgressDetector";
export * from "./RecoveryDetector";
export * from "./RegressionDetector";
export * from "./TrendDetector";
`,
);

console.log(`Generated ${fileCount} files under continuous-adaptation (part 2).`);
