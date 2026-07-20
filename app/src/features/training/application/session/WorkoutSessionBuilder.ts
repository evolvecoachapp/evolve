import type {
  WorkoutPreviewDay,
  WorkoutPreviewExercise,
  WorkoutPreviewIntensity,
  WorkoutPreviewProgressionSummary,
  WorkoutPreviewReps,
  WorkoutPreviewSet,
  WorkoutProgramPreview,
} from "../presentation";

/**
 * Lifecycle status for an executable workout session.
 * Sessions are created in `ready` state; status transitions happen outside this builder.
 */
export type WorkoutSessionStatus = "ready" | "in_progress" | "completed" | "skipped";

/** UI-ready rep target carried into session execution. */
export interface WorkoutSessionReps {
  readonly min: number;
  readonly max: number;
  readonly label: string;
}

/** UI-ready intensity target carried into session execution. */
export interface WorkoutSessionIntensity {
  readonly metric: string;
  readonly value: number;
  readonly label: string;
}

/**
 * A single executable set within a session exercise.
 * Prescription fields are copied from the preview; completion fields start unset.
 */
export interface WorkoutSessionSet {
  readonly id: string;
  readonly order: number;
  readonly setType: string;
  readonly setTypeLabel: string;
  readonly targetReps: WorkoutSessionReps;
  readonly intensity: WorkoutSessionIntensity | null;
  /** Rest timer duration after this set, in seconds. */
  readonly restSeconds: number | null;
  /** Prescription notes from the program (read-only guidance). */
  readonly prescriptionNotes: string | null;
  /** Athlete notes placeholder — null until the user fills it in. */
  readonly notes: string | null;
  readonly completed: boolean;
  readonly completedReps: number | null;
  readonly completedLoad: number | null;
}

/** An ordered exercise slot within an executable workout session. */
export interface WorkoutSessionExercise {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly sets: readonly WorkoutSessionSet[];
  /** Athlete notes placeholder — null until the user fills it in. */
  readonly notes: string | null;
  readonly completed: boolean;
  readonly skipped: boolean;
  /** Progression scheme summary referenced by this exercise, if any. */
  readonly progressionReference: string | null;
  readonly supersetGroup: string | null;
}

/** Program progression scheme referenced by one or more session exercises. */
export interface WorkoutSessionProgressionReference {
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
 * Immutable, UI-ready executable workout session projected from a preview day.
 * Contains only session-execution data — no engine types, planning, or persistence.
 */
export interface WorkoutSession {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly status: WorkoutSessionStatus;
  readonly dayId: string;
  readonly dayIndex: number;
  readonly programTitle: string;
  readonly goalLabel: string;
  readonly primaryFocus: readonly string[];
  readonly exercises: readonly WorkoutSessionExercise[];
  readonly progressionReferences: readonly WorkoutSessionProgressionReference[];
  /** Session-level athlete notes placeholder — null until the user fills it in. */
  readonly notes: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

/**
 * Application-layer session adapter: maps a `WorkoutProgramPreview` day into an
 * immutable UI-ready `WorkoutSession` ready for execution.
 *
 * Contains no planning, scoring, constraint, or progression logic. Does not
 * depend on React, UI components, persistence, AI, networking, or the Training
 * Engine. Depends only on presentation preview models.
 */
export class WorkoutSessionBuilder {
  /**
   * Project a selected training day from a program preview into an executable session.
   *
   * @param preview - Full program preview (context + progression catalogue).
   * @param day - Selected training day from `preview.weeklySchedule.days`.
   * @throws If `day` is not part of `preview`, or if `day` is a rest day.
   */
  build(preview: WorkoutProgramPreview, day: WorkoutPreviewDay): WorkoutSession {
    const previewDay = preview.weeklySchedule.days.find((candidate) => candidate.id === day.id);
    if (previewDay === undefined) {
      throw new Error(
        `Selected day "${day.id}" is not part of preview "${preview.title}".`,
      );
    }
    if (previewDay.isRestDay) {
      throw new Error(
        `Cannot build a workout session from rest day "${previewDay.name}" (${previewDay.id}).`,
      );
    }

    const orderedExercises = [...previewDay.exercises].sort((a, b) => a.order - b.order);
    const exercises = Object.freeze(
      orderedExercises.map((exercise) => this.toSessionExercise(exercise)),
    );

    const progressionReferences = Object.freeze(
      resolveProgressionReferences(preview.progressionSummary, exercises),
    );

    return Object.freeze({
      id: `session:${previewDay.id}`,
      title: previewDay.name,
      subtitle: buildSubtitle(preview, previewDay),
      status: "ready" as const,
      dayId: previewDay.id,
      dayIndex: previewDay.dayIndex,
      programTitle: preview.title,
      goalLabel: preview.goalLabel,
      primaryFocus: Object.freeze([...previewDay.primaryFocus]),
      exercises,
      progressionReferences,
      notes: null,
      startedAt: null,
      completedAt: null,
    });
  }

  private toSessionExercise(exercise: WorkoutPreviewExercise): WorkoutSessionExercise {
    return Object.freeze({
      id: exercise.id,
      name: exercise.name,
      order: exercise.order,
      sets: Object.freeze(exercise.sets.map((set, index) => this.toSessionSet(set, index))),
      notes: null,
      completed: false,
      skipped: false,
      progressionReference: exercise.progressionSummary,
      supersetGroup: exercise.supersetGroup,
    });
  }

  private toSessionSet(set: WorkoutPreviewSet, order: number): WorkoutSessionSet {
    return Object.freeze({
      id: set.id,
      order,
      setType: set.setType,
      setTypeLabel: set.setTypeLabel,
      targetReps: toSessionReps(set.reps),
      intensity: set.intensity === null ? null : toSessionIntensity(set.intensity),
      restSeconds: set.restSeconds,
      prescriptionNotes: set.notes,
      notes: null,
      completed: false,
      completedReps: null,
      completedLoad: null,
    });
  }
}

function toSessionReps(reps: WorkoutPreviewReps): WorkoutSessionReps {
  return Object.freeze({
    min: reps.min,
    max: reps.max,
    label: reps.label,
  });
}

function toSessionIntensity(intensity: WorkoutPreviewIntensity): WorkoutSessionIntensity {
  return Object.freeze({
    metric: intensity.metric,
    value: intensity.value,
    label: intensity.label,
  });
}

function buildSubtitle(preview: WorkoutProgramPreview, day: WorkoutPreviewDay): string {
  const focus =
    day.primaryFocus.length > 0 ? day.primaryFocus.join(", ") : preview.goalLabel;
  return `${preview.title} · ${focus}`;
}

/**
 * Collect program progression summaries referenced by the session's exercises.
 * Matching is by summary text because preview exercises only carry the summary string.
 */
function resolveProgressionReferences(
  catalogue: readonly WorkoutPreviewProgressionSummary[],
  exercises: readonly WorkoutSessionExercise[],
): readonly WorkoutSessionProgressionReference[] {
  const referencedSummaries = new Set(
    exercises
      .map((exercise) => exercise.progressionReference)
      .filter((summary): summary is string => summary !== null && summary.length > 0),
  );

  if (referencedSummaries.size === 0) {
    return Object.freeze([]);
  }

  const matched = catalogue
    .filter((entry) => referencedSummaries.has(entry.summary))
    .map((entry) => toProgressionReference(entry));

  // If catalogue entries do not match (e.g. free-form exercise summaries),
  // still surface the referenced strings as lightweight progression references.
  if (matched.length === 0) {
    return Object.freeze(
      [...referencedSummaries].map((summary, index) =>
        Object.freeze({
          id: `progression-ref:${index}`,
          model: "unknown",
          modelLabel: "Progression",
          summary,
          incrementLabel: null,
          cycleLengthWeeks: null,
          deloadFrequencyWeeks: null,
          description: null,
        }),
      ),
    );
  }

  return Object.freeze(matched);
}

function toProgressionReference(
  entry: WorkoutPreviewProgressionSummary,
): WorkoutSessionProgressionReference {
  return Object.freeze({
    id: entry.id,
    model: entry.model,
    modelLabel: entry.modelLabel,
    summary: entry.summary,
    incrementLabel: entry.incrementLabel,
    cycleLengthWeeks: entry.cycleLengthWeeks,
    deloadFrequencyWeeks: entry.deloadFrequencyWeeks,
    description: entry.description,
  });
}
