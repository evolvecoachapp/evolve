/**
 * Sprint 22.1 — Athlete State Engine Foundation generator.
 * Run: node scripts/generate-athlete-state.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/athlete-state");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

// ─── Models ───────────────────────────────────────────────────────────────────

write(
  "models/AthleteMetadata.ts",
  `/**
 * Immutable metadata bag for athlete-state entities.
 */
export interface AthleteMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_ATHLETE_METADATA: AthleteMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/StateVersion.ts",
  `/**
 * Immutable version stamp for athlete state evolution.
 */
export interface StateVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly revision: number;
  readonly label: string;
}

export const INITIAL_STATE_VERSION: StateVersion = Object.freeze({
  major: 1,
  minor: 0,
  patch: 0,
  revision: 0,
  label: "1.0.0+0",
});

export function formatStateVersion(version: StateVersion): string {
  return \`\${version.major}.\${version.minor}.\${version.patch}+\${version.revision}\`;
}
`,
);

write(
  "models/AthleteIdentity.ts",
  `/**
 * Immutable athlete identity.
 */
export interface AthleteIdentity {
  readonly athleteId: string;
  readonly displayName: string | null;
  readonly externalIds: Readonly<Record<string, string>>;
}
`,
);

write(
  "models/AthleteStatus.ts",
  `export const AthleteStatusKinds = {
  UNKNOWN: "unknown",
  ACTIVE: "active",
  INACTIVE: "inactive",
  RECOVERING: "recovering",
  CONSTRAINED: "constrained",
} as const;

export type AthleteStatusKind =
  (typeof AthleteStatusKinds)[keyof typeof AthleteStatusKinds];

/**
 * Immutable high-level athlete status (representation only).
 */
export interface AthleteStatus {
  readonly kind: AthleteStatusKind;
  readonly label: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/BodyComposition.ts",
  `/**
 * Immutable body composition facts (no calculations).
 */
export interface BodyComposition {
  readonly bodyFatPercent: number | null;
  readonly leanMassKg: number | null;
  readonly fatMassKg: number | null;
  readonly recordedAt: string | null;
}
`,
);

write(
  "models/BodyMeasurements.ts",
  `/**
 * Immutable body measurements (no calculations).
 */
export interface BodyMeasurements {
  readonly heightCm: number | null;
  readonly weightKg: number | null;
  readonly waistCm: number | null;
  readonly chestCm: number | null;
  readonly hipsCm: number | null;
  readonly recordedAt: string | null;
}
`,
);

write(
  "models/AthleteMetrics.ts",
  `import type { BodyComposition } from "./BodyComposition";
import type { BodyMeasurements } from "./BodyMeasurements";

/**
 * Immutable metric container (representation only).
 */
export interface AthleteMetrics {
  readonly measurements: BodyMeasurements;
  readonly composition: BodyComposition;
  readonly restingHeartRate: number | null;
  readonly vo2Max: number | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/AthleteProfile.ts",
  `import type { AthleteIdentity } from "./AthleteIdentity";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteStatus } from "./AthleteStatus";

/**
 * Immutable athlete profile slice.
 */
export interface AthleteProfile {
  readonly identity: AthleteIdentity;
  readonly status: AthleteStatus;
  readonly sex: string | null;
  readonly birthYear: number | null;
  readonly experienceLevel: string | null;
  readonly metadata: AthleteMetadata;
}
`,
);

write(
  "models/TrainingState.ts",
  `/**
 * Immutable training state slice (aggregation only, no load calculations).
 */
export interface TrainingState {
  readonly phase: string | null;
  readonly focus: string | null;
  readonly sessionsPerWeek: number | null;
  readonly lastSessionId: string | null;
  readonly lastSessionAt: string | null;
  readonly programId: string | null;
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
`,
);

write(
  "models/RecoveryState.ts",
  `/**
 * Immutable recovery state slice.
 */
export interface RecoveryState {
  readonly status: string | null;
  readonly lastRecoverySessionId: string | null;
  readonly lastAssessedAt: string | null;
  readonly modalities: readonly string[];
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
`,
);

write(
  "models/NutritionState.ts",
  `/**
 * Immutable nutrition state slice.
 */
export interface NutritionState {
  readonly planId: string | null;
  readonly dietaryPattern: string | null;
  readonly lastLoggedAt: string | null;
  readonly targetsPresent: boolean;
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
`,
);

write(
  "models/PerformanceState.ts",
  `/**
 * Immutable performance state slice.
 */
export interface PerformanceState {
  readonly lastSnapshotId: string | null;
  readonly trendLabel: string | null;
  readonly highlights: readonly string[];
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
`,
);

write(
  "models/LifestyleState.ts",
  `/**
 * Immutable lifestyle state slice.
 */
export interface LifestyleState {
  readonly activityLevel: string | null;
  readonly occupationLoad: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/HealthIndicators.ts",
  `/**
 * Immutable health indicator facts (representation only).
 */
export interface HealthIndicators {
  readonly flags: readonly string[];
  readonly clearanceStatus: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/ReadinessState.ts",
  `/**
 * Immutable readiness representation (no scoring).
 */
export interface ReadinessState {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/FatigueState.ts",
  `/**
 * Immutable fatigue representation (no scoring).
 */
export interface FatigueState {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/SleepState.ts",
  `/**
 * Immutable sleep representation.
 */
export interface SleepState {
  readonly lastNightHours: number | null;
  readonly qualityLabel: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/StressState.ts",
  `/**
 * Immutable stress representation.
 */
export interface StressState {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/HydrationState.ts",
  `/**
 * Immutable hydration representation.
 */
export interface HydrationState {
  readonly status: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/EnergyAvailability.ts",
  `/**
 * Immutable energy availability representation (no calculations).
 */
export interface EnergyAvailability {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/AthleteGoals.ts",
  `/**
 * Immutable goals slice.
 */
export interface AthleteGoalItem {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly status: string;
  readonly targetDate: string | null;
  readonly notes: readonly string[];
}

export interface AthleteGoals {
  readonly primaryGoalId: string | null;
  readonly items: readonly AthleteGoalItem[];
  readonly sourceAgentIds: readonly string[];
}
`,
);

write(
  "models/AthletePreferences.ts",
  `/**
 * Immutable preferences slice.
 */
export interface AthletePreferences {
  readonly preferredTrainingTimes: readonly string[];
  readonly preferredModalities: readonly string[];
  readonly dietaryPreferences: readonly string[];
  readonly communicationTone: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/AthleteConstraints.ts",
  `/**
 * Immutable constraints slice.
 */
export interface AthleteConstraints {
  readonly injuries: readonly string[];
  readonly equipmentLimits: readonly string[];
  readonly scheduleLimits: readonly string[];
  readonly medicalFlags: readonly string[];
  readonly notes: readonly string[];
}
`,
);

write(
  "models/ProgressState.ts",
  `/**
 * Immutable progress representation (no calculations).
 */
export interface ProgressState {
  readonly milestones: readonly string[];
  readonly recentWins: readonly string[];
  readonly blockers: readonly string[];
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
`,
);

write(
  "models/CoachingState.ts",
  `/**
 * Immutable coaching context slice for supervisor consumption.
 */
export interface CoachingState {
  readonly activeSessionId: string | null;
  readonly lastSessionId: string | null;
  readonly lastIntent: string | null;
  readonly focusAreas: readonly string[];
  readonly notes: readonly string[];
  readonly sourceSessionIds: readonly string[];
}
`,
);

write(
  "models/DecisionHistory.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";

/**
 * Immutable decision history (representation only).
 */
export interface DecisionHistoryEntry {
  readonly id: string;
  readonly kind: string;
  readonly summary: string;
  readonly source: string;
  readonly decidedAt: string;
  readonly metadata: AthleteMetadata;
}

export interface DecisionHistory {
  readonly athleteId: string;
  readonly entries: readonly DecisionHistoryEntry[];
}
`,
);

write(
  "models/StateChange.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";
import type { StateVersion } from "./StateVersion";

export const StateChangeKinds = {
  BUILD: "build",
  UPDATE: "update",
  SNAPSHOT: "snapshot",
  AGGREGATE: "aggregate",
  TRANSITION: "transition",
} as const;

export type StateChangeKind =
  (typeof StateChangeKinds)[keyof typeof StateChangeKinds];

/**
 * Immutable record of a state change.
 */
export interface StateChange {
  readonly id: string;
  readonly kind: StateChangeKind;
  readonly athleteId: string;
  readonly fromVersion: StateVersion | null;
  readonly toVersion: StateVersion;
  readonly paths: readonly string[];
  readonly summary: string;
  readonly source: string;
  readonly metadata: AthleteMetadata;
  readonly changedAt: string;
}
`,
);

write(
  "models/AthleteTimeline.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";
import type { StateChange } from "./StateChange";

export interface AthleteTimelineItem {
  readonly id: string;
  readonly sequence: number;
  readonly change: StateChange;
  readonly occurredAt: string;
}

/**
 * Immutable athlete state timeline.
 */
export interface AthleteTimeline {
  readonly athleteId: string;
  readonly items: readonly AthleteTimelineItem[];
  readonly metadata: AthleteMetadata;
}
`,
);

write(
  "models/AthleteHistory.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";
import type { StateChange } from "./StateChange";

export interface AthleteHistoryEntry {
  readonly id: string;
  readonly change: StateChange;
  readonly recordedAt: string;
}

/**
 * Immutable athlete state history.
 */
export interface AthleteHistory {
  readonly athleteId: string;
  readonly entries: readonly AthleteHistoryEntry[];
  readonly metadata: AthleteMetadata;
}
`,
);

write(
  "models/AthleteStatistics.ts",
  `/**
 * Immutable counts derived by aggregation structure only (no domain math).
 */
export interface AthleteStatistics {
  readonly updateCount: number;
  readonly snapshotCount: number;
  readonly historyEntryCount: number;
  readonly timelineItemCount: number;
  readonly goalCount: number;
  readonly sourceAgentCount: number;
}
`,
);

write(
  "models/StateSummary.ts",
  `import type { AthleteStatistics } from "./AthleteStatistics";
import type { AthleteStatusKind } from "./AthleteStatus";
import type { StateVersion } from "./StateVersion";

/**
 * Immutable human-readable state summary.
 */
export interface StateSummary {
  readonly athleteId: string;
  readonly version: StateVersion;
  readonly status: AthleteStatusKind;
  readonly headline: string;
  readonly details: readonly string[];
  readonly statistics: AthleteStatistics;
  readonly createdAt: string;
}
`,
);

write(
  "models/StateDiagnostics.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";

/**
 * Immutable diagnostics for athlete state operations.
 */
export interface StateDiagnostics {
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: AthleteMetadata;
}
`,
);

write(
  "models/StateValidation.ts",
  `export const StateValidationCodes = {
  INVALID_IDENTITY: "invalid_identity",
  INVALID_VERSION: "invalid_version",
  INVALID_TIMELINE: "invalid_timeline",
  INVALID_SNAPSHOT: "invalid_snapshot",
  INVALID_MEASUREMENTS: "invalid_measurements",
  INVALID_GOALS: "invalid_goals",
  INVALID_PREFERENCES: "invalid_preferences",
  INVALID_HISTORY: "invalid_history",
  INVALID_TRANSITION: "invalid_transition",
  INTEGRITY_VIOLATION: "integrity_violation",
  CONSISTENCY_VIOLATION: "consistency_violation",
  SAFETY_VIOLATION: "safety_violation",
  MISSING_STATE: "missing_state",
} as const;

export type StateValidationCode =
  (typeof StateValidationCodes)[keyof typeof StateValidationCodes];

export interface StateValidationIssue {
  readonly code: StateValidationCode | string;
  readonly message: string;
  readonly path: string | null;
}

export interface StateValidation {
  readonly valid: boolean;
  readonly issues: readonly StateValidationIssue[];
}

export const EMPTY_STATE_VALIDATION: StateValidation = Object.freeze({
  valid: true,
  issues: Object.freeze([] as StateValidationIssue[]),
});
`,
);

write(
  "models/AthleteSnapshot.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteState } from "./AthleteState";
import type { AthleteTimeline } from "./AthleteTimeline";
import type { StateSummary } from "./StateSummary";
import type { StateVersion } from "./StateVersion";

/**
 * Immutable point-in-time snapshot of athlete state.
 */
export interface AthleteSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly version: StateVersion;
  readonly state: AthleteState;
  readonly summary: StateSummary | null;
  readonly timeline: AthleteTimeline | null;
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
`,
);

write(
  "models/StateError.ts",
  `export interface StateError {
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
}

export function createStateError(input: {
  readonly code: string;
  readonly message: string;
  readonly path?: string | null;
}): StateError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    path: input.path ?? null,
  });
}
`,
);

write(
  "models/AthleteStateRequest.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";
import type { SpecialistContribution } from "./SpecialistContribution";

export const AthleteStateRequestKinds = {
  BUILD: "build",
  UPDATE: "update",
  SNAPSHOT: "snapshot",
  DESCRIBE: "describe",
  VALIDATE: "validate",
} as const;

export type AthleteStateRequestKind =
  (typeof AthleteStateRequestKinds)[keyof typeof AthleteStateRequestKinds];

/**
 * Immutable request for athlete-state operations.
 */
export interface AthleteStateRequest {
  readonly id: string;
  readonly kind: AthleteStateRequestKind;
  readonly athleteId: string;
  readonly stateId: string | null;
  readonly contributions: readonly SpecialistContribution[];
  readonly sessionId: string | null;
  readonly reason: string | null;
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/SpecialistContribution.ts",
  `import type { AthleteConstraints } from "./AthleteConstraints";
import type { AthleteGoals } from "./AthleteGoals";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthletePreferences } from "./AthletePreferences";
import type { CoachingState } from "./CoachingState";
import type { FatigueState } from "./FatigueState";
import type { NutritionState } from "./NutritionState";
import type { PerformanceState } from "./PerformanceState";
import type { ProgressState } from "./ProgressState";
import type { ReadinessState } from "./ReadinessState";
import type { RecoveryState } from "./RecoveryState";
import type { SleepState } from "./SleepState";
import type { StressState } from "./StressState";
import type { TrainingState } from "./TrainingState";

export const SpecialistSources = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  SESSION: "session",
} as const;

export type SpecialistSource =
  (typeof SpecialistSources)[keyof typeof SpecialistSources];

/**
 * Lightweight immutable contribution from a specialist agent / session.
 * Aggregation copies declared slices only — no AI, no calculations.
 */
export interface SpecialistContribution {
  readonly id: string;
  readonly source: SpecialistSource;
  readonly agentId: string;
  readonly athleteId: string;
  readonly training: TrainingState | null;
  readonly recovery: RecoveryState | null;
  readonly nutrition: NutritionState | null;
  readonly performance: PerformanceState | null;
  readonly readiness: ReadinessState | null;
  readonly fatigue: FatigueState | null;
  readonly sleep: SleepState | null;
  readonly stress: StressState | null;
  readonly goals: AthleteGoals | null;
  readonly preferences: AthletePreferences | null;
  readonly constraints: AthleteConstraints | null;
  readonly progress: ProgressState | null;
  readonly coaching: CoachingState | null;
  readonly notes: readonly string[];
  readonly metadata: AthleteMetadata;
  readonly contributedAt: string;
}
`,
);

write(
  "models/CoachSupervisorContext.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteState } from "./AthleteState";
import type { AthleteSnapshot } from "./AthleteSnapshot";
import type { StateSummary } from "./StateSummary";

/**
 * Immutable context produced for Coach Supervisor consumption.
 */
export interface CoachSupervisorContext {
  readonly athleteId: string;
  readonly state: AthleteState;
  readonly snapshot: AthleteSnapshot | null;
  readonly summary: StateSummary | null;
  readonly focusAreas: readonly string[];
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AthleteStateResult.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteSnapshot } from "./AthleteSnapshot";
import type { AthleteState } from "./AthleteState";
import type { CoachSupervisorContext } from "./CoachSupervisorContext";
import type { StateDiagnostics } from "./StateDiagnostics";
import type { StateError } from "./StateError";
import type { StateSummary } from "./StateSummary";
import type { StateValidation } from "./StateValidation";
import type { AthleteStateDescriptor } from "./AthleteStateDescriptor";

export const AthleteStateOperationKinds = {
  BUILD: "build",
  UPDATE: "update",
  SNAPSHOT: "snapshot",
  DESCRIBE: "describe",
  VALIDATE: "validate",
} as const;

export type AthleteStateOperationKind =
  (typeof AthleteStateOperationKinds)[keyof typeof AthleteStateOperationKinds];

/**
 * Immutable primary output of Athlete State Engine operations.
 */
export interface AthleteStateResult {
  readonly id: string;
  readonly operation: AthleteStateOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly athleteId: string | null;
  readonly state: AthleteState | null;
  readonly snapshot: AthleteSnapshot | null;
  readonly summary: StateSummary | null;
  readonly supervisorContext: CoachSupervisorContext | null;
  readonly descriptor: AthleteStateDescriptor | null;
  readonly validation: StateValidation;
  readonly diagnostics: StateDiagnostics;
  readonly error: StateError | null;
  readonly metadata: AthleteMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
`,
);

write(
  "models/AthleteStateDescriptor.ts",
  `import type { AthleteMetadata } from "./AthleteMetadata";

export const AthleteStateCapabilityKinds = {
  BUILD: "build_athlete_state",
  UPDATE: "update_athlete_state",
  SNAPSHOT: "create_snapshot",
  DESCRIBE: "describe_athlete_state",
  VALIDATE: "validate_athlete_state",
} as const;

export type AthleteStateCapabilityKind =
  (typeof AthleteStateCapabilityKinds)[keyof typeof AthleteStateCapabilityKinds];

/**
 * Immutable descriptor of the Athlete State Engine.
 */
export interface AthleteStateDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly AthleteStateCapabilityKind[];
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/AthleteState.ts",
  `import type { AthleteConstraints } from "./AthleteConstraints";
import type { AthleteGoals } from "./AthleteGoals";
import type { AthleteHistory } from "./AthleteHistory";
import type { AthleteIdentity } from "./AthleteIdentity";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteMetrics } from "./AthleteMetrics";
import type { AthletePreferences } from "./AthletePreferences";
import type { AthleteProfile } from "./AthleteProfile";
import type { AthleteStatistics } from "./AthleteStatistics";
import type { AthleteStatus } from "./AthleteStatus";
import type { AthleteTimeline } from "./AthleteTimeline";
import type { BodyComposition } from "./BodyComposition";
import type { BodyMeasurements } from "./BodyMeasurements";
import type { CoachingState } from "./CoachingState";
import type { DecisionHistory } from "./DecisionHistory";
import type { EnergyAvailability } from "./EnergyAvailability";
import type { FatigueState } from "./FatigueState";
import type { HealthIndicators } from "./HealthIndicators";
import type { HydrationState } from "./HydrationState";
import type { LifestyleState } from "./LifestyleState";
import type { NutritionState } from "./NutritionState";
import type { PerformanceState } from "./PerformanceState";
import type { ProgressState } from "./ProgressState";
import type { ReadinessState } from "./ReadinessState";
import type { RecoveryState } from "./RecoveryState";
import type { SleepState } from "./SleepState";
import type { StateDiagnostics } from "./StateDiagnostics";
import type { StateSummary } from "./StateSummary";
import type { StateVersion } from "./StateVersion";
import type { StressState } from "./StressState";
import type { TrainingState } from "./TrainingState";

/**
 * Immutable single source of truth for current athlete state.
 *
 * Aggregates physical / physiological / nutritional / recovery / coaching
 * representation. Performs no business calculations, AI reasoning, or persistence.
 */
export interface AthleteState {
  readonly id: string;
  readonly athleteId: string;
  readonly version: StateVersion;
  readonly identity: AthleteIdentity;
  readonly profile: AthleteProfile;
  readonly metrics: AthleteMetrics;
  readonly status: AthleteStatus;
  readonly bodyComposition: BodyComposition;
  readonly bodyMeasurements: BodyMeasurements;
  readonly training: TrainingState;
  readonly recovery: RecoveryState;
  readonly nutrition: NutritionState;
  readonly performance: PerformanceState;
  readonly lifestyle: LifestyleState;
  readonly health: HealthIndicators;
  readonly readiness: ReadinessState;
  readonly fatigue: FatigueState;
  readonly sleep: SleepState;
  readonly stress: StressState;
  readonly hydration: HydrationState;
  readonly energyAvailability: EnergyAvailability;
  readonly goals: AthleteGoals;
  readonly preferences: AthletePreferences;
  readonly constraints: AthleteConstraints;
  readonly progress: ProgressState;
  readonly coaching: CoachingState;
  readonly history: AthleteHistory;
  readonly timeline: AthleteTimeline;
  readonly statistics: AthleteStatistics;
  readonly decisionHistory: DecisionHistory;
  readonly diagnostics: StateDiagnostics;
  readonly summary: StateSummary | null;
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly frozenAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./AthleteMetadata";
export * from "./StateVersion";
export * from "./AthleteIdentity";
export * from "./AthleteStatus";
export * from "./BodyComposition";
export * from "./BodyMeasurements";
export * from "./AthleteMetrics";
export * from "./AthleteProfile";
export * from "./TrainingState";
export * from "./RecoveryState";
export * from "./NutritionState";
export * from "./PerformanceState";
export * from "./LifestyleState";
export * from "./HealthIndicators";
export * from "./ReadinessState";
export * from "./FatigueState";
export * from "./SleepState";
export * from "./StressState";
export * from "./HydrationState";
export * from "./EnergyAvailability";
export * from "./AthleteGoals";
export * from "./AthletePreferences";
export * from "./AthleteConstraints";
export * from "./ProgressState";
export * from "./CoachingState";
export * from "./DecisionHistory";
export * from "./StateChange";
export * from "./AthleteTimeline";
export * from "./AthleteHistory";
export * from "./AthleteStatistics";
export * from "./StateSummary";
export * from "./StateDiagnostics";
export * from "./StateValidation";
export * from "./AthleteSnapshot";
export * from "./StateError";
export * from "./SpecialistContribution";
export * from "./AthleteStateRequest";
export * from "./CoachSupervisorContext";
export * from "./AthleteStateDescriptor";
export * from "./AthleteStateResult";
export * from "./AthleteState";
`,
);

console.log("Part 1 (models) written — run part2 next");
