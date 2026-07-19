import type {
  ExerciseId,
  ProgressionSchemeId,
  SetPrescriptionId,
  TrainingDayId,
  TrainingExerciseId,
  TrainingProgramId,
  TrainingSplitId,
} from "../../types/ids";

/**
 * Mints identities for every entity the Training Engine creates while
 * generating a program: `TrainingProgram`, `TrainingSplit`, `TrainingDay`,
 * `TrainingExercise` (a day's exercise slot), `ProgressionScheme`, and
 * `SetPrescription`.
 *
 * This is a pure naming contract, not a persistence or uniqueness
 * guarantee: nothing here reserves, stores, or checks an id against any
 * other program, run, or storage layer. Each method derives its id solely
 * from the arguments it is given, so callers stay in control of *what*
 * identifies an entity (a program's name, a split's id plus a day index,
 * and so on) while this contract owns *how* that information is turned
 * into an `Id`. Kept as its own abstraction — rather than left as string
 * concatenation inline in `RuleBasedProgramGenerator` and the planners
 * that mint ids — so identity generation can be swapped (Dependency
 * Inversion) without touching planning logic, and so a future strategy
 * (e.g. one namespaced for persistence, sync, or cloud storage) can be
 * introduced later (Open/Closed) without any caller changing how it asks
 * for an id.
 */
export interface IdGenerator {
  /** Mints the id for a newly generated `TrainingProgram`, from its (human-supplied) name. */
  nextProgramId(name: string): TrainingProgramId;

  /** Mints the id for a newly generated `TrainingSplit`, from its owning program's name. */
  nextSplitId(name: string): TrainingSplitId;

  /** Mints the id for one `TrainingDay` within a split, from the split's id and the day's index. */
  nextDayId(splitId: TrainingSplitId, dayIndex: number): TrainingDayId;

  /** Mints the id for one `TrainingExercise` slot within a day, from the day's id and the slot's order. */
  nextExerciseId(dayId: TrainingDayId, order: number): TrainingExerciseId;

  /** Mints the id for the `ProgressionScheme` governing a given catalogue exercise. */
  nextProgressionSchemeId(exerciseId: ExerciseId): ProgressionSchemeId;

  /** Mints the id for one `SetPrescription` within an exercise's volume plan, from the exercise's id and the prescription's index. */
  nextSetPrescriptionId(exerciseId: ExerciseId, index: number): SetPrescriptionId;
}

/**
 * Default, purely deterministic `IdGenerator`.
 *
 * Every id is derived only from its inputs — a program/split name, or
 * another entity's already-minted id plus a positional index — never from
 * internal counters, timestamps, or any source of randomness. Calling any
 * method with the same arguments, in the same run or a different one,
 * always yields the same id, which is what lets
 * `RuleBasedProgramGenerator` (and the planners that mint sub-entity ids)
 * stay fully deterministic: identical `ProgramGenerationRequest`s always
 * produce identical output.
 *
 * Ids are namespaced, human-readable strings rather than opaque tokens
 * (e.g. UUIDs) so they stay easy to hand-verify in tests and logs; this is
 * an implementation choice of this default, not something the
 * `IdGenerator` contract requires. A program's and its split's ids are
 * both derived from the same slugified name, mirroring how a program and
 * its split are created together by the same generation pass.
 */
export class DeterministicIdGenerator implements IdGenerator {
  nextProgramId(name: string): TrainingProgramId {
    return `program:${this.slugify(name)}` as TrainingProgramId;
  }

  nextSplitId(name: string): TrainingSplitId {
    return `split:${this.slugify(name)}` as TrainingSplitId;
  }

  nextDayId(splitId: TrainingSplitId, dayIndex: number): TrainingDayId {
    return `${String(splitId)}::day-${dayIndex}` as TrainingDayId;
  }

  nextExerciseId(dayId: TrainingDayId, order: number): TrainingExerciseId {
    return `${String(dayId)}::exercise-${order}` as TrainingExerciseId;
  }

  nextProgressionSchemeId(exerciseId: ExerciseId): ProgressionSchemeId {
    return `${String(exerciseId)}::progression` as ProgressionSchemeId;
  }

  nextSetPrescriptionId(exerciseId: ExerciseId, index: number): SetPrescriptionId {
    return `${String(exerciseId)}::set-${index}` as SetPrescriptionId;
  }

  /** Deterministic, human-readable id fragment derived from a program's name. */
  private slugify(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : "program";
  }
}
