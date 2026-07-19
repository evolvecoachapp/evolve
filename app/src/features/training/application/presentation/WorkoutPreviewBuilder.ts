import { IntensityMetric } from "../../enums/IntensityMetric";
import { MuscleGroup } from "../../enums/MuscleGroup";
import { ProgressionModel } from "../../enums/ProgressionModel";
import { SetType } from "../../enums/SetType";
import { SplitType } from "../../enums/SplitType";
import { TrainingGoal } from "../../enums/TrainingGoal";
import { WeightUnit } from "../../enums/WeightUnit";
import type { GeneratedTrainingProgram } from "../../engine";
import type { ProgressionScheme } from "../../models/ProgressionScheme";
import type { SetPrescription } from "../../models/SetPrescription";
import type { TrainingDay } from "../../models/TrainingDay";
import type { TrainingExercise } from "../../models/TrainingExercise";
import type { ExerciseId, ProgressionSchemeId } from "../../types/ids";
import type { IntensityTarget } from "../../types/IntensityTarget";
import type { RepRange } from "../../types/RepRange";

/**
 * Resolves catalogue exercise ids to display names for preview rendering.
 * Injected so the builder never depends on catalogue storage or the engine.
 */
export interface ExerciseDisplayLookup {
  getName(id: ExerciseId): string | undefined;
}

/** UI-ready intensity target for a single prescribed set. */
export interface WorkoutPreviewIntensity {
  readonly metric: string;
  readonly value: number;
  readonly label: string;
}

/** UI-ready rep target (fixed or range). */
export interface WorkoutPreviewReps {
  readonly min: number;
  readonly max: number;
  readonly label: string;
}

/** UI-ready prescribed set. */
export interface WorkoutPreviewSet {
  readonly id: string;
  readonly setType: string;
  readonly setTypeLabel: string;
  readonly reps: WorkoutPreviewReps;
  readonly intensity: WorkoutPreviewIntensity | null;
  readonly restSeconds: number | null;
  readonly notes: string | null;
}

/** UI-ready exercise slot within a training day. */
export interface WorkoutPreviewExercise {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly sets: readonly WorkoutPreviewSet[];
  readonly progressionSummary: string | null;
  readonly supersetGroup: string | null;
}

/** UI-ready training or rest day. */
export interface WorkoutPreviewDay {
  readonly id: string;
  readonly dayIndex: number;
  readonly name: string;
  readonly isRestDay: boolean;
  readonly primaryFocus: readonly string[];
  readonly exercises: readonly WorkoutPreviewExercise[];
}

/** UI-ready weekly / microcycle schedule. */
export interface WorkoutPreviewWeeklySchedule {
  readonly name: string;
  readonly splitType: string;
  readonly splitTypeLabel: string;
  readonly cycleLengthDays: number;
  readonly days: readonly WorkoutPreviewDay[];
}

/** UI-ready progression scheme summary. */
export interface WorkoutPreviewProgressionSummary {
  readonly id: string;
  readonly model: string;
  readonly modelLabel: string;
  readonly summary: string;
  readonly incrementLabel: string | null;
  readonly cycleLengthWeeks: number | null;
  readonly deloadFrequencyWeeks: number | null;
  readonly description: string | null;
}

/**
 * Immutable, UI-ready projection of a generated training program.
 * Contains only display data — no engine types, no planning fields.
 */
export interface WorkoutProgramPreview {
  readonly title: string;
  readonly goal: string;
  readonly goalLabel: string;
  readonly durationWeeks: number;
  readonly durationLabel: string;
  readonly description: string | null;
  readonly weeklySchedule: WorkoutPreviewWeeklySchedule;
  readonly progressionSummary: readonly WorkoutPreviewProgressionSummary[];
}

/**
 * Builds a catalogue-backed `ExerciseDisplayLookup` for constructor injection.
 * Pure indexing only — no I/O, scoring, or planning.
 */
export function createExerciseDisplayLookup(
  catalogue: readonly { readonly id: ExerciseId; readonly name: string }[],
): ExerciseDisplayLookup {
  const byId = new Map(catalogue.map((entry) => [entry.id, entry.name]));
  return {
    getName: (id: ExerciseId): string | undefined => byId.get(id),
  };
}

/**
 * Application-layer presentation adapter: maps a `GeneratedTrainingProgram`
 * into immutable UI-ready preview models.
 *
 * Contains no planning, scoring, constraint, or progression logic. Does not
 * depend on React, UI components, persistence, AI, or networking. Depends on
 * the engine only through the `GeneratedTrainingProgram` contract type, and
 * resolves exercise display names via an injected `ExerciseDisplayLookup`.
 */
export class WorkoutPreviewBuilder {
  private readonly exerciseLookup: ExerciseDisplayLookup;

  constructor(exerciseLookup: ExerciseDisplayLookup) {
    this.exerciseLookup = exerciseLookup;
  }

  /** Project a generated program into an immutable workout preview. */
  build(program: GeneratedTrainingProgram): WorkoutProgramPreview {
    const schemesById = new Map(
      program.progressionSchemes.map((scheme) => [scheme.id, scheme] as const),
    );

    const progressionSummary = Object.freeze(
      program.progressionSchemes.map((scheme) => this.toProgressionSummary(scheme)),
    );

    const weeklySchedule = Object.freeze({
      name: program.split.name,
      splitType: program.split.type,
      splitTypeLabel: splitTypeLabel(program.split.type),
      cycleLengthDays: program.split.cycleLengthDays,
      days: Object.freeze(
        program.split.days.map((day) => this.toPreviewDay(day, schemesById)),
      ),
    });

    return Object.freeze({
      title: program.program.name,
      goal: program.program.goal,
      goalLabel: trainingGoalLabel(program.program.goal),
      durationWeeks: program.program.durationWeeks,
      durationLabel: durationLabel(program.program.durationWeeks),
      description: program.program.description,
      weeklySchedule,
      progressionSummary,
    });
  }

  private toPreviewDay(
    day: TrainingDay,
    schemesById: ReadonlyMap<ProgressionSchemeId, ProgressionScheme>,
  ): WorkoutPreviewDay {
    return Object.freeze({
      id: day.id,
      dayIndex: day.dayIndex,
      name: day.name,
      isRestDay: day.isRestDay,
      primaryFocus: Object.freeze(day.primaryFocus.map(muscleGroupLabel)),
      exercises: Object.freeze(
        day.exercises.map((exercise) => this.toPreviewExercise(exercise, schemesById)),
      ),
    });
  }

  private toPreviewExercise(
    exercise: TrainingExercise,
    schemesById: ReadonlyMap<ProgressionSchemeId, ProgressionScheme>,
  ): WorkoutPreviewExercise {
    const scheme =
      exercise.progressionSchemeId === null
        ? undefined
        : schemesById.get(exercise.progressionSchemeId);

    return Object.freeze({
      id: exercise.id,
      name: this.exerciseLookup.getName(exercise.exerciseId) ?? String(exercise.exerciseId),
      order: exercise.order,
      sets: Object.freeze(exercise.setPrescriptions.map((set) => this.toPreviewSet(set))),
      progressionSummary: scheme ? this.toProgressionSummary(scheme).summary : null,
      supersetGroup: exercise.supersetGroup,
    });
  }

  private toPreviewSet(set: SetPrescription): WorkoutPreviewSet {
    return Object.freeze({
      id: set.id,
      setType: set.setType,
      setTypeLabel: setTypeLabel(set.setType),
      reps: toPreviewReps(set.targetReps),
      intensity: set.intensity === null ? null : toPreviewIntensity(set.intensity),
      restSeconds: set.restSeconds,
      notes: set.notes,
    });
  }

  private toProgressionSummary(scheme: ProgressionScheme): WorkoutPreviewProgressionSummary {
    const incrementLabel = formatIncrement(scheme.incrementValue, scheme.incrementUnit);
    const modelLabel = progressionModelLabel(scheme.model);

    return Object.freeze({
      id: scheme.id,
      model: scheme.model,
      modelLabel,
      summary: buildProgressionSummaryText({
        modelLabel,
        incrementLabel,
        cycleLengthWeeks: scheme.cycleLengthWeeks,
        deloadFrequencyWeeks: scheme.deloadFrequencyWeeks,
        description: scheme.description,
      }),
      incrementLabel,
      cycleLengthWeeks: scheme.cycleLengthWeeks,
      deloadFrequencyWeeks: scheme.deloadFrequencyWeeks,
      description: scheme.description,
    });
  }
}

function toPreviewReps(targetReps: RepRange | number): WorkoutPreviewReps {
  if (typeof targetReps === "number") {
    return Object.freeze({
      min: targetReps,
      max: targetReps,
      label: String(targetReps),
    });
  }

  const label =
    targetReps.min === targetReps.max
      ? String(targetReps.min)
      : `${targetReps.min}–${targetReps.max}`;

  return Object.freeze({
    min: targetReps.min,
    max: targetReps.max,
    label,
  });
}

function toPreviewIntensity(intensity: IntensityTarget): WorkoutPreviewIntensity {
  return Object.freeze({
    metric: intensity.metric,
    value: intensity.value,
    label: intensityLabel(intensity),
  });
}

function intensityLabel(intensity: IntensityTarget): string {
  switch (intensity.metric) {
    case IntensityMetric.PercentageOneRepMax:
      return `${intensity.value}% 1RM`;
    case IntensityMetric.Rpe:
      return `RPE ${intensity.value}`;
    case IntensityMetric.Rir:
      return `RIR ${intensity.value}`;
    case IntensityMetric.AbsoluteLoad:
      return String(intensity.value);
    case IntensityMetric.VelocityBased:
      return `${intensity.value} m/s`;
    case IntensityMetric.Subjective:
      return String(intensity.value);
    default: {
      const _exhaustive: never = intensity.metric;
      return String(_exhaustive);
    }
  }
}

function formatIncrement(
  value: number | null,
  unit: WeightUnit | null,
): string | null {
  if (value === null) {
    return null;
  }
  if (unit === null) {
    return `+${value}`;
  }
  return `+${value} ${weightUnitLabel(unit)}`;
}

function buildProgressionSummaryText(input: {
  readonly modelLabel: string;
  readonly incrementLabel: string | null;
  readonly cycleLengthWeeks: number | null;
  readonly deloadFrequencyWeeks: number | null;
  readonly description: string | null;
}): string {
  if (input.description !== null && input.description.trim().length > 0) {
    return input.description;
  }

  const parts: string[] = [input.modelLabel];

  if (input.incrementLabel !== null) {
    parts.push(`${input.incrementLabel} when progressing`);
  }
  if (input.cycleLengthWeeks !== null) {
    parts.push(`${input.cycleLengthWeeks}-week cycle`);
  }
  if (input.deloadFrequencyWeeks !== null) {
    parts.push(`deload every ${input.deloadFrequencyWeeks} weeks`);
  }

  return parts.join(" · ");
}

function durationLabel(weeks: number): string {
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}

function trainingGoalLabel(goal: TrainingGoal): string {
  switch (goal) {
    case TrainingGoal.Bodybuilding:
      return "Bodybuilding";
    case TrainingGoal.Powerlifting:
      return "Powerlifting";
    case TrainingGoal.Powerbuilding:
      return "Powerbuilding";
    case TrainingGoal.Hybrid:
      return "Hybrid";
    case TrainingGoal.Strength:
      return "Strength";
    case TrainingGoal.Hypertrophy:
      return "Hypertrophy";
    case TrainingGoal.Endurance:
      return "Endurance";
    case TrainingGoal.GeneralFitness:
      return "General Fitness";
    default: {
      const _exhaustive: never = goal;
      return String(_exhaustive);
    }
  }
}

function splitTypeLabel(type: SplitType): string {
  switch (type) {
    case SplitType.FullBody:
      return "Full Body";
    case SplitType.UpperLower:
      return "Upper / Lower";
    case SplitType.PushPullLegs:
      return "Push / Pull / Legs";
    case SplitType.BroSplit:
      return "Bro Split";
    case SplitType.PowerliftingSpecialized:
      return "Powerlifting Specialized";
    case SplitType.Conjugate:
      return "Conjugate";
    case SplitType.Hybrid:
      return "Hybrid";
    case SplitType.Custom:
      return "Custom";
    default: {
      const _exhaustive: never = type;
      return String(_exhaustive);
    }
  }
}

function setTypeLabel(type: SetType): string {
  switch (type) {
    case SetType.Warmup:
      return "Warm-up";
    case SetType.Working:
      return "Working";
    case SetType.TopSet:
      return "Top Set";
    case SetType.BackOff:
      return "Back-off";
    case SetType.DropSet:
      return "Drop Set";
    case SetType.Amrap:
      return "AMRAP";
    case SetType.Failure:
      return "Failure";
    case SetType.Myorep:
      return "Myorep";
    case SetType.Cluster:
      return "Cluster";
    case SetType.Deload:
      return "Deload";
    default: {
      const _exhaustive: never = type;
      return String(_exhaustive);
    }
  }
}

function progressionModelLabel(model: ProgressionModel): string {
  switch (model) {
    case ProgressionModel.Linear:
      return "Linear";
    case ProgressionModel.DoubleProgression:
      return "Double Progression";
    case ProgressionModel.PercentageBased:
      return "Percentage-Based";
    case ProgressionModel.AutoregulatedRpe:
      return "Autoregulated RPE";
    case ProgressionModel.Undulating:
      return "Undulating";
    case ProgressionModel.Block:
      return "Block";
    case ProgressionModel.Static:
      return "Static";
    default: {
      const _exhaustive: never = model;
      return String(_exhaustive);
    }
  }
}

function weightUnitLabel(unit: WeightUnit): string {
  switch (unit) {
    case WeightUnit.Kilograms:
      return "kg";
    case WeightUnit.Pounds:
      return "lb";
    default: {
      const _exhaustive: never = unit;
      return String(_exhaustive);
    }
  }
}

function muscleGroupLabel(muscle: MuscleGroup): string {
  switch (muscle) {
    case MuscleGroup.Chest:
      return "Chest";
    case MuscleGroup.UpperBack:
      return "Upper Back";
    case MuscleGroup.LowerBack:
      return "Lower Back";
    case MuscleGroup.Lats:
      return "Lats";
    case MuscleGroup.Traps:
      return "Traps";
    case MuscleGroup.Shoulders:
      return "Shoulders";
    case MuscleGroup.Biceps:
      return "Biceps";
    case MuscleGroup.Triceps:
      return "Triceps";
    case MuscleGroup.Forearms:
      return "Forearms";
    case MuscleGroup.Core:
      return "Core";
    case MuscleGroup.Quads:
      return "Quads";
    case MuscleGroup.Hamstrings:
      return "Hamstrings";
    case MuscleGroup.Glutes:
      return "Glutes";
    case MuscleGroup.Calves:
      return "Calves";
    case MuscleGroup.FullBody:
      return "Full Body";
    default: {
      const _exhaustive: never = muscle;
      return String(_exhaustive);
    }
  }
}
