/**
 * Sprint 24.1 — Workout Adaptation Engine generator (part 2: evaluation, planning, adapters, builders, comparison).
 * Run: node scripts/generate-workout-adaptation-part2.mjs
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

function evaluator(name, prefixes, ordinalTable) {
  const flagName = name.replace("Evaluator", "").toLowerCase();
  write(
    `evaluation/${name}.ts`,
    `/** Deterministic ordinal / flag lookup only — no prescription invention. */
export interface ${name.replace("Evaluator", "")}Evaluation {
  readonly ordinal: number;
  readonly label: string;
  readonly present: boolean;
  readonly matchedKeys: readonly string[];
}

const ORDINAL_TABLE: Readonly<Record<string, number>> = Object.freeze(${JSON.stringify(ordinalTable)});

const PREFIXES: readonly string[] = Object.freeze(${JSON.stringify(prefixes)});

function labelForOrdinal(ordinal: number): string {
  if (ordinal <= 0) return "critical";
  if (ordinal === 1) return "high";
  if (ordinal === 2) return "normal";
  return "low";
}

export function evaluate${name.replace("Evaluator", "")}(signalKeys: readonly string[]): ${name.replace("Evaluator", "")}Evaluation {
  const matched: string[] = [];
  let ordinal = 3;
  for (const key of signalKeys) {
    for (const prefix of PREFIXES) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        matched.push(key);
        const tableOrdinal = ORDINAL_TABLE[prefix] ?? ORDINAL_TABLE[key] ?? 2;
        if (tableOrdinal < ordinal) ordinal = tableOrdinal;
      }
    }
  }
  const present = matched.length > 0;
  return Object.freeze({
    ordinal: present ? ordinal : 3,
    label: labelForOrdinal(present ? ordinal : 3),
    present,
    matchedKeys: Object.freeze([...matched].sort()),
  });
}
`,
  );
}

evaluator("VolumeEvaluator", ["volume", "decision:key:volume"], { volume: 1, "decision:key:volume": 1 });
evaluator("IntensityEvaluator", ["intensity", "decision:key:intensity"], { intensity: 1, "decision:key:intensity": 1 });
evaluator("FrequencyEvaluator", ["frequency", "decision:key:frequency"], { frequency: 2, "decision:key:frequency": 2 });
evaluator("RecoveryEvaluator", ["recovery", "state:recovery"], { recovery: 0, "state:recovery": 0 });
evaluator("FatigueEvaluator", ["fatigue", "state:fatigue"], { fatigue: 0, "state:fatigue": 0 });
evaluator("ProgressionEvaluator", ["progression", "decision:key:progression"], { progression: 1, "decision:key:progression": 1 });
evaluator("PlateauEvaluator", ["plateau", "decision:key:plateau"], { plateau: 1, "decision:key:plateau": 1 });
evaluator("ConsistencyEvaluator", ["consistency", "decision:key:consistency"], { consistency: 2, "decision:key:consistency": 2 });

write(
  "evaluation/index.ts",
  `export * from "./ConsistencyEvaluator";
export * from "./FatigueEvaluator";
export * from "./FrequencyEvaluator";
export * from "./IntensityEvaluator";
export * from "./PlateauEvaluator";
export * from "./ProgressionEvaluator";
export * from "./RecoveryEvaluator";
export * from "./VolumeEvaluator";

import { evaluateConsistency } from "./ConsistencyEvaluator";
import { evaluateFatigue } from "./FatigueEvaluator";
import { evaluateFrequency } from "./FrequencyEvaluator";
import { evaluateIntensity } from "./IntensityEvaluator";
import { evaluatePlateau } from "./PlateauEvaluator";
import { evaluateProgression } from "./ProgressionEvaluator";
import { evaluateRecovery } from "./RecoveryEvaluator";
import { evaluateVolume } from "./VolumeEvaluator";

export interface WorkoutEvaluationBundle {
  readonly volume: ReturnType<typeof evaluateVolume>;
  readonly intensity: ReturnType<typeof evaluateIntensity>;
  readonly frequency: ReturnType<typeof evaluateFrequency>;
  readonly recovery: ReturnType<typeof evaluateRecovery>;
  readonly fatigue: ReturnType<typeof evaluateFatigue>;
  readonly progression: ReturnType<typeof evaluateProgression>;
  readonly plateau: ReturnType<typeof evaluatePlateau>;
  readonly consistency: ReturnType<typeof evaluateConsistency>;
}

export function evaluateWorkoutSignals(signalKeys: readonly string[]): WorkoutEvaluationBundle {
  return Object.freeze({
    volume: evaluateVolume(signalKeys),
    intensity: evaluateIntensity(signalKeys),
    frequency: evaluateFrequency(signalKeys),
    recovery: evaluateRecovery(signalKeys),
    fatigue: evaluateFatigue(signalKeys),
    progression: evaluateProgression(signalKeys),
    plateau: evaluatePlateau(signalKeys),
    consistency: evaluateConsistency(signalKeys),
  });
}
`,
);

// ─── PLANNING ─────────────────────────────────────────────────────────────────

write(
  "planning/WorkoutPlanner.ts",
  `import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface WorkoutPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly decisionKeys: readonly string[];
}

/** Deterministic planning structures only — no execution. */
export function planWorkout(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly blueprintKeys: readonly string[];
}): WorkoutPlan {
  const stepKeys = uniqueSorted(
    input.decisionKeys.map((k) => \`step:workout:\${k}\`),
  );
  const targetKeys = uniqueSorted([
    ...input.blueprintKeys.map((k) => \`target:\${k}\`),
    ...input.decisionKeys.map((k) => \`target:decision:\${k}\`),
  ]);
  return Object.freeze({
    id: \`plan:workout:\${input.id}\`,
    stepKeys,
    targetKeys,
    decisionKeys: uniqueSorted(input.decisionKeys),
  });
}
`,
);

write(
  "planning/ExercisePlanner.ts",
  `import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface ExercisePlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
}

export function planExercises(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
}): ExercisePlan {
  const relevant = input.decisionKeys.filter(
    (k) => k.includes("exercise") || k.includes("volume") || k.includes("intensity") || k.includes("progression"),
  );
  return Object.freeze({
    id: \`plan:exercise:\${input.id}\`,
    stepKeys: uniqueSorted(relevant.map((k) => \`step:exercise:\${k}\`)),
    targetKeys: uniqueSorted(input.exerciseKeys.map((k) => \`target:\${k}\`)),
    exerciseKeys: uniqueSorted(input.exerciseKeys),
  });
}
`,
);

write(
  "planning/ProgressionPlanner.ts",
  `import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface ProgressionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
}

export function planProgression(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
}): ProgressionPlan {
  const keys = input.decisionKeys.filter(
    (k) => k.includes("progression") || k.includes("plateau") || k.includes("regression"),
  );
  return Object.freeze({
    id: \`plan:progression:\${input.id}\`,
    stepKeys: uniqueSorted(keys.map((k) => \`step:progression:\${k}\`)),
    targetKeys: uniqueSorted(keys.map((k) => \`target:progression:\${k}\`)),
  });
}
`,
);

write(
  "planning/RegressionPlanner.ts",
  `import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface RegressionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
}

export function planRegression(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
}): RegressionPlan {
  const keys = uniqueSorted([
    ...input.decisionKeys.filter((k) => k.includes("regression") || k.includes("fatigue")),
    ...input.signalKeys.filter((k) => k.includes("fatigue") || k.includes("recovery")),
  ]);
  return Object.freeze({
    id: \`plan:regression:\${input.id}\`,
    stepKeys: uniqueSorted(keys.map((k) => \`step:regression:\${k}\`)),
    targetKeys: uniqueSorted(keys.map((k) => \`target:regression:\${k}\`)),
  });
}
`,
);

write(
  "planning/SessionPlanner.ts",
  `import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface SessionPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly sessionKeys: readonly string[];
}

export function planSessions(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly sessionKeys: readonly string[];
}): SessionPlan {
  return Object.freeze({
    id: \`plan:session:\${input.id}\`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter((k) => k.includes("session") || k.includes("frequency"))
        .map((k) => \`step:session:\${k}\`),
    ),
    targetKeys: uniqueSorted(input.sessionKeys.map((k) => \`target:\${k}\`)),
    sessionKeys: uniqueSorted(input.sessionKeys),
  });
}
`,
);

write(
  "planning/WeekPlanner.ts",
  `import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export interface WeekPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly weekKeys: readonly string[];
}

export function planWeeks(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): WeekPlan {
  return Object.freeze({
    id: \`plan:week:\${input.id}\`,
    stepKeys: uniqueSorted(
      input.decisionKeys
        .filter((k) => k.includes("week") || k.includes("frequency") || k.includes("volume"))
        .map((k) => \`step:week:\${k}\`),
    ),
    targetKeys: uniqueSorted(input.weekKeys.map((k) => \`target:\${k}\`)),
    weekKeys: uniqueSorted(input.weekKeys),
  });
}
`,
);

write(
  "planning/index.ts",
  `export * from "./ExercisePlanner";
export * from "./ProgressionPlanner";
export * from "./RegressionPlanner";
export * from "./SessionPlanner";
export * from "./WeekPlanner";
export * from "./WorkoutPlanner";

import { planExercises, type ExercisePlan } from "./ExercisePlanner";
import { planProgression, type ProgressionPlan } from "./ProgressionPlanner";
import { planRegression, type RegressionPlan } from "./RegressionPlanner";
import { planSessions, type SessionPlan } from "./SessionPlanner";
import { planWeeks, type WeekPlan } from "./WeekPlanner";
import { planWorkout, type WorkoutPlan } from "./WorkoutPlanner";

export interface WorkoutPlanBundle {
  readonly workout: WorkoutPlan;
  readonly exercise: ExercisePlan;
  readonly progression: ProgressionPlan;
  readonly regression: RegressionPlan;
  readonly session: SessionPlan;
  readonly week: WeekPlan;
}

export function planWorkoutAdaptation(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly blueprintKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): WorkoutPlanBundle {
  return Object.freeze({
    workout: planWorkout(input),
    exercise: planExercises(input),
    progression: planProgression(input),
    regression: planRegression(input),
    session: planSessions(input),
    week: planWeeks(input),
  });
}
`,
);

// ─── ADAPTERS (application/) ──────────────────────────────────────────────────

function adapter(fileName, fnName, modelImport, modelType, buildBody) {
  write(
    `application/${fileName}`,
    `import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { ${modelType} } from "../models/${modelImport}";
import { freeze${modelType} } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function ${fnName}(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly ${modelType}[] {
${buildBody}
}
`,
  );
}

adapter(
  "ExerciseAdapter.ts",
  "adaptExercise",
  "ExerciseAdjustment",
  "ExerciseAdjustment",
  `  const out: ExerciseAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("exercise")) continue;
    out.push(
      freezeExerciseAdjustment({
        id: \`adj:exercise:\${input.id}:\${target}\`,
        exerciseKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "SetAdapter.ts",
  "adaptSet",
  "SetAdjustment",
  "SetAdjustment",
  `  const out: SetAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("volume") && !key.includes("set")) continue;
    out.push(
      freezeSetAdjustment({
        id: \`adj:set:\${input.id}:\${key}\`,
        setKey: \`set:\${key}\`,
        targetKey: \`target:set:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "RepAdapter.ts",
  "adaptRep",
  "RepAdjustment",
  "RepAdjustment",
  `  const out: RepAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("rep") && !key.includes("volume")) continue;
    out.push(
      freezeRepAdjustment({
        id: \`adj:rep:\${input.id}:\${key}\`,
        repKey: \`rep:\${key}\`,
        targetKey: \`target:rep:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "LoadAdapter.ts",
  "adaptLoad",
  "LoadAdjustment",
  "LoadAdjustment",
  `  const out: LoadAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("load") && !key.includes("intensity") && !key.includes("progression")) continue;
    out.push(
      freezeLoadAdjustment({
        id: \`adj:load:\${input.id}:\${key}\`,
        loadKey: \`load:\${key}\`,
        targetKey: \`target:load:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "TempoAdapter.ts",
  "adaptTempo",
  "TempoAdjustment",
  "TempoAdjustment",
  `  const out: TempoAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("tempo")) continue;
    out.push(
      freezeTempoAdjustment({
        id: \`adj:tempo:\${input.id}:\${key}\`,
        tempoKey: \`tempo:\${key}\`,
        targetKey: \`target:tempo:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "RestAdapter.ts",
  "adaptRest",
  "RestAdjustment",
  "RestAdjustment",
  `  const out: RestAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("rest") && !key.includes("recovery")) continue;
    out.push(
      freezeRestAdjustment({
        id: \`adj:rest:\${input.id}:\${key}\`,
        restKey: \`rest:\${key}\`,
        targetKey: \`target:rest:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "FrequencyAdapter.ts",
  "adaptFrequency",
  "FrequencyAdjustment",
  "FrequencyAdjustment",
  `  const out: FrequencyAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("frequency")) continue;
    out.push(
      freezeFrequencyAdjustment({
        id: \`adj:frequency:\${input.id}:\${key}\`,
        frequencyKey: \`frequency:\${key}\`,
        targetKey: \`target:frequency:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "VolumeAdapter.ts",
  "adaptVolume",
  "VolumeAdjustment",
  "VolumeAdjustment",
  `  const out: VolumeAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("volume")) continue;
    out.push(
      freezeVolumeAdjustment({
        id: \`adj:volume:\${input.id}:\${key}\`,
        volumeKey: \`volume:\${key}\`,
        targetKey: \`target:volume:\${key}\`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

adapter(
  "WeekAdapter.ts",
  "adaptWeek",
  "WeeklyAdjustment",
  "WeeklyAdjustment",
  `  const out: WeeklyAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("week")) continue;
    out.push(
      freezeWeeklyAdjustment({
        id: \`adj:week:\${input.id}:\${target}\`,
        weekKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);
`,
);

// Public API index — adapters NOT re-exported
write(
  "application/index.ts",
  `import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import type { WorkoutResult } from "../models/WorkoutResult";
import {
  createWorkoutAdaptationEngineService,
  type WorkoutAdaptationEngineService,
  type WorkoutAdaptationEngineServiceDeps,
} from "../services/WorkoutAdaptationEngineService";

function resolveService(
  service?: WorkoutAdaptationEngineService,
  deps?: WorkoutAdaptationEngineServiceDeps,
): WorkoutAdaptationEngineService {
  return service ?? createWorkoutAdaptationEngineService(deps);
}

/** Public API — adapt existing workout blueprint from continuous adaptation decisions. */
export function adaptWorkout(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).adaptWorkout(options.input);
}

/** Public API — compare blueprint / snapshot keys. */
export function compareWorkout(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).compareWorkout(options.input);
}

/** Public API — describe Workout Adaptation Engine capabilities. */
export function describeWorkoutAdaptation(options: {
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
} = {}): WorkoutDescriptor {
  return resolveService(options.service, options.deps).describeWorkoutAdaptation();
}

/** Public API — create workout adaptation snapshot. */
export function createWorkoutSnapshot(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).createWorkoutSnapshot(options.input);
}

/** Public API — validate workout adaptation package. */
export function validateWorkoutAdaptation(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).validateWorkoutAdaptation(options.input);
}

export type { WorkoutAdaptationEngineServiceDeps };
`,
);

// ─── COMPARISON ───────────────────────────────────────────────────────────────

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
  "comparison/BlueprintComparator.ts",
  `import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import { freezeComparison } from "../utils/FreezeWorkoutAdaptation";
import { diffKeys } from "./diffHelpers";

export function compareBlueprints(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly at: string;
}): WorkoutComparison {
  const diff = diffKeys(input.beforeKeys, input.afterKeys);
  return freezeComparison({
    id: \`comparison:blueprint:\${input.id}\`,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    beforeKeys: Object.freeze([...input.beforeKeys]),
    afterKeys: Object.freeze([...input.afterKeys]),
    addedKeys: diff.added,
    removedKeys: diff.removed,
    sharedKeys: diff.shared,
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "comparison/SessionComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareSessions(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/ExerciseComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareExercises(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/ProgressComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareProgress(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/HistoryComparator.ts",
  `import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareHistory(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  return diffKeys(before, after);
}
`,
);

write(
  "comparison/index.ts",
  `export * from "./BlueprintComparator";
export * from "./ExerciseComparator";
export * from "./HistoryComparator";
export * from "./ProgressComparator";
export * from "./SessionComparator";
export * from "./diffHelpers";
`,
);

// ─── BUILDERS ─────────────────────────────────────────────────────────────────

write(
  "builders/WorkoutAdaptationBuilder.ts",
  `import type { ExerciseAdjustment } from "../models/ExerciseAdjustment";
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
import type { SessionAdjustment } from "../models/SessionAdjustment";
import type { SetAdjustment } from "../models/SetAdjustment";
import type { TempoAdjustment } from "../models/TempoAdjustment";
import type { VolumeAdjustment } from "../models/VolumeAdjustment";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutAdjustment } from "../models/WorkoutAdjustment";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutModification } from "../models/WorkoutModification";
import { WorkoutModificationKinds } from "../models/WorkoutModification";
import type { WorkoutReplacement } from "../models/WorkoutReplacement";
import { freezeAdaptation, freezeModification } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutAdaptation(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly exerciseAdjustments?: readonly ExerciseAdjustment[];
  readonly setAdjustments?: readonly SetAdjustment[];
  readonly repAdjustments?: readonly RepAdjustment[];
  readonly loadAdjustments?: readonly LoadAdjustment[];
  readonly intensityAdjustments?: readonly IntensityAdjustment[];
  readonly volumeAdjustments?: readonly VolumeAdjustment[];
  readonly restAdjustments?: readonly RestAdjustment[];
  readonly tempoAdjustments?: readonly TempoAdjustment[];
  readonly frequencyAdjustments?: readonly FrequencyAdjustment[];
  readonly weeklyAdjustments?: readonly WeeklyAdjustment[];
  readonly progressionAdjustments?: readonly ProgressionAdjustment[];
  readonly regressionAdjustments?: readonly RegressionAdjustment[];
  readonly plateauAdjustments?: readonly PlateauAdjustment[];
  readonly fatigueAdjustments?: readonly FatigueAdjustment[];
  readonly recoveryAdjustments?: readonly RecoveryAdjustment[];
  readonly sessionAdjustments?: readonly SessionAdjustment[];
  readonly exerciseReplacements?: readonly ExerciseReplacement[];
  readonly exerciseRemovals?: readonly ExerciseRemoval[];
  readonly exerciseInsertions?: readonly ExerciseInsertion[];
  readonly at: string;
}): WorkoutAdaptation {
  const exerciseAdjustments = Object.freeze([...(input.exerciseAdjustments ?? [])]);
  const volumeAdjustments = Object.freeze([...(input.volumeAdjustments ?? [])]);
  const loadAdjustments = Object.freeze([...(input.loadAdjustments ?? [])]);
  const setAdjustments = Object.freeze([...(input.setAdjustments ?? [])]);
  const repAdjustments = Object.freeze([...(input.repAdjustments ?? [])]);
  const restAdjustments = Object.freeze([...(input.restAdjustments ?? [])]);
  const tempoAdjustments = Object.freeze([...(input.tempoAdjustments ?? [])]);
  const frequencyAdjustments = Object.freeze([...(input.frequencyAdjustments ?? [])]);
  const weeklyAdjustments = Object.freeze([...(input.weeklyAdjustments ?? [])]);
  const sessionAdjustments = Object.freeze([...(input.sessionAdjustments ?? [])]);

  const modifications: WorkoutModification[] = [];
  for (const adj of [
    ...exerciseAdjustments,
    ...volumeAdjustments,
    ...loadAdjustments,
    ...setAdjustments,
    ...repAdjustments,
    ...restAdjustments,
    ...tempoAdjustments,
    ...frequencyAdjustments,
    ...weeklyAdjustments,
    ...sessionAdjustments,
  ]) {
    modifications.push(
      freezeModification({
        id: \`mod:\${adj.id}\`,
        kind: WorkoutModificationKinds.ADJUSTMENT,
        targetKey: adj.targetKey,
        sourceDecisionKeys: adj.sourceDecisionKeys,
        planStepKeys: adj.planStepKeys,
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }

  const adjustments: readonly WorkoutAdjustment[] = Object.freeze(
    modifications.map((m) =>
      Object.freeze({
        id: \`wa:\${m.id}\`,
        targetKey: m.targetKey,
        adjustmentKey: m.id,
        sourceDecisionKeys: m.sourceDecisionKeys,
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    ),
  );

  const replacements: readonly WorkoutReplacement[] = Object.freeze([]);

  return freezeAdaptation({
    id: input.id,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    contextId: input.contextId,
    decisionKeys: Object.freeze([...input.decisionKeys]),
    signalKeys: Object.freeze([...input.signalKeys]),
    modifications: Object.freeze(modifications),
    adjustments,
    replacements,
    exerciseAdjustments,
    exerciseReplacements: Object.freeze([...(input.exerciseReplacements ?? [])]),
    exerciseRemovals: Object.freeze([...(input.exerciseRemovals ?? [])]),
    exerciseInsertions: Object.freeze([...(input.exerciseInsertions ?? [])]),
    setAdjustments,
    repAdjustments,
    loadAdjustments,
    intensityAdjustments: Object.freeze([...(input.intensityAdjustments ?? [])]),
    volumeAdjustments,
    restAdjustments,
    tempoAdjustments,
    frequencyAdjustments,
    weeklyAdjustments,
    progressionAdjustments: Object.freeze([...(input.progressionAdjustments ?? [])]),
    regressionAdjustments: Object.freeze([...(input.regressionAdjustments ?? [])]),
    plateauAdjustments: Object.freeze([...(input.plateauAdjustments ?? [])]),
    fatigueAdjustments: Object.freeze([...(input.fatigueAdjustments ?? [])]),
    recoveryAdjustments: Object.freeze([...(input.recoveryAdjustments ?? [])]),
    sessionAdjustments,
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/WorkoutPackageBuilder.ts",
  `import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import type { WorkoutDiagnostics } from "../models/WorkoutDiagnostics";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import type { WorkoutRuntimeInput } from "../models/WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import type { WorkoutStatistics } from "../models/WorkoutStatistics";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type { WorkoutTimeline } from "../models/WorkoutTimeline";
import { freezeDiagnostics, freezePackage } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutPackage(input: {
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
  readonly processingSteps: readonly string[];
  readonly at: string;
}): WorkoutPackage {
  const diagnostics: WorkoutDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["workout_adaptation_pipeline"]),
    warnings: Object.freeze([] as string[]),
    processingSteps: Object.freeze([...input.processingSteps]),
  });
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    contextId: input.contextId,
    adaptation: input.adaptation,
    updatedBlueprint: input.updatedBlueprint,
    runtimeInput: input.runtimeInput,
    summary: input.summary,
    snapshot: input.snapshot,
    comparison: input.comparison,
    timeline: input.timeline,
    history: input.history,
    statistics: input.statistics,
    diagnostics,
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/WorkoutSummaryBuilder.ts",
  `import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import { freezeSummary } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly at: string;
}): WorkoutSummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    modificationCount: input.adaptation?.modifications.length ?? 0,
    adjustmentCount: input.adaptation?.adjustments.length ?? 0,
    decisionKeys: Object.freeze([...(input.adaptation?.decisionKeys ?? [])]),
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/WorkoutSnapshotBuilder.ts",
  `import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import { freezeSnapshot } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly blueprintKeys: readonly string[];
  readonly at: string;
}): WorkoutSnapshot {
  const bp = input.updatedBlueprint;
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    blueprintKeys: Object.freeze([...(bp ? [bp.id, ...input.blueprintKeys] : input.blueprintKeys)]),
    dayKeys: Object.freeze([...(bp?.dayKeys ?? [])]),
    exerciseKeys: Object.freeze([...(bp?.exerciseKeys ?? [])]),
    sessionKeys: Object.freeze([...(bp?.sessionKeys ?? [])]),
    weekKeys: Object.freeze([...(bp?.weekKeys ?? [])]),
    modificationIds: Object.freeze([
      ...(bp?.modificationIds ?? input.adaptation?.modifications.map((m) => m.id) ?? []),
    ]),
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/DescriptorBuilder.ts",
  `import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import { freezeDescriptor } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): WorkoutDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Workout Adaptation Engine",
    version: "24.1.0",
    capabilities: Object.freeze([
      "adaptWorkout",
      "compareWorkout",
      "describeWorkoutAdaptation",
      "createWorkoutSnapshot",
      "validateWorkoutAdaptation",
    ]),
    boundaries: Object.freeze([
      "adapts_existing_blueprint_only",
      "no_ai",
      "no_networking",
      "no_persistence",
      "no_ui",
      "no_workout_generation_from_scratch",
      "no_athlete_goal_changes",
    ]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/ResultBuilder.ts",
  `import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import type {
  WorkoutOperationKind,
  WorkoutResult,
} from "../models/WorkoutResult";
import type { WorkoutRuntimeInput } from "../models/WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { freezeResult } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutResult(input: {
  readonly id: string;
  readonly operation: WorkoutOperationKind;
  readonly success: boolean;
  readonly adaptation?: WorkoutAdaptation | null;
  readonly updatedBlueprint?: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput?: WorkoutRuntimeInput | null;
  readonly package?: WorkoutPackage | null;
  readonly summary?: WorkoutSummary | null;
  readonly snapshot?: WorkoutSnapshot | null;
  readonly comparison?: WorkoutComparison | null;
  readonly validation?: WorkoutValidation | null;
  readonly descriptor?: WorkoutDescriptor | null;
  readonly errors?: readonly WorkoutError[];
  readonly createdAt: string;
}): WorkoutResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    adaptation: input.adaptation ?? null,
    updatedBlueprint: input.updatedBlueprint ?? null,
    runtimeInput: input.runtimeInput ?? null,
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    comparison: input.comparison ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/index.ts",
  `export * from "./DescriptorBuilder";
export * from "./ResultBuilder";
export * from "./WorkoutAdaptationBuilder";
export * from "./WorkoutPackageBuilder";
export * from "./WorkoutSnapshotBuilder";
export * from "./WorkoutSummaryBuilder";
`,
);

console.log(`Wrote ${fileCount} files to ${ROOT}`);
