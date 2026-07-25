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
        id: `mod:${adj.id}`,
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
        id: `wa:${m.id}`,
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
