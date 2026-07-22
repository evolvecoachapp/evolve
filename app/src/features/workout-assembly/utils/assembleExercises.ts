import type { AdaptationRecommendation } from "../../training-adaptation/models/AdaptationRecommendation";
import type { ExercisePrescription } from "../../programming/models/ExercisePrescription";
import type { ExerciseSelectionResult } from "../../exercise-selection/models/ExerciseSelectionResult";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { ProgressionStep } from "../../progression/models/ProgressionStep";
import type { PrescriptionIntensityMetric } from "../../programming/models/PrescriptionIntensity";
import type { WorkoutAssemblyContext } from "../models/WorkoutAssemblyContext";
import type { WorkoutExercise, WorkoutSet } from "../models/WorkoutExercise";
import { estimateExerciseDurationSeconds } from "./estimateDuration";
import { estimateExerciseWorkload } from "./estimateWorkload";

export interface AssembledExerciseDraft {
  readonly exercise: WorkoutExercise;
  readonly appliedRecommendations: readonly AdaptationRecommendation[];
}

/**
 * Assemble immutable WorkoutExercise entries from programming + progression + adaptations.
 */
export function assembleExercises(
  context: WorkoutAssemblyContext,
  prescriptions: readonly ExercisePrescription[],
  progression: ProgressionPlan,
  selection: ExerciseSelectionResult,
  recommendations: readonly AdaptationRecommendation[],
): readonly WorkoutExercise[] {
  const isRecoveryDay = recommendations.some(
    (recommendation) => recommendation.action.kind === "insert_recovery_day",
  );

  const assembled = prescriptions.map((prescription) => {
    const step = findProgressionStep(
      progression,
      prescription.exerciseId,
      context.weekNumber,
    );
    return assembleOneExercise({
      prescription,
      step,
      selection,
      recommendations,
      weekNumber: context.weekNumber,
      isRecoveryDay,
    });
  });

  return Object.freeze(assembled.map((entry) => entry.exercise));
}

function assembleOneExercise(input: {
  readonly prescription: ExercisePrescription;
  readonly step: ProgressionStep | null;
  readonly selection: ExerciseSelectionResult;
  readonly recommendations: readonly AdaptationRecommendation[];
  readonly weekNumber: number;
  readonly isRecoveryDay: boolean;
}): AssembledExerciseDraft {
  const { prescription, step, selection, recommendations, isRecoveryDay } =
    input;

  const applicable = recommendations.filter((recommendation) => {
    const targetId = recommendation.action.targetExerciseId;
    if (targetId !== undefined && targetId !== prescription.exerciseId) {
      return false;
    }
    return true;
  });

  let exerciseId = prescription.exerciseId;
  let name = prescription.exercise.name;
  let setCount = step?.target.volumeSets ?? prescription.volume.sets;
  let repMin = step?.target.volumeRepMin ?? prescription.volume.repMin;
  let repMax = step?.target.volumeRepMax ?? prescription.volume.repMax;
  let intensityMetric: PrescriptionIntensityMetric =
    step?.target.intensityMetric ?? prescription.intensity.metric;
  let intensityValue =
    step?.target.intensityValue ?? prescription.intensity.value;
  const notes: string[] = [...prescription.execution.notes];
  const appliedIds: string[] = [];

  for (const recommendation of applicable) {
    const { action } = recommendation;
    appliedIds.push(recommendation.id);

    switch (action.kind) {
      case "reduce_volume": {
        const reduction = Math.max(1, Math.round(action.magnitude));
        setCount = Math.max(1, setCount - reduction);
        notes.push(`adapt_reduce_volume:${recommendation.id}`);
        break;
      }
      case "reduce_intensity": {
        if (intensityValue !== null) {
          intensityValue = round3(
            Math.max(0, intensityValue - action.magnitude),
          );
        }
        notes.push(`adapt_reduce_intensity:${recommendation.id}`);
        break;
      }
      case "swap_exercise": {
        const swap = findSwapCandidate(
          selection,
          prescription.exerciseId,
          prescription.role,
        );
        if (swap) {
          exerciseId = swap.exerciseId;
          name = swap.name;
          notes.push(`adapt_swap_exercise:${recommendation.id}:${swap.exerciseId}`);
        } else {
          notes.push(`adapt_swap_exercise_unavailable:${recommendation.id}`);
        }
        break;
      }
      case "insert_recovery_day": {
        setCount = Math.max(1, Math.floor(setCount / 2));
        if (intensityValue !== null) {
          intensityValue = round3(Math.max(0, intensityValue - 1));
        }
        notes.push(`adapt_recovery_day:${recommendation.id}`);
        break;
      }
      case "adjust_schedule": {
        notes.push(`adapt_adjust_schedule:${recommendation.id}`);
        break;
      }
      default:
        break;
    }
  }

  if (isRecoveryDay && !applicable.some((r) => r.action.kind === "insert_recovery_day")) {
    setCount = Math.max(1, Math.floor(setCount / 2));
    notes.push("session_recovery_day_volume_halved");
  }

  const sets = buildSets({
    setCount,
    repMin,
    repMax,
    intensityMetric,
    intensityValue,
  });

  const betweenSetsRestSeconds = prescription.rest.betweenSetsSeconds;
  const estimatedDurationSeconds = estimateExerciseDurationSeconds({
    setCount,
    betweenSetsRestSeconds,
  });
  const estimatedWorkload = estimateExerciseWorkload({
    setCount,
    repMin,
    repMax,
    fatigueEstimate: prescription.fatigueEstimate,
  });

  const blockKind = prescription.role;
  const blockId = `block:${blockKind}`;
  const exercise: WorkoutExercise = Object.freeze({
    id: `workout-ex:${exerciseId}:${prescription.order}`,
    exerciseId,
    name,
    role: prescription.role,
    order: prescription.order,
    blockId,
    sets,
    setCount,
    repMin,
    repMax,
    intensityMetric,
    intensityValue,
    restSeconds: prescription.rest.seconds,
    betweenSetsRestSeconds,
    tempo: prescription.tempo,
    notes: Object.freeze(notes),
    cues: Object.freeze([...prescription.execution.cues]),
    appliedRecommendationIds: Object.freeze([...new Set(appliedIds)]),
    estimatedDurationSeconds,
    estimatedWorkload,
    fatigueEstimate: prescription.fatigueEstimate,
    skillEstimate: prescription.skillEstimate,
  });

  return Object.freeze({
    exercise,
    appliedRecommendations: Object.freeze(applicable),
  });
}

function buildSets(input: {
  readonly setCount: number;
  readonly repMin: number;
  readonly repMax: number;
  readonly intensityMetric: PrescriptionIntensityMetric;
  readonly intensityValue: number | null;
}): readonly WorkoutSet[] {
  const sets: WorkoutSet[] = [];
  for (let index = 1; index <= input.setCount; index += 1) {
    sets.push(
      Object.freeze({
        setIndex: index,
        repMin: input.repMin,
        repMax: input.repMax,
        targetRpe:
          input.intensityMetric === "rpe" ? input.intensityValue : null,
        targetRir:
          input.intensityMetric === "rir" ? input.intensityValue : null,
      }),
    );
  }
  return Object.freeze(sets);
}

function findProgressionStep(
  progression: ProgressionPlan,
  exerciseId: string,
  weekNumber: number,
): ProgressionStep | null {
  const entry = progression.exerciseProgressions.find(
    (progressionEntry) => progressionEntry.exerciseId === exerciseId,
  );
  if (!entry) {
    return null;
  }
  return (
    entry.steps.find((step) => step.weekNumber === weekNumber) ?? null
  );
}

function findSwapCandidate(
  selection: ExerciseSelectionResult,
  currentExerciseId: string,
  role: ExercisePrescription["role"],
): { readonly exerciseId: string; readonly name: string } | null {
  const group = selection.groups.find((entry) => entry.role === role);
  const candidates = group?.candidates ?? selection.candidates.filter(
    (candidate) => candidate.role === role,
  );
  const alternative = [...candidates]
    .filter((candidate) => candidate.exerciseId !== currentExerciseId)
    .sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }
      return left.exerciseId.localeCompare(right.exerciseId);
    })[0];

  if (!alternative) {
    return null;
  }
  return {
    exerciseId: alternative.exerciseId,
    name: alternative.exercise.name,
  };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
