/**
 * Sprint 24.1 — Workout Adaptation Engine generator (part 1: models + utils + contracts).
 * Run: node scripts/generate-workout-adaptation-part1.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/workout-adaptation");
let fileCount = 0;

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

// ─── MODELS ───────────────────────────────────────────────────────────────────

write(
  "models/WorkoutMetadata.ts",
  `export interface WorkoutMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_WORKOUT_METADATA: WorkoutMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/BlueprintRef.ts",
  `export interface BlueprintRef {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly keys: readonly string[];
}
`,
);

write(
  "models/RuntimeRef.ts",
  `export interface RuntimeRef {
  readonly id: string;
  readonly athleteId: string;
  readonly runtimeId: string;
  readonly keys: readonly string[];
}
`,
);

write(
  "models/AthleteStateRef.ts",
  `export interface AthleteStateRef {
  readonly id: string;
  readonly athleteId: string;
  readonly stateKeys: readonly string[];
}
`,
);

write(
  "models/CoachContextRef.ts",
  `export interface CoachContextRef {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly keys: readonly string[];
}
`,
);

write(
  "models/WorkoutAdaptationDecisionRef.ts",
  `/** Structural reference to Continuous Adaptation decision ids/keys. */
export interface WorkoutAdaptationDecisionRef {
  readonly id: string;
  readonly athleteId: string;
  readonly decisionIds: readonly string[];
  readonly decisionKeys: readonly string[];
}
`,
);

write(
  "models/WorkoutAdaptationContext.ts",
  `import type { AthleteStateRef } from "./AthleteStateRef";
import type { BlueprintRef } from "./BlueprintRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { RuntimeRef } from "./RuntimeRef";
import type { WorkoutAdaptationDecisionRef } from "./WorkoutAdaptationDecisionRef";
import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutAdaptationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly blueprintRef: BlueprintRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly decisionRef: WorkoutAdaptationDecisionRef | null;
  readonly signalKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutSnapshot.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly blueprintKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutAdaptationInput.ts",
  `import type { AthleteStateRef } from "./AthleteStateRef";
import type { BlueprintRef } from "./BlueprintRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { RuntimeRef } from "./RuntimeRef";
import type { WorkoutAdaptationDecisionRef } from "./WorkoutAdaptationDecisionRef";
import type { WorkoutMetadata } from "./WorkoutMetadata";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";

export const WorkoutAdaptationInputKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type WorkoutAdaptationInputKind =
  (typeof WorkoutAdaptationInputKinds)[keyof typeof WorkoutAdaptationInputKinds];

export interface WorkoutAdaptationInput {
  readonly id: string;
  readonly kind: WorkoutAdaptationInputKind;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly sessionId: string | null;
  readonly contextId: string;
  readonly blueprintKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly signalFlags: Readonly<Record<string, boolean>>;
  readonly priorSnapshot: WorkoutSnapshot | null;
  readonly decisionRef: WorkoutAdaptationDecisionRef | null;
  readonly blueprintRef: BlueprintRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly reason: string;
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutModification.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export const WorkoutModificationKinds = {
  ADJUSTMENT: "adjustment",
  REPLACEMENT: "replacement",
  INSERTION: "insertion",
  REMOVAL: "removal",
} as const;

export type WorkoutModificationKind =
  (typeof WorkoutModificationKinds)[keyof typeof WorkoutModificationKinds];

export interface WorkoutModification {
  readonly id: string;
  readonly kind: WorkoutModificationKind;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutAdjustment.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutAdjustment {
  readonly id: string;
  readonly targetKey: string;
  readonly adjustmentKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutReplacement.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutReplacement {
  readonly id: string;
  readonly fromKey: string;
  readonly toKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

const adjustmentModels = [
  ["ExerciseAdjustment", "exerciseKey"],
  ["SetAdjustment", "setKey"],
  ["RepAdjustment", "repKey"],
  ["LoadAdjustment", "loadKey"],
  ["IntensityAdjustment", "intensityKey"],
  ["VolumeAdjustment", "volumeKey"],
  ["RestAdjustment", "restKey"],
  ["TempoAdjustment", "tempoKey"],
  ["FrequencyAdjustment", "frequencyKey"],
  ["WeeklyAdjustment", "weekKey"],
  ["ProgressionAdjustment", "progressionKey"],
  ["RegressionAdjustment", "regressionKey"],
  ["PlateauAdjustment", "plateauKey"],
  ["FatigueAdjustment", "fatigueKey"],
  ["RecoveryAdjustment", "recoveryKey"],
  ["SessionAdjustment", "sessionKey"],
];

for (const [name, keyField] of adjustmentModels) {
  write(
    `models/${name}.ts`,
    `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ${name} {
  readonly id: string;
  readonly ${keyField}: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
  );
}

write(
  "models/ExerciseReplacement.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ExerciseReplacement {
  readonly id: string;
  readonly fromExerciseKey: string;
  readonly toExerciseKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExerciseRemoval.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ExerciseRemoval {
  readonly id: string;
  readonly exerciseKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ExerciseInsertion.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ExerciseInsertion {
  readonly id: string;
  readonly exerciseKey: string;
  readonly afterKey: string | null;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/UpdatedWorkoutBlueprint.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

/** Structure keys only — NOT full workout generation. */
export interface UpdatedWorkoutBlueprint {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly dayKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutRuntimeInput.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

/** Handoff to Workout Runtime — structural keys only. */
export interface WorkoutRuntimeInput {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly updatedBlueprintId: string;
  readonly sessionKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutAdaptation.ts",
  `import type { ExerciseAdjustment } from "./ExerciseAdjustment";
import type { ExerciseInsertion } from "./ExerciseInsertion";
import type { ExerciseRemoval } from "./ExerciseRemoval";
import type { ExerciseReplacement } from "./ExerciseReplacement";
import type { FatigueAdjustment } from "./FatigueAdjustment";
import type { FrequencyAdjustment } from "./FrequencyAdjustment";
import type { IntensityAdjustment } from "./IntensityAdjustment";
import type { LoadAdjustment } from "./LoadAdjustment";
import type { PlateauAdjustment } from "./PlateauAdjustment";
import type { ProgressionAdjustment } from "./ProgressionAdjustment";
import type { RecoveryAdjustment } from "./RecoveryAdjustment";
import type { RegressionAdjustment } from "./RegressionAdjustment";
import type { RepAdjustment } from "./RepAdjustment";
import type { RestAdjustment } from "./RestAdjustment";
import type { SessionAdjustment } from "./SessionAdjustment";
import type { SetAdjustment } from "./SetAdjustment";
import type { TempoAdjustment } from "./TempoAdjustment";
import type { VolumeAdjustment } from "./VolumeAdjustment";
import type { WeeklyAdjustment } from "./WeeklyAdjustment";
import type { WorkoutAdjustment } from "./WorkoutAdjustment";
import type { WorkoutMetadata } from "./WorkoutMetadata";
import type { WorkoutModification } from "./WorkoutModification";
import type { WorkoutReplacement } from "./WorkoutReplacement";

export interface WorkoutAdaptation {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly modifications: readonly WorkoutModification[];
  readonly adjustments: readonly WorkoutAdjustment[];
  readonly replacements: readonly WorkoutReplacement[];
  readonly exerciseAdjustments: readonly ExerciseAdjustment[];
  readonly exerciseReplacements: readonly ExerciseReplacement[];
  readonly exerciseRemovals: readonly ExerciseRemoval[];
  readonly exerciseInsertions: readonly ExerciseInsertion[];
  readonly setAdjustments: readonly SetAdjustment[];
  readonly repAdjustments: readonly RepAdjustment[];
  readonly loadAdjustments: readonly LoadAdjustment[];
  readonly intensityAdjustments: readonly IntensityAdjustment[];
  readonly volumeAdjustments: readonly VolumeAdjustment[];
  readonly restAdjustments: readonly RestAdjustment[];
  readonly tempoAdjustments: readonly TempoAdjustment[];
  readonly frequencyAdjustments: readonly FrequencyAdjustment[];
  readonly weeklyAdjustments: readonly WeeklyAdjustment[];
  readonly progressionAdjustments: readonly ProgressionAdjustment[];
  readonly regressionAdjustments: readonly RegressionAdjustment[];
  readonly plateauAdjustments: readonly PlateauAdjustment[];
  readonly fatigueAdjustments: readonly FatigueAdjustment[];
  readonly recoveryAdjustments: readonly RecoveryAdjustment[];
  readonly sessionAdjustments: readonly SessionAdjustment[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutComparison.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutComparison {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly addedKeys: readonly string[];
  readonly removedKeys: readonly string[];
  readonly sharedKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutHistory.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutHistoryEntry {
  readonly id: string;
  readonly adaptationId: string;
  readonly blueprintId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface WorkoutHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly WorkoutHistoryEntry[];
  readonly historyKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutTimeline.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutTimelineItem {
  readonly id: string;
  readonly adaptationId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface WorkoutTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly WorkoutTimelineItem[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutSummary.ts",
  `import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly decisionKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutDiagnostics.ts",
  `export interface WorkoutDiagnostics {
  readonly notes: readonly string[];
  readonly warnings: readonly string[];
  readonly processingSteps: readonly string[];
}
`,
);

write(
  "models/WorkoutStatistics.ts",
  `export interface WorkoutStatistics {
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly replacementCount: number;
  readonly decisionKeyCount: number;
  readonly exerciseKeyCount: number;
  readonly sessionKeyCount: number;
}
`,
);

write(
  "models/WorkoutPackage.ts",
  `import type { UpdatedWorkoutBlueprint } from "./UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutComparison } from "./WorkoutComparison";
import type { WorkoutDiagnostics } from "./WorkoutDiagnostics";
import type { WorkoutHistory } from "./WorkoutHistory";
import type { WorkoutMetadata } from "./WorkoutMetadata";
import type { WorkoutRuntimeInput } from "./WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";
import type { WorkoutStatistics } from "./WorkoutStatistics";
import type { WorkoutSummary } from "./WorkoutSummary";
import type { WorkoutTimeline } from "./WorkoutTimeline";

export interface WorkoutPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput: WorkoutRuntimeInput | null;
  readonly summary: WorkoutSummary | null;
  readonly snapshot: WorkoutSnapshot | null;
  readonly comparison: WorkoutComparison | null;
  readonly timeline: WorkoutTimeline | null;
  readonly history: WorkoutHistory | null;
  readonly statistics: WorkoutStatistics;
  readonly diagnostics: WorkoutDiagnostics;
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutResult.ts",
  `import type { UpdatedWorkoutBlueprint } from "./UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutComparison } from "./WorkoutComparison";
import type { WorkoutDescriptor } from "./WorkoutDescriptor";
import type { WorkoutError } from "./WorkoutError";
import type { WorkoutPackage } from "./WorkoutPackage";
import type { WorkoutRuntimeInput } from "./WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";
import type { WorkoutSummary } from "./WorkoutSummary";
import type { WorkoutValidation } from "./WorkoutValidation";

export const WorkoutOperationKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type WorkoutOperationKind =
  (typeof WorkoutOperationKinds)[keyof typeof WorkoutOperationKinds];

export interface WorkoutResult {
  readonly id: string;
  readonly operation: WorkoutOperationKind;
  readonly success: boolean;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput: WorkoutRuntimeInput | null;
  readonly package: WorkoutPackage | null;
  readonly summary: WorkoutSummary | null;
  readonly snapshot: WorkoutSnapshot | null;
  readonly comparison: WorkoutComparison | null;
  readonly validation: WorkoutValidation | null;
  readonly descriptor: WorkoutDescriptor | null;
  readonly errors: readonly WorkoutError[];
  readonly createdAt: string;
}
`,
);

write(
  "models/WorkoutDescriptor.ts",
  `export interface WorkoutDescriptor {
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
  "models/WorkoutValidation.ts",
  `import type { WorkoutError } from "./WorkoutError";

export interface WorkoutValidation {
  readonly valid: boolean;
  readonly issues: readonly WorkoutError[];
}
`,
);

write(
  "models/WorkoutError.ts",
  `export const WorkoutErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  MISSING_BLUEPRINT: "missing_blueprint",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  EMPTY_BLUEPRINT: "empty_blueprint",
  INCONSISTENT_EXERCISE: "inconsistent_exercise",
  INCONSISTENT_WEEK: "inconsistent_week",
} as const;

export type WorkoutErrorCode =
  (typeof WorkoutErrorCodes)[keyof typeof WorkoutErrorCodes];

export interface WorkoutError {
  readonly code: WorkoutErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createWorkoutError(
  code: WorkoutErrorCode,
  message: string,
  subjectId: string | null = null,
): WorkoutError {
  return Object.freeze({ code, message, subjectId });
}
`,
);

write(
  "models/WorkoutAdaptationState.ts",
  `import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutPackage } from "./WorkoutPackage";

export const WorkoutSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type WorkoutSessionStatus =
  (typeof WorkoutSessionStatuses)[keyof typeof WorkoutSessionStatuses];

export interface WorkoutAdaptationState {
  readonly status: WorkoutSessionStatus;
  readonly package: WorkoutPackage | null;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedAt: string;
}
`,
);

write(
  "models/WorkoutAdaptationOutput.ts",
  `import type { UpdatedWorkoutBlueprint } from "./UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutPackage } from "./WorkoutPackage";
import type { WorkoutRuntimeInput } from "./WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";
import type { WorkoutSummary } from "./WorkoutSummary";

export interface WorkoutAdaptationOutput {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput: WorkoutRuntimeInput | null;
  readonly package: WorkoutPackage | null;
  readonly summary: WorkoutSummary | null;
  readonly snapshot: WorkoutSnapshot | null;
  readonly createdAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./AthleteStateRef";
export * from "./BlueprintRef";
export * from "./CoachContextRef";
export * from "./ExerciseAdjustment";
export * from "./ExerciseInsertion";
export * from "./ExerciseRemoval";
export * from "./ExerciseReplacement";
export * from "./FatigueAdjustment";
export * from "./FrequencyAdjustment";
export * from "./IntensityAdjustment";
export * from "./LoadAdjustment";
export * from "./PlateauAdjustment";
export * from "./ProgressionAdjustment";
export * from "./RecoveryAdjustment";
export * from "./RegressionAdjustment";
export * from "./RepAdjustment";
export * from "./RestAdjustment";
export * from "./RuntimeRef";
export * from "./SessionAdjustment";
export * from "./SetAdjustment";
export * from "./TempoAdjustment";
export * from "./UpdatedWorkoutBlueprint";
export * from "./VolumeAdjustment";
export * from "./WeeklyAdjustment";
export * from "./WorkoutAdaptation";
export * from "./WorkoutAdaptationContext";
export * from "./WorkoutAdaptationDecisionRef";
export * from "./WorkoutAdaptationInput";
export * from "./WorkoutAdaptationOutput";
export * from "./WorkoutAdaptationState";
export * from "./WorkoutAdjustment";
export * from "./WorkoutComparison";
export * from "./WorkoutDescriptor";
export * from "./WorkoutDiagnostics";
export * from "./WorkoutError";
export * from "./WorkoutHistory";
export * from "./WorkoutMetadata";
export * from "./WorkoutModification";
export * from "./WorkoutPackage";
export * from "./WorkoutReplacement";
export * from "./WorkoutResult";
export * from "./WorkoutRuntimeInput";
export * from "./WorkoutSnapshot";
export * from "./WorkoutStatistics";
export * from "./WorkoutSummary";
export * from "./WorkoutTimeline";
export * from "./WorkoutValidation";
`,
);

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

write(
  "contracts/WorkoutBlueprintPort.ts",
  `export interface WorkoutBlueprintPort {
  isBlueprintPresent(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): boolean;
  loadBlueprintKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadExerciseKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadSessionKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadWeekKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadDayKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockWorkoutBlueprintPort(present = true): WorkoutBlueprintPort {
  return {
    isBlueprintPresent: () => present,
    loadBlueprintKeys(input) {
      return Object.freeze([
        \`blueprint:\${input.blueprintId}\`,
        "blueprint:structure",
        "blueprint:session:a",
      ]);
    },
    loadExerciseKeys(input) {
      return Object.freeze([
        \`exercise:\${input.blueprintId}:squat\`,
        \`exercise:\${input.blueprintId}:bench\`,
      ]);
    },
    loadSessionKeys(input) {
      return Object.freeze([\`session:\${input.blueprintId}:a\`, \`session:\${input.blueprintId}:b\`]);
    },
    loadWeekKeys(input) {
      return Object.freeze([\`week:\${input.blueprintId}:1\`, \`week:\${input.blueprintId}:2\`]);
    },
    loadDayKeys(input) {
      return Object.freeze([\`day:\${input.blueprintId}:1\`, \`day:\${input.blueprintId}:2\`]);
    },
  };
}
`,
);

write(
  "contracts/WorkoutRuntimePort.ts",
  `export interface WorkoutRuntimePort {
  isRuntimePresent(input: {
    readonly athleteId: string;
    readonly runtimeId: string;
    readonly at: string;
  }): boolean;
  loadRuntimeKeys(input: {
    readonly athleteId: string;
    readonly runtimeId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockWorkoutRuntimePort(present = true): WorkoutRuntimePort {
  return {
    isRuntimePresent: () => present,
    loadRuntimeKeys(input) {
      return Object.freeze([
        \`runtime:\${input.runtimeId}\`,
        "runtime:session",
        "runtime:state",
      ]);
    },
  };
}
`,
);

write(
  "contracts/AthleteStatePort.ts",
  `export interface AthleteStatePort {
  isAthletePresent(input: { readonly athleteId: string; readonly at: string }): boolean;
  loadStateKeys(input: {
    readonly athleteId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockAthleteStatePort(present = true): AthleteStatePort {
  return {
    isAthletePresent: () => present,
    loadStateKeys(input) {
      return Object.freeze([
        \`state:athlete:\${input.athleteId}\`,
        "state:readiness",
        "state:fatigue",
        "state:recovery",
      ]);
    },
  };
}
`,
);

write(
  "contracts/ContinuousAdaptationPort.ts",
  `export interface ContinuousAdaptationPort {
  loadDecisionKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
  loadDecisionIds(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockContinuousAdaptationPort(): ContinuousAdaptationPort {
  return {
    loadDecisionKeys(input) {
      return Object.freeze([
        \`decision:key:\${input.athleteId}:volume\`,
        \`decision:key:\${input.athleteId}:intensity\`,
        "decision:key:progression",
      ]);
    },
    loadDecisionIds(input) {
      return Object.freeze([
        \`adaptation:\${input.athleteId}:1\`,
        \`adaptation:\${input.athleteId}:2\`,
      ]);
    },
  };
}
`,
);

write(
  "contracts/CoachContextPort.ts",
  `export interface CoachContextPort {
  loadContextKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
  loadFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockCoachContextPort(): CoachContextPort {
  return {
    loadContextKeys(input) {
      return Object.freeze([
        \`context:\${input.contextId}\`,
        "context:focus:strength",
      ]);
    },
    loadFocusAreas() {
      return Object.freeze(["strength", "recovery"]);
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./AthleteStatePort";
export * from "./CoachContextPort";
export * from "./ContinuousAdaptationPort";
export * from "./WorkoutBlueprintPort";
export * from "./WorkoutRuntimePort";
`,
);

// ─── UTILS ────────────────────────────────────────────────────────────────────

write(
  "utils/WorkoutAdaptationHelpers.ts",
  `import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";

export function uniqueSorted(keys: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(keys)].sort());
}

export function collectKeys(...groups: readonly (readonly string[])[]): readonly string[] {
  const keys = new Set<string>();
  for (const group of groups) {
    for (const k of group) keys.add(k);
  }
  return Object.freeze([...keys].sort());
}

export function collectPresentSignalKeys(input: WorkoutAdaptationInput): readonly string[] {
  const keys = new Set<string>();
  for (const k of input.signalKeys) keys.add(k);
  for (const k of input.decisionKeys) keys.add(k);
  for (const [flag, present] of Object.entries(input.signalFlags)) {
    if (present) keys.add(flag);
  }
  return Object.freeze([...keys].sort());
}

export function keysPresent(keys: readonly string[], prefix?: string): readonly string[] {
  if (!prefix) return uniqueSorted(keys);
  return uniqueSorted(keys.filter((k) => k.startsWith(prefix)));
}
`,
);

write(
  "utils/StatisticsHelpers.ts",
  `import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutStatistics } from "../models/WorkoutStatistics";

export function buildStatistics(adaptation: WorkoutAdaptation | null): WorkoutStatistics {
  if (!adaptation) {
    return Object.freeze({
      modificationCount: 0,
      adjustmentCount: 0,
      replacementCount: 0,
      decisionKeyCount: 0,
      exerciseKeyCount: 0,
      sessionKeyCount: 0,
    });
  }
  return Object.freeze({
    modificationCount: adaptation.modifications.length,
    adjustmentCount:
      adaptation.adjustments.length +
      adaptation.exerciseAdjustments.length +
      adaptation.setAdjustments.length +
      adaptation.repAdjustments.length +
      adaptation.loadAdjustments.length +
      adaptation.volumeAdjustments.length +
      adaptation.restAdjustments.length +
      adaptation.tempoAdjustments.length +
      adaptation.frequencyAdjustments.length +
      adaptation.weeklyAdjustments.length +
      adaptation.sessionAdjustments.length,
    replacementCount:
      adaptation.replacements.length + adaptation.exerciseReplacements.length,
    decisionKeyCount: adaptation.decisionKeys.length,
    exerciseKeyCount: adaptation.exerciseAdjustments.length,
    sessionKeyCount: adaptation.sessionAdjustments.length,
  });
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `export function formatKeyList(keys: readonly string[]): string {
  return keys.join(",");
}

export function formatOperationLabel(operation: string): string {
  return operation.toUpperCase();
}
`,
);

write(
  "utils/ComparisonHelpers.ts",
  `export function sameKeySet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  for (let i = 0; i < sa.length; i += 1) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}
`,
);

write(
  "utils/FreezeWorkoutAdaptation.ts",
  `import type { AthleteStateRef } from "../models/AthleteStateRef";
import type { BlueprintRef } from "../models/BlueprintRef";
import type { CoachContextRef } from "../models/CoachContextRef";
import type { ExerciseAdjustment } from "../models/ExerciseAdjustment";
import type { ExerciseInsertion } from "../models/ExerciseInsertion";
import type { ExerciseRemoval } from "../models/ExerciseRemoval";
import type { ExerciseReplacement } from "../models/ExerciseReplacement";
import type { FatigueAdjustment } from "../models/FatigueAdjustment";
import type { FrequencyAdjustment } from "../models/FrequencyAdjustment";
import type { IntensityAdjustment } from "../models/IntensityAdjustment";
import type { LoadAdjustment } from "../models/LoadAdjustment";
import type { PlateauAdjustment } from "../models/PlateauAdjustment";
import type { ProgressionAdjustment } from "../models/ProgressionAdjustment";
import type { RecoveryAdjustment } from "../models/RecoveryAdjustment";
import type { RegressionAdjustment } from "../models/RegressionAdjustment";
import type { RepAdjustment } from "../models/RepAdjustment";
import type { RestAdjustment } from "../models/RestAdjustment";
import type { RuntimeRef } from "../models/RuntimeRef";
import type { SessionAdjustment } from "../models/SessionAdjustment";
import type { SetAdjustment } from "../models/SetAdjustment";
import type { TempoAdjustment } from "../models/TempoAdjustment";
import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { VolumeAdjustment } from "../models/VolumeAdjustment";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutAdaptationContext } from "../models/WorkoutAdaptationContext";
import type { WorkoutAdaptationDecisionRef } from "../models/WorkoutAdaptationDecisionRef";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import type { WorkoutAdaptationOutput } from "../models/WorkoutAdaptationOutput";
import type { WorkoutAdaptationState } from "../models/WorkoutAdaptationState";
import type { WorkoutAdjustment } from "../models/WorkoutAdjustment";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutDiagnostics } from "../models/WorkoutDiagnostics";
import type { WorkoutHistory, WorkoutHistoryEntry } from "../models/WorkoutHistory";
import type { WorkoutMetadata } from "../models/WorkoutMetadata";
import type { WorkoutModification } from "../models/WorkoutModification";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import type { WorkoutReplacement } from "../models/WorkoutReplacement";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutRuntimeInput } from "../models/WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import type { WorkoutStatistics } from "../models/WorkoutStatistics";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type { WorkoutTimeline, WorkoutTimelineItem } from "../models/WorkoutTimeline";
import type { WorkoutValidation } from "../models/WorkoutValidation";

export function freezeMetadata(m: WorkoutMetadata): WorkoutMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezeBlueprintRef(r: BlueprintRef): BlueprintRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeRuntimeRef(r: RuntimeRef): RuntimeRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeAthleteStateRef(r: AthleteStateRef): AthleteStateRef {
  return Object.freeze({ ...r, stateKeys: Object.freeze([...r.stateKeys]) });
}

export function freezeCoachContextRef(r: CoachContextRef): CoachContextRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeDecisionRef(r: WorkoutAdaptationDecisionRef): WorkoutAdaptationDecisionRef {
  return Object.freeze({
    ...r,
    decisionIds: Object.freeze([...r.decisionIds]),
    decisionKeys: Object.freeze([...r.decisionKeys]),
  });
}

export function freezeModification(m: WorkoutModification): WorkoutModification {
  return Object.freeze({
    ...m,
    sourceDecisionKeys: Object.freeze([...m.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...m.planStepKeys]),
    metadata: freezeMetadata(m.metadata),
  });
}

export function freezeAdjustment(a: WorkoutAdjustment): WorkoutAdjustment {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeReplacement(r: WorkoutReplacement): WorkoutReplacement {
  return Object.freeze({
    ...r,
    sourceDecisionKeys: Object.freeze([...r.sourceDecisionKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

function freezeKeyedAdjustment<T extends {
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
}>(a: T): T {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeExerciseAdjustment(a: ExerciseAdjustment): ExerciseAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeExerciseReplacement(a: ExerciseReplacement): ExerciseReplacement {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}
export function freezeExerciseRemoval(a: ExerciseRemoval): ExerciseRemoval {
  return freezeKeyedAdjustment(a);
}
export function freezeExerciseInsertion(a: ExerciseInsertion): ExerciseInsertion {
  return freezeKeyedAdjustment(a);
}
export function freezeSetAdjustment(a: SetAdjustment): SetAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRepAdjustment(a: RepAdjustment): RepAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeLoadAdjustment(a: LoadAdjustment): LoadAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeIntensityAdjustment(a: IntensityAdjustment): IntensityAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeVolumeAdjustment(a: VolumeAdjustment): VolumeAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRestAdjustment(a: RestAdjustment): RestAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeTempoAdjustment(a: TempoAdjustment): TempoAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFrequencyAdjustment(a: FrequencyAdjustment): FrequencyAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeWeeklyAdjustment(a: WeeklyAdjustment): WeeklyAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeProgressionAdjustment(a: ProgressionAdjustment): ProgressionAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRegressionAdjustment(a: RegressionAdjustment): RegressionAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezePlateauAdjustment(a: PlateauAdjustment): PlateauAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFatigueAdjustment(a: FatigueAdjustment): FatigueAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRecoveryAdjustment(a: RecoveryAdjustment): RecoveryAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeSessionAdjustment(a: SessionAdjustment): SessionAdjustment {
  return freezeKeyedAdjustment(a);
}

export function freezeSnapshot(s: WorkoutSnapshot): WorkoutSnapshot {
  return Object.freeze({
    ...s,
    blueprintKeys: Object.freeze([...s.blueprintKeys]),
    dayKeys: Object.freeze([...s.dayKeys]),
    exerciseKeys: Object.freeze([...s.exerciseKeys]),
    sessionKeys: Object.freeze([...s.sessionKeys]),
    weekKeys: Object.freeze([...s.weekKeys]),
    modificationIds: Object.freeze([...s.modificationIds]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeInput(i: WorkoutAdaptationInput): WorkoutAdaptationInput {
  return Object.freeze({
    ...i,
    blueprintKeys: Object.freeze([...i.blueprintKeys]),
    dayKeys: Object.freeze([...i.dayKeys]),
    exerciseKeys: Object.freeze([...i.exerciseKeys]),
    sessionKeys: Object.freeze([...i.sessionKeys]),
    weekKeys: Object.freeze([...i.weekKeys]),
    decisionKeys: Object.freeze([...i.decisionKeys]),
    signalKeys: Object.freeze([...i.signalKeys]),
    signalFlags: Object.freeze({ ...i.signalFlags }),
    priorSnapshot: i.priorSnapshot ? freezeSnapshot(i.priorSnapshot) : null,
    decisionRef: i.decisionRef ? freezeDecisionRef(i.decisionRef) : null,
    blueprintRef: i.blueprintRef ? freezeBlueprintRef(i.blueprintRef) : null,
    runtimeRef: i.runtimeRef ? freezeRuntimeRef(i.runtimeRef) : null,
    athleteStateRef: i.athleteStateRef ? freezeAthleteStateRef(i.athleteStateRef) : null,
    coachContextRef: i.coachContextRef ? freezeCoachContextRef(i.coachContextRef) : null,
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeContext(c: WorkoutAdaptationContext): WorkoutAdaptationContext {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    blueprintRef: c.blueprintRef ? freezeBlueprintRef(c.blueprintRef) : null,
    runtimeRef: c.runtimeRef ? freezeRuntimeRef(c.runtimeRef) : null,
    athleteStateRef: c.athleteStateRef ? freezeAthleteStateRef(c.athleteStateRef) : null,
    coachContextRef: c.coachContextRef ? freezeCoachContextRef(c.coachContextRef) : null,
    decisionRef: c.decisionRef ? freezeDecisionRef(c.decisionRef) : null,
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeAdaptation(a: WorkoutAdaptation): WorkoutAdaptation {
  return Object.freeze({
    ...a,
    decisionKeys: Object.freeze([...a.decisionKeys]),
    signalKeys: Object.freeze([...a.signalKeys]),
    modifications: Object.freeze(a.modifications.map(freezeModification)),
    adjustments: Object.freeze(a.adjustments.map(freezeAdjustment)),
    replacements: Object.freeze(a.replacements.map(freezeReplacement)),
    exerciseAdjustments: Object.freeze(a.exerciseAdjustments.map(freezeExerciseAdjustment)),
    exerciseReplacements: Object.freeze(a.exerciseReplacements.map(freezeExerciseReplacement)),
    exerciseRemovals: Object.freeze(a.exerciseRemovals.map(freezeExerciseRemoval)),
    exerciseInsertions: Object.freeze(a.exerciseInsertions.map(freezeExerciseInsertion)),
    setAdjustments: Object.freeze(a.setAdjustments.map(freezeSetAdjustment)),
    repAdjustments: Object.freeze(a.repAdjustments.map(freezeRepAdjustment)),
    loadAdjustments: Object.freeze(a.loadAdjustments.map(freezeLoadAdjustment)),
    intensityAdjustments: Object.freeze(a.intensityAdjustments.map(freezeIntensityAdjustment)),
    volumeAdjustments: Object.freeze(a.volumeAdjustments.map(freezeVolumeAdjustment)),
    restAdjustments: Object.freeze(a.restAdjustments.map(freezeRestAdjustment)),
    tempoAdjustments: Object.freeze(a.tempoAdjustments.map(freezeTempoAdjustment)),
    frequencyAdjustments: Object.freeze(a.frequencyAdjustments.map(freezeFrequencyAdjustment)),
    weeklyAdjustments: Object.freeze(a.weeklyAdjustments.map(freezeWeeklyAdjustment)),
    progressionAdjustments: Object.freeze(a.progressionAdjustments.map(freezeProgressionAdjustment)),
    regressionAdjustments: Object.freeze(a.regressionAdjustments.map(freezeRegressionAdjustment)),
    plateauAdjustments: Object.freeze(a.plateauAdjustments.map(freezePlateauAdjustment)),
    fatigueAdjustments: Object.freeze(a.fatigueAdjustments.map(freezeFatigueAdjustment)),
    recoveryAdjustments: Object.freeze(a.recoveryAdjustments.map(freezeRecoveryAdjustment)),
    sessionAdjustments: Object.freeze(a.sessionAdjustments.map(freezeSessionAdjustment)),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeUpdatedBlueprint(b: UpdatedWorkoutBlueprint): UpdatedWorkoutBlueprint {
  return Object.freeze({
    ...b,
    dayKeys: Object.freeze([...b.dayKeys]),
    exerciseKeys: Object.freeze([...b.exerciseKeys]),
    sessionKeys: Object.freeze([...b.sessionKeys]),
    weekKeys: Object.freeze([...b.weekKeys]),
    modificationIds: Object.freeze([...b.modificationIds]),
    metadata: freezeMetadata(b.metadata),
  });
}

export function freezeRuntimeInput(r: WorkoutRuntimeInput): WorkoutRuntimeInput {
  return Object.freeze({
    ...r,
    sessionKeys: Object.freeze([...r.sessionKeys]),
    exerciseKeys: Object.freeze([...r.exerciseKeys]),
    modificationIds: Object.freeze([...r.modificationIds]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeComparison(c: WorkoutComparison): WorkoutComparison {
  return Object.freeze({
    ...c,
    beforeKeys: Object.freeze([...c.beforeKeys]),
    afterKeys: Object.freeze([...c.afterKeys]),
    addedKeys: Object.freeze([...c.addedKeys]),
    removedKeys: Object.freeze([...c.removedKeys]),
    sharedKeys: Object.freeze([...c.sharedKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeHistoryEntry(e: WorkoutHistoryEntry): WorkoutHistoryEntry {
  return Object.freeze({ ...e, keys: Object.freeze([...e.keys]) });
}

export function freezeHistory(h: WorkoutHistory): WorkoutHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    historyKeys: Object.freeze([...h.historyKeys]),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeTimelineItem(i: WorkoutTimelineItem): WorkoutTimelineItem {
  return Object.freeze({ ...i, keys: Object.freeze([...i.keys]) });
}

export function freezeTimeline(t: WorkoutTimeline): WorkoutTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeSummary(s: WorkoutSummary): WorkoutSummary {
  return Object.freeze({
    ...s,
    decisionKeys: Object.freeze([...s.decisionKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeDiagnostics(d: WorkoutDiagnostics): WorkoutDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeStatistics(s: WorkoutStatistics): WorkoutStatistics {
  return Object.freeze({ ...s });
}

export function freezeDescriptor(d: WorkoutDescriptor): WorkoutDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: WorkoutValidation): WorkoutValidation {
  return Object.freeze({
    valid: v.valid,
    issues: Object.freeze([...v.issues]),
  });
}

export function freezePackage(p: WorkoutPackage): WorkoutPackage {
  return Object.freeze({
    ...p,
    adaptation: p.adaptation ? freezeAdaptation(p.adaptation) : null,
    updatedBlueprint: p.updatedBlueprint ? freezeUpdatedBlueprint(p.updatedBlueprint) : null,
    runtimeInput: p.runtimeInput ? freezeRuntimeInput(p.runtimeInput) : null,
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    comparison: p.comparison ? freezeComparison(p.comparison) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    history: p.history ? freezeHistory(p.history) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeOutput(o: WorkoutAdaptationOutput): WorkoutAdaptationOutput {
  return Object.freeze({
    ...o,
    adaptation: o.adaptation ? freezeAdaptation(o.adaptation) : null,
    updatedBlueprint: o.updatedBlueprint ? freezeUpdatedBlueprint(o.updatedBlueprint) : null,
    runtimeInput: o.runtimeInput ? freezeRuntimeInput(o.runtimeInput) : null,
    package: o.package ? freezePackage(o.package) : null,
    summary: o.summary ? freezeSummary(o.summary) : null,
    snapshot: o.snapshot ? freezeSnapshot(o.snapshot) : null,
  });
}

export function freezeState(s: WorkoutAdaptationState): WorkoutAdaptationState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    adaptation: s.adaptation ? freezeAdaptation(s.adaptation) : null,
  });
}

export function freezeResult(r: WorkoutResult): WorkoutResult {
  return Object.freeze({
    ...r,
    adaptation: r.adaptation ? freezeAdaptation(r.adaptation) : null,
    updatedBlueprint: r.updatedBlueprint ? freezeUpdatedBlueprint(r.updatedBlueprint) : null,
    runtimeInput: r.runtimeInput ? freezeRuntimeInput(r.runtimeInput) : null,
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    comparison: r.comparison ? freezeComparison(r.comparison) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}
`,
);

write(
  "utils/index.ts",
  `export * from "./ComparisonHelpers";
export * from "./FormattingHelpers";
export * from "./FreezeWorkoutAdaptation";
export * from "./StatisticsHelpers";
export * from "./WorkoutAdaptationHelpers";
`,
);

console.log(`Wrote ${fileCount} files to ${ROOT}`);
