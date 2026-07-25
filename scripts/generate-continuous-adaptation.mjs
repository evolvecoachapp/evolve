/**
 * Sprint 23.1 — Continuous Adaptation Engine generator (part 1: models).
 * Run: node scripts/generate-continuous-adaptation.mjs
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

// ─── MODELS ───────────────────────────────────────────────────────────────────

write(
  "models/AdaptationMetadata.ts",
  `export interface AdaptationMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_ADAPTATION_METADATA: AdaptationMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/AdaptationCategory.ts",
  `export const AdaptationCategories = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  PERFORMANCE: "performance",
  ADHERENCE: "adherence",
  STATE: "state",
  GENERAL: "general",
} as const;

export type AdaptationCategory =
  (typeof AdaptationCategories)[keyof typeof AdaptationCategories];
`,
);

write(
  "models/AdaptationPriority.ts",
  `export const AdaptationPriorityLabels = {
  CRITICAL: "critical",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
} as const;

export type AdaptationPriorityLabel =
  (typeof AdaptationPriorityLabels)[keyof typeof AdaptationPriorityLabels];

export interface AdaptationPriority {
  readonly ordinal: number;
  readonly urgency: number;
  readonly label: AdaptationPriorityLabel;
}

/** Deterministic ordinal → priority table (no heuristics). */
export function priorityForOrdinal(ordinal: number): AdaptationPriority {
  const clamped = Math.max(0, Math.min(3, Math.floor(ordinal)));
  const labels: AdaptationPriorityLabel[] = ["critical", "high", "normal", "low"];
  return Object.freeze({
    ordinal: clamped,
    urgency: Math.max(0, 100 - clamped * 25),
    label: labels[clamped]!,
  });
}
`,
);

write(
  "models/AdaptationSeverity.ts",
  `export const AdaptationSeverityLevels = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type AdaptationSeverityLevel =
  (typeof AdaptationSeverityLevels)[keyof typeof AdaptationSeverityLevels];

export interface AdaptationSeverity {
  readonly level: AdaptationSeverityLevel;
  readonly ordinal: number;
}

/** Deterministic signal-count → severity table. */
export function severityForSignalCount(count: number): AdaptationSeverity {
  const n = Math.max(0, Math.floor(count));
  if (n >= 4) return Object.freeze({ level: AdaptationSeverityLevels.CRITICAL, ordinal: 0 });
  if (n === 3) return Object.freeze({ level: AdaptationSeverityLevels.HIGH, ordinal: 1 });
  if (n === 2) return Object.freeze({ level: AdaptationSeverityLevels.MEDIUM, ordinal: 2 });
  if (n === 1) return Object.freeze({ level: AdaptationSeverityLevels.LOW, ordinal: 3 });
  return Object.freeze({ level: AdaptationSeverityLevels.NONE, ordinal: 4 });
}
`,
);

write(
  "models/AdaptationReason.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export const AdaptationReasonCodes = {
  SIGNAL_PRESENT: "signal_present",
  TRIGGER_FIRED: "trigger_fired",
  CONDITION_MET: "condition_met",
  PRIORITY_ORDERING: "priority_ordering",
  SEVERITY_LEVEL: "severity_level",
  DEPENDENCY_REQUIRED: "dependency_required",
  CONSTRAINT_APPLIED: "constraint_applied",
  CONSISTENCY_CHECK: "consistency_check",
  HISTORY_REFERENCE: "history_reference",
  WINDOW_MATCH: "window_match",
} as const;

export type AdaptationReasonCode =
  (typeof AdaptationReasonCodes)[keyof typeof AdaptationReasonCodes];

export interface AdaptationReason {
  readonly id: string;
  readonly code: AdaptationReasonCode;
  readonly subjectId: string;
  readonly category: string;
  readonly statementKey: string;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationTrigger.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export const AdaptationTriggerKinds = {
  PLATEAU: "plateau",
  REGRESSION: "regression",
  PROGRESS: "progress",
  RECOVERY: "recovery",
  CONSISTENCY: "consistency",
  ADHERENCE: "adherence",
  TREND: "trend",
  STATE: "state",
} as const;

export type AdaptationTriggerKind =
  (typeof AdaptationTriggerKinds)[keyof typeof AdaptationTriggerKinds];

export interface AdaptationTrigger {
  readonly id: string;
  readonly kind: AdaptationTriggerKind;
  readonly signalKey: string;
  readonly subjectId: string;
  readonly present: boolean;
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationCondition.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationCondition {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly met: boolean;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationCandidate.ts",
  `import type { AdaptationCategory } from "./AdaptationCategory";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationPriority } from "./AdaptationPriority";

export interface AdaptationCandidate {
  readonly id: string;
  readonly category: AdaptationCategory;
  readonly subjectId: string;
  readonly triggerIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly priority: AdaptationPriority;
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationOpportunity.ts",
  `import type { AdaptationCategory } from "./AdaptationCategory";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSeverity } from "./AdaptationSeverity";

export interface AdaptationOpportunity {
  readonly id: string;
  readonly category: AdaptationCategory;
  readonly subjectId: string;
  readonly candidateIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly severity: AdaptationSeverity;
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationEvaluation.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationPriority } from "./AdaptationPriority";
import type { AdaptationSeverity } from "./AdaptationSeverity";

export interface AdaptationEvaluation {
  readonly id: string;
  readonly subjectId: string;
  readonly priority: AdaptationPriority;
  readonly severity: AdaptationSeverity;
  readonly riskOrdinal: number;
  readonly consistencyOrdinal: number;
  readonly dependencyCount: number;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationWindow.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationWindow {
  readonly id: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly itemIds: readonly string[];
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationHistory.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationHistoryEntry {
  readonly id: string;
  readonly subjectId: string;
  readonly kind: string;
  readonly at: string;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}

export interface AdaptationHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly AdaptationHistoryEntry[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationTimeline.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationTimelineItem {
  readonly id: string;
  readonly subjectId: string;
  readonly operation: string;
  readonly at: string;
  readonly metadata: AdaptationMetadata;
}

export interface AdaptationTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly AdaptationTimelineItem[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationReference.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationReference {
  readonly id: string;
  readonly adaptationId: string;
  readonly key: string;
  readonly kind: string;
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationDependency.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationDependency {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: string;
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationConstraint.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationConstraint {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly subjectKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}
`,
);

write(
  "models/AdaptationStatistics.ts",
  `export interface AdaptationStatistics {
  readonly totalDecisions: number;
  readonly totalTriggers: number;
  readonly totalOpportunities: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly bySeverity: Readonly<Record<string, number>>;
  readonly signalCount: number;
}
`,
);

write(
  "models/AdaptationDiagnostics.ts",
  `export interface AdaptationDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly processingSteps: readonly string[];
}
`,
);

write(
  "models/AdaptationSummary.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionCount: number;
  readonly opportunityCount: number;
  readonly triggerCount: number;
  readonly categoryKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationSnapshot.ts",
  `import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSummary } from "./AdaptationSummary";

export interface AdaptationSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly summary: AdaptationSummary | null;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationContext.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly focusAreaKeys: readonly string[];
  readonly stateKeys: readonly string[];
  readonly decisionIds: readonly string[];
  readonly recommendationIds: readonly string[];
  readonly explanationIds: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutAdaptationInput.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

/**
 * Handoff input only — does NOT modify workout plans.
 */
export interface WorkoutAdaptationInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly categoryKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/NutritionAdaptationInput.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

/**
 * Handoff input only — does NOT modify nutrition plans.
 */
export interface NutritionAdaptationInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly categoryKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/RecoveryAdaptationInput.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

/**
 * Handoff input only — does NOT modify recovery plans.
 */
export interface RecoveryAdaptationInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly categoryKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/GoalProgressInput.ts",
  `import type { AdaptationMetadata } from "./AdaptationMetadata";

/**
 * Handoff input only — does NOT modify goals.
 */
export interface GoalProgressInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly categoryKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationDecision.ts",
  `import type { AdaptationCandidate } from "./AdaptationCandidate";
import type { AdaptationCategory } from "./AdaptationCategory";
import type { AdaptationCondition } from "./AdaptationCondition";
import type { AdaptationConstraint } from "./AdaptationConstraint";
import type { AdaptationDependency } from "./AdaptationDependency";
import type { AdaptationEvaluation } from "./AdaptationEvaluation";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationOpportunity } from "./AdaptationOpportunity";
import type { AdaptationPriority } from "./AdaptationPriority";
import type { AdaptationReason } from "./AdaptationReason";
import type { AdaptationSeverity } from "./AdaptationSeverity";
import type { AdaptationTrigger } from "./AdaptationTrigger";

/**
 * Primary Continuous Adaptation Engine output.
 * Adaptation detection only — never modifies plans.
 */
export interface AdaptationDecision {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: AdaptationCategory;
  readonly triggers: readonly AdaptationTrigger[];
  readonly conditions: readonly AdaptationCondition[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
  readonly reasons: readonly AdaptationReason[];
  readonly evaluation: AdaptationEvaluation;
  readonly priority: AdaptationPriority;
  readonly severity: AdaptationSeverity;
  readonly dependencies: readonly AdaptationDependency[];
  readonly constraints: readonly AdaptationConstraint[];
  readonly signalKeys: readonly string[];
  readonly sourceKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationOutput.ts",
  `import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationPackage } from "./AdaptationPackage";
import type { GoalProgressInput } from "./GoalProgressInput";
import type { NutritionAdaptationInput } from "./NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "./RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "./WorkoutAdaptationInput";

/**
 * Compact structured output handoff.
 */
export interface AdaptationOutput {
  readonly decisions: readonly AdaptationDecision[];
  readonly package: AdaptationPackage | null;
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
}
`,
);

write(
  "models/AdaptationPackage.ts",
  `import type { AdaptationConstraint } from "./AdaptationConstraint";
import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationDependency } from "./AdaptationDependency";
import type { AdaptationDiagnostics } from "./AdaptationDiagnostics";
import type { AdaptationHistory } from "./AdaptationHistory";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSnapshot } from "./AdaptationSnapshot";
import type { AdaptationStatistics } from "./AdaptationStatistics";
import type { AdaptationSummary } from "./AdaptationSummary";
import type { AdaptationTimeline } from "./AdaptationTimeline";
import type { AdaptationWindow } from "./AdaptationWindow";
import type { GoalProgressInput } from "./GoalProgressInput";
import type { NutritionAdaptationInput } from "./NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "./RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "./WorkoutAdaptationInput";

export interface AdaptationPackage {
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
  readonly diagnostics: AdaptationDiagnostics;
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
  readonly dependencies: readonly AdaptationDependency[];
  readonly constraints: readonly AdaptationConstraint[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationInput.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingExplanation } from "../../explainability-engine/models/CoachingExplanation";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSnapshot } from "./AdaptationSnapshot";

export const AdaptationInputKinds = {
  EVALUATE: "evaluate",
  DETECT: "detect",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type AdaptationInputKind =
  (typeof AdaptationInputKinds)[keyof typeof AdaptationInputKinds];

export interface AdaptationInput {
  readonly id: string;
  readonly kind: AdaptationInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly explanations: readonly CoachingExplanation[];
  readonly stateKeys: readonly string[];
  readonly performanceKeys: readonly string[];
  readonly recoveryKeys: readonly string[];
  readonly nutritionKeys: readonly string[];
  readonly goalKeys: readonly string[];
  readonly adherenceKeys: readonly string[];
  readonly historyKeys: readonly string[];
  readonly timelineKeys: readonly string[];
  readonly signalFlags: Readonly<Record<string, boolean>>;
  readonly priorSnapshot: AdaptationSnapshot | null;
  readonly reason: string;
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationError.ts",
  `export const AdaptationErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  INCONSISTENT_TRIGGER: "inconsistent_trigger",
  INCONSISTENT_TIMELINE: "inconsistent_timeline",
} as const;

export type AdaptationErrorCode =
  (typeof AdaptationErrorCodes)[keyof typeof AdaptationErrorCodes];

export interface AdaptationError {
  readonly code: AdaptationErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createAdaptationError(
  code: AdaptationErrorCode,
  message: string,
  subjectId: string | null = null,
): AdaptationError {
  return Object.freeze({ code, message, subjectId });
}
`,
);

write(
  "models/AdaptationValidation.ts",
  `import type { AdaptationError } from "./AdaptationError";

export interface AdaptationValidation {
  readonly valid: boolean;
  readonly issues: readonly AdaptationError[];
}
`,
);

write(
  "models/AdaptationDescriptor.ts",
  `export interface AdaptationDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly boundaries: readonly string[];
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationResult.ts",
  `import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationDescriptor } from "./AdaptationDescriptor";
import type { AdaptationError } from "./AdaptationError";
import type { AdaptationPackage } from "./AdaptationPackage";
import type { AdaptationSnapshot } from "./AdaptationSnapshot";
import type { AdaptationSummary } from "./AdaptationSummary";
import type { AdaptationValidation } from "./AdaptationValidation";
import type { GoalProgressInput } from "./GoalProgressInput";
import type { NutritionAdaptationInput } from "./NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "./RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "./WorkoutAdaptationInput";

export const AdaptationOperationKinds = {
  EVALUATE: "evaluate",
  DETECT: "detect",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type AdaptationOperationKind =
  (typeof AdaptationOperationKinds)[keyof typeof AdaptationOperationKinds];

export interface AdaptationResult {
  readonly id: string;
  readonly operation: AdaptationOperationKind;
  readonly success: boolean;
  readonly decisions: readonly AdaptationDecision[];
  readonly package: AdaptationPackage | null;
  readonly summary: AdaptationSummary | null;
  readonly snapshot: AdaptationSnapshot | null;
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
  readonly validation: AdaptationValidation | null;
  readonly descriptor: AdaptationDescriptor | null;
  readonly errors: readonly AdaptationError[];
  readonly createdAt: string;
}
`,
);

write(
  "models/AdaptationState.ts",
  `import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationPackage } from "./AdaptationPackage";

export const AdaptationSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type AdaptationSessionStatus =
  (typeof AdaptationSessionStatuses)[keyof typeof AdaptationSessionStatuses];

export interface AdaptationState {
  readonly status: AdaptationSessionStatus;
  readonly package: AdaptationPackage | null;
  readonly decisions: readonly AdaptationDecision[];
  readonly updatedAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./AdaptationCandidate";
export * from "./AdaptationCategory";
export * from "./AdaptationCondition";
export * from "./AdaptationConstraint";
export * from "./AdaptationContext";
export * from "./AdaptationDecision";
export * from "./AdaptationDependency";
export * from "./AdaptationDescriptor";
export * from "./AdaptationDiagnostics";
export * from "./AdaptationError";
export * from "./AdaptationEvaluation";
export * from "./AdaptationHistory";
export * from "./AdaptationInput";
export * from "./AdaptationMetadata";
export * from "./AdaptationOpportunity";
export * from "./AdaptationOutput";
export * from "./AdaptationPackage";
export * from "./AdaptationPriority";
export * from "./AdaptationReason";
export * from "./AdaptationReference";
export * from "./AdaptationResult";
export * from "./AdaptationSeverity";
export * from "./AdaptationSnapshot";
export * from "./AdaptationState";
export * from "./AdaptationStatistics";
export * from "./AdaptationSummary";
export * from "./AdaptationTimeline";
export * from "./AdaptationTrigger";
export * from "./AdaptationValidation";
export * from "./AdaptationWindow";
export * from "./GoalProgressInput";
export * from "./NutritionAdaptationInput";
export * from "./RecoveryAdaptationInput";
export * from "./WorkoutAdaptationInput";
`,
);

console.log(`Generated ${fileCount} files under continuous-adaptation (part 1 models).`);
