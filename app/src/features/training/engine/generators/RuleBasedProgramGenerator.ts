import { ExerciseCategory } from "../../enums/ExerciseCategory";
import { MuscleGroup } from "../../enums/MuscleGroup";
import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { TrainingDay } from "../../models/TrainingDay";
import type { TrainingExercise } from "../../models/TrainingExercise";
import type { TrainingProgram } from "../../models/TrainingProgram";
import type { TrainingSplit } from "../../models/TrainingSplit";
import type { ExerciseId, TrainingDayId, TrainingExerciseId, TrainingProgramId, TrainingSplitId } from "../../types/ids";
import { ConstraintEngine } from "../constraints/ConstraintEngine";
import type { ConstraintEvaluator } from "../constraints/contracts/ConstraintEvaluator";
import type { ConstraintContext } from "../constraints/models/ConstraintContext";
import type {
  GeneratedTrainingProgram,
  ProgramGenerationRequest,
  ProgramGenerator,
  ProgramGeneratorPlanners,
} from "../contracts/ProgramGenerator";
import type { ExerciseSelectionCriteria, SelectedExercise } from "../contracts/ExerciseSelector";
import type { FrequencyPlanningResult } from "../contracts/FrequencyPlanner";
import type { TrainingDayBlueprint } from "../contracts/SplitPlanner";
import type { ExerciseVolumeAssignment, MuscleGroupVolumeTarget } from "../contracts/VolumePlanner";
import type { ProgressionPlanningResult } from "../contracts/ProgressionPlanner";

/**
 * Minimum and maximum number of exercise slots a single non-rest training
 * day offers to the `ExerciseSelector`. This is a structural capacity
 * limit — "how many slots exist to fill" — not a programming decision:
 * *which* exercises fill those slots, and how well they fit the goal,
 * experience level, or muscle target, is decided entirely by the injected
 * `ExerciseSelector`'s own eligibility rules and scoring strategy.
 */
export interface ExerciseSlotBudget {
  readonly min: number;
  readonly max: number;
}

/** Default exercise slot budget for a single non-rest training day. */
const DEFAULT_EXERCISE_SLOT_BUDGET: ExerciseSlotBudget = { min: 3, max: 6 };

/**
 * Muscle groups this generator asks `FrequencyPlanner` and `ExerciseSelector`
 * to cover across a program, in the absence of any per-request muscle
 * targeting on `ProgramGenerationRequest`. `MuscleGroup.FullBody` is
 * excluded: it is a tag for exercises that recruit broadly (e.g. burpees),
 * not an individually trainable target with its own weekly frequency.
 * Deliberately just the full catalogue vocabulary rather than a curated or
 * goal-weighted subset — *how much* attention each of these gets is
 * `FrequencyPlanner`'s decision, not this generator's.
 */
const DEFAULT_TARGET_MUSCLE_GROUPS: readonly MuscleGroup[] = Object.values(MuscleGroup).filter(
  (muscleGroup) => muscleGroup !== MuscleGroup.FullBody,
);

/**
 * Sets-per-session used to translate `FrequencyPlanner`'s per-muscle
 * `sessionsPerWeek` into the `MuscleGroupVolumeTarget`s `VolumePlanner`
 * requires. Applied identically to every muscle group and session,
 * regardless of goal, experience level, or priority: those distinctions
 * already live inside the injected `VolumePlanner` (via its allocation and
 * set-scheme strategies), so this constant only bridges two contract shapes
 * — it makes no programming decision of its own. No planner currently owns
 * "how many sets per session should a muscle target get"; this is a
 * placeholder pending a dedicated volume-target planner.
 */
const DEFAULT_SETS_PER_SESSION_FOR_TARGETED_MUSCLE = 3;

/**
 * Deterministic, rule-based implementation of `ProgramGenerator`.
 *
 * This class is orchestration only: it never scores, ranks, filters, or
 * decides anything about training itself. Every actual programming
 * decision — frequency, split shape, exercise choice, volume, and
 * progression — is delegated to the `ProgramGeneratorPlanners` supplied to
 * `generateProgram` (fixed by the unmodified `ProgramGenerator` contract) or
 * to the `ConstraintEvaluator` injected through the constructor. What is
 * left, and all this class does, is:
 *
 * 1. Resolve the exercise catalogue for this request — `exerciseCatalogue`
 *    on `ProgramGenerationRequest` is already the resolved output of an
 *    `ExerciseCatalog` (its query methods are `Promise`-based, while
 *    `generateProgram` is synchronous per the unmodified `ProgramGenerator`
 *    contract, so resolution happens upstream; this class only consumes it).
 * 2. Filter that catalogue through the injected `ConstraintEvaluator`
 *    (`ConstraintEngine` by default) so only exercises the athlete can
 *    actually perform, and hasn't excluded, reach selection.
 * 3. Ask `FrequencyPlanner` how often each muscle group should be trained.
 * 4. Ask `SplitPlanner` how to lay out the microcycle's days from that
 *    frequency plan.
 * 5. For every non-rest day, ask `ExerciseSelector` to fill its slots from
 *    the constraint-filtered catalogue, targeting that day's blueprinted
 *    muscle focus.
 * 6. Ask `VolumePlanner` to turn each day's selections into concrete set
 *    prescriptions.
 * 7. Ask `ProgressionPlanner`, once per distinct exercise used anywhere in
 *    the program, how that exercise should progress over its duration.
 *
 * Every dependency — the constraint evaluator, the muscle-group scope, the
 * per-day exercise slot budget, and the volume bridging constant — is
 * supplied through the constructor with a deterministic default rather
 * than hard-coded (Dependency Inversion, Open/Closed): none of them encode
 * a goal- or experience-specific rule, so swapping any of them, or the
 * planners themselves, never requires touching this class. There is no
 * randomness, persistence, networking, AI, or UI concern anywhere in this
 * pipeline: identical inputs and planners always produce an identical,
 * fully immutable `GeneratedTrainingProgram`.
 */
export class RuleBasedProgramGenerator implements ProgramGenerator {
  private readonly constraintEvaluator: ConstraintEvaluator;
  private readonly targetMuscleGroups: readonly MuscleGroup[];
  private readonly exerciseSlotBudget: ExerciseSlotBudget;
  private readonly setsPerSessionForTargetedMuscle: number;

  constructor(
    constraintEvaluator: ConstraintEvaluator = new ConstraintEngine(),
    targetMuscleGroups: readonly MuscleGroup[] = DEFAULT_TARGET_MUSCLE_GROUPS,
    exerciseSlotBudget: ExerciseSlotBudget = DEFAULT_EXERCISE_SLOT_BUDGET,
    setsPerSessionForTargetedMuscle: number = DEFAULT_SETS_PER_SESSION_FOR_TARGETED_MUSCLE,
  ) {
    this.constraintEvaluator = constraintEvaluator;
    this.targetMuscleGroups = targetMuscleGroups;
    this.exerciseSlotBudget = exerciseSlotBudget;
    this.setsPerSessionForTargetedMuscle = setsPerSessionForTargetedMuscle;
  }

  generateProgram(request: ProgramGenerationRequest, planners: ProgramGeneratorPlanners): GeneratedTrainingProgram {
    const exerciseLookup = this.buildExerciseLookup(request.exerciseCatalogue);
    const eligibleCatalogue = this.filterByConstraints(request, exerciseLookup);

    const frequencyPlan = planners.frequencyPlanner.planFrequency({
      goal: request.goal,
      experienceLevel: request.experienceLevel,
      availableDaysPerWeek: request.availableDaysPerWeek,
      targetMuscleGroups: this.targetMuscleGroups,
    });

    const splitPlan = planners.splitPlanner.planSplit({
      goal: request.goal,
      experienceLevel: request.experienceLevel,
      frequencyPlan,
      preferredSplitType: request.preferredSplitType,
    });

    const slug = this.slugify(request.name);
    const programId = `program:${slug}` as TrainingProgramId;
    const splitId = `split:${slug}` as TrainingSplitId;

    const exerciseIdsInProgram = new Set<ExerciseId>();
    const days = splitPlan.days.map((dayBlueprint) =>
      this.buildTrainingDay(
        dayBlueprint,
        splitId,
        request,
        planners,
        frequencyPlan,
        eligibleCatalogue,
        exerciseIdsInProgram,
      ),
    );

    const progressionByExercise = this.planProgressions(exerciseIdsInProgram, exerciseLookup, request, planners);
    const finishedDays = days.map((day) => this.withProgressionSchemes(day, progressionByExercise));

    const split: TrainingSplit = {
      id: splitId,
      name: request.name,
      type: splitPlan.splitType,
      cycleLengthDays: splitPlan.cycleLengthDays,
      days: finishedDays,
    };

    const program: TrainingProgram = {
      id: programId,
      name: request.name,
      description: request.description,
      goal: request.goal,
      experienceLevel: request.experienceLevel,
      durationWeeks: request.durationWeeks,
      splitId: split.id,
      defaultProgressionSchemeId: null,
      tags: request.tags,
    };

    return {
      program,
      split,
      progressionSchemes: Array.from(progressionByExercise.values()).map((result) => result.progressionScheme),
    };
  }

  private buildExerciseLookup(
    catalogue: readonly ExerciseDefinition[],
  ): ReadonlyMap<ExerciseId, ExerciseDefinition> {
    return new Map(catalogue.map((exercise) => [exercise.id, exercise]));
  }

  /** Delegates every keep/reject decision to the injected `ConstraintEvaluator`. */
  private filterByConstraints(
    request: ProgramGenerationRequest,
    exerciseLookup: ReadonlyMap<ExerciseId, ExerciseDefinition>,
  ): readonly ExerciseDefinition[] {
    return Array.from(exerciseLookup.values()).filter((exercise) => {
      const context: ConstraintContext = {
        exercise,
        availableEquipment: request.availableEquipment,
        excludedExerciseIds: [],
        targetMuscleGroups: this.targetMuscleGroups,
      };
      return this.constraintEvaluator.evaluate(context).allowed;
    });
  }

  private buildTrainingDay(
    dayBlueprint: TrainingDayBlueprint,
    splitId: TrainingSplitId,
    request: ProgramGenerationRequest,
    planners: ProgramGeneratorPlanners,
    frequencyPlan: FrequencyPlanningResult,
    eligibleCatalogue: readonly ExerciseDefinition[],
    exerciseIdsInProgram: Set<ExerciseId>,
  ): TrainingDay {
    const dayId = this.dayId(splitId, dayBlueprint.dayIndex);

    if (dayBlueprint.isRestDay) {
      return {
        id: dayId,
        dayIndex: dayBlueprint.dayIndex,
        name: dayBlueprint.name,
        isRestDay: true,
        primaryFocus: dayBlueprint.primaryFocus,
        exercises: [],
      };
    }

    const selectionCriteria: ExerciseSelectionCriteria = {
      goal: request.goal,
      experienceLevel: request.experienceLevel,
      targetMuscleGroups: dayBlueprint.primaryFocus,
      requiredMovementPatterns: [],
      preferredCategories: [],
      availableEquipment: request.availableEquipment,
      excludedExerciseIds: [],
      minExercises: this.exerciseSlotBudget.min,
      maxExercises: this.exerciseSlotBudget.max,
    };
    const { selections } = planners.exerciseSelector.selectExercises(eligibleCatalogue, selectionCriteria);
    selections.forEach((selected) => exerciseIdsInProgram.add(selected.exerciseId));

    const volumeTargets = this.buildVolumeTargets(dayBlueprint.primaryFocus, frequencyPlan);
    const { assignments } = planners.volumePlanner.planVolume({
      goal: request.goal,
      experienceLevel: request.experienceLevel,
      volumeTargets,
      selectedExercises: selections,
    });
    const assignmentByExercise = new Map(assignments.map((assignment) => [assignment.exerciseId, assignment]));

    return {
      id: dayId,
      dayIndex: dayBlueprint.dayIndex,
      name: dayBlueprint.name,
      isRestDay: false,
      primaryFocus: dayBlueprint.primaryFocus,
      exercises: selections.map((selected) =>
        this.toTrainingExercise(dayId, selected, assignmentByExercise.get(selected.exerciseId)),
      ),
    };
  }

  private toTrainingExercise(
    dayId: TrainingDayId,
    selected: SelectedExercise,
    assignment: ExerciseVolumeAssignment | undefined,
  ): TrainingExercise {
    return {
      id: this.trainingExerciseId(dayId, selected.order),
      exerciseId: selected.exerciseId,
      order: selected.order,
      setPrescriptions: assignment?.setPrescriptions ?? [],
      progressionSchemeId: null,
      supersetGroup: null,
    };
  }

  /**
   * Bridges `FrequencyPlanner`'s per-muscle `sessionsPerWeek` into the
   * `MuscleGroupVolumeTarget`s `VolumePlanner` requires. `sessionsPerWeek`
   * is `FrequencyPlanner`'s decision; `setsPerSession` is the injected,
   * goal-agnostic bridging constant described on
   * `setsPerSessionForTargetedMuscle`.
   */
  private buildVolumeTargets(
    targetMuscleGroups: readonly MuscleGroup[],
    frequencyPlan: FrequencyPlanningResult,
  ): readonly MuscleGroupVolumeTarget[] {
    const sessionsPerWeekByMuscle = new Map(
      frequencyPlan.muscleGroupFrequencies.map((frequency) => [frequency.muscleGroup, frequency.sessionsPerWeek]),
    );

    return targetMuscleGroups.map((muscleGroup) => {
      const sessionsPerWeek = sessionsPerWeekByMuscle.get(muscleGroup) ?? 0;
      return {
        muscleGroup,
        setsPerSession: this.setsPerSessionForTargetedMuscle,
        weeklySets: this.setsPerSessionForTargetedMuscle * sessionsPerWeek,
      };
    });
  }

  /** Delegates to `ProgressionPlanner` once per distinct exercise used anywhere in the program. */
  private planProgressions(
    exerciseIds: ReadonlySet<ExerciseId>,
    exerciseLookup: ReadonlyMap<ExerciseId, ExerciseDefinition>,
    request: ProgramGenerationRequest,
    planners: ProgramGeneratorPlanners,
  ): ReadonlyMap<ExerciseId, ProgressionPlanningResult> {
    const progressionByExercise = new Map<ExerciseId, ProgressionPlanningResult>();

    for (const exerciseId of exerciseIds) {
      const exerciseCategory = exerciseLookup.get(exerciseId)?.category ?? ExerciseCategory.Accessory;
      const result = planners.progressionPlanner.planProgression({
        goal: request.goal,
        experienceLevel: request.experienceLevel,
        exerciseId,
        exerciseCategory,
        programDurationWeeks: request.durationWeeks,
      });
      progressionByExercise.set(exerciseId, result);
    }

    return progressionByExercise;
  }

  private withProgressionSchemes(
    day: TrainingDay,
    progressionByExercise: ReadonlyMap<ExerciseId, ProgressionPlanningResult>,
  ): TrainingDay {
    return {
      ...day,
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        progressionSchemeId: progressionByExercise.get(exercise.exerciseId)?.progressionScheme.id ?? null,
      })),
    };
  }

  private dayId(splitId: TrainingSplitId, dayIndex: number): TrainingDayId {
    return `${String(splitId)}::day-${dayIndex}` as TrainingDayId;
  }

  private trainingExerciseId(dayId: TrainingDayId, order: number): TrainingExerciseId {
    return `${String(dayId)}::exercise-${order}` as TrainingExerciseId;
  }

  /** Deterministic, human-readable id fragment derived from the program's name. */
  private slugify(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : "program";
  }
}
