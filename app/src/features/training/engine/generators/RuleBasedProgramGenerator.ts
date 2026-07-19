import { ExerciseCategory } from "../../enums/ExerciseCategory";
import { MuscleGroup } from "../../enums/MuscleGroup";
import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { TrainingDay } from "../../models/TrainingDay";
import type { TrainingExercise } from "../../models/TrainingExercise";
import type { TrainingProgram } from "../../models/TrainingProgram";
import type { TrainingSplit } from "../../models/TrainingSplit";
import type { ExerciseId, TrainingDayId, TrainingSplitId } from "../../types/ids";
import { ConstraintEngine } from "../constraints/ConstraintEngine";
import type { ConstraintEvaluator } from "../constraints/contracts/ConstraintEvaluator";
import type { ConstraintContext } from "../constraints/models/ConstraintContext";
import { createExerciseLookup } from "../context/ExerciseLookup";
import type { PlanningContext } from "../context/PlanningContext";
import { DeterministicIdGenerator } from "../identity/IdGenerator";
import type { IdGenerator } from "../identity/IdGenerator";
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
 * 1. Build this pass's `PlanningContext` once from the incoming
 *    `ProgramGenerationRequest` — the single canonical snapshot of
 *    `goal`, `experienceLevel`, `durationWeeks`, `availableDaysPerWeek`,
 *    `availableEquipment`, `preferredSplitType`, and `exerciseLookup`
 *    that every planner below receives verbatim instead of each
 *    redeclaring, or re-reading off the request, the same handful of
 *    fields. `exerciseLookup` is built exactly once here, via
 *    `createExerciseLookup`, from `exerciseCatalogue` on
 *    `ProgramGenerationRequest` (already the resolved output of an
 *    `ExerciseCatalog` — its query methods are `Promise`-based, while
 *    `generateProgram` is synchronous per the unmodified `ProgramGenerator`
 *    contract, so resolution happens upstream; this class only consumes
 *    it) and is the single canonical `ExerciseId` -> `ExerciseDefinition`
 *    lookup every planner in this pipeline reads instead of building its
 *    own.
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
 * per-day exercise slot budget, the volume bridging constant, and the id
 * generator — is supplied through the constructor with a deterministic
 * default rather than hard-coded (Dependency Inversion, Open/Closed): none
 * of them encode a goal- or experience-specific rule, so swapping any of
 * them, or the planners themselves, never requires touching this class.
 * There is no randomness, persistence, networking, AI, or UI concern
 * anywhere in this pipeline: identical inputs and planners always produce
 * an identical, fully immutable `GeneratedTrainingProgram`.
 */
export class RuleBasedProgramGenerator implements ProgramGenerator {
  private readonly constraintEvaluator: ConstraintEvaluator;
  private readonly targetMuscleGroups: readonly MuscleGroup[];
  private readonly exerciseSlotBudget: ExerciseSlotBudget;
  private readonly setsPerSessionForTargetedMuscle: number;
  private readonly idGenerator: IdGenerator;

  constructor(
    constraintEvaluator: ConstraintEvaluator = new ConstraintEngine(),
    targetMuscleGroups: readonly MuscleGroup[] = DEFAULT_TARGET_MUSCLE_GROUPS,
    exerciseSlotBudget: ExerciseSlotBudget = DEFAULT_EXERCISE_SLOT_BUDGET,
    setsPerSessionForTargetedMuscle: number = DEFAULT_SETS_PER_SESSION_FOR_TARGETED_MUSCLE,
    idGenerator: IdGenerator = new DeterministicIdGenerator(),
  ) {
    this.constraintEvaluator = constraintEvaluator;
    this.targetMuscleGroups = targetMuscleGroups;
    this.exerciseSlotBudget = exerciseSlotBudget;
    this.setsPerSessionForTargetedMuscle = setsPerSessionForTargetedMuscle;
    this.idGenerator = idGenerator;
  }

  generateProgram(request: ProgramGenerationRequest, planners: ProgramGeneratorPlanners): GeneratedTrainingProgram {
    const planningContext = this.buildPlanningContext(request);
    const eligibleCatalogue = this.filterByConstraints(planningContext);

    const frequencyPlan = planners.frequencyPlanner.planFrequency({
      planningContext,
      targetMuscleGroups: this.targetMuscleGroups,
    });

    const splitPlan = planners.splitPlanner.planSplit({
      planningContext,
      frequencyPlan,
    });

    const programId = this.idGenerator.nextProgramId(request.name);
    const splitId = this.idGenerator.nextSplitId(request.name);

    const exerciseIdsInProgram = new Set<ExerciseId>();
    const days = splitPlan.days.map((dayBlueprint) =>
      this.buildTrainingDay(
        dayBlueprint,
        splitId,
        planningContext,
        planners,
        frequencyPlan,
        eligibleCatalogue,
        exerciseIdsInProgram,
      ),
    );

    const progressionByExercise = this.planProgressions(exerciseIdsInProgram, planningContext, planners);
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
      goal: planningContext.goal,
      experienceLevel: planningContext.experienceLevel,
      durationWeeks: planningContext.durationWeeks,
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

  /**
   * Constructs this generation pass's single `PlanningContext` from the
   * incoming `ProgramGenerationRequest`. Called exactly once per
   * `generateProgram` invocation; the resulting instance is then threaded,
   * unchanged, through every planner below instead of each one re-reading
   * (or redeclaring) `goal`, `experienceLevel`, `availableEquipment`,
   * `durationWeeks`, `availableDaysPerWeek`, and `preferredSplitType`
   * straight off the request.
   */
  private buildPlanningContext(request: ProgramGenerationRequest): PlanningContext {
    return {
      goal: request.goal,
      experienceLevel: request.experienceLevel,
      durationWeeks: request.durationWeeks,
      availableDaysPerWeek: request.availableDaysPerWeek,
      availableEquipment: request.availableEquipment,
      preferredSplitType: request.preferredSplitType,
      exerciseLookup: createExerciseLookup(request.exerciseCatalogue),
      excludedExerciseIds: request.excludedExerciseIds,
    };
  }

  /** Delegates every keep/reject decision to the injected `ConstraintEvaluator`. */
  private filterByConstraints(planningContext: PlanningContext): readonly ExerciseDefinition[] {
    return planningContext.exerciseLookup.values().filter((exercise) => {
      const context: ConstraintContext = {
        exercise,
        availableEquipment: planningContext.availableEquipment,
        excludedExerciseIds: planningContext.excludedExerciseIds,
        targetMuscleGroups: this.targetMuscleGroups,
      };
      return this.constraintEvaluator.evaluate(context).allowed;
    });
  }

  private buildTrainingDay(
    dayBlueprint: TrainingDayBlueprint,
    splitId: TrainingSplitId,
    planningContext: PlanningContext,
    planners: ProgramGeneratorPlanners,
    frequencyPlan: FrequencyPlanningResult,
    eligibleCatalogue: readonly ExerciseDefinition[],
    exerciseIdsInProgram: Set<ExerciseId>,
  ): TrainingDay {
    const dayId = this.idGenerator.nextDayId(splitId, dayBlueprint.dayIndex);

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
      goal: planningContext.goal,
      experienceLevel: planningContext.experienceLevel,
      targetMuscleGroups: dayBlueprint.primaryFocus,
      requiredMovementPatterns: [],
      preferredCategories: [],
      availableEquipment: planningContext.availableEquipment,
      excludedExerciseIds: planningContext.excludedExerciseIds,
      minExercises: this.exerciseSlotBudget.min,
      maxExercises: this.exerciseSlotBudget.max,
    };
    const { selections } = planners.exerciseSelector.selectExercises(eligibleCatalogue, selectionCriteria);
    selections.forEach((selected) => exerciseIdsInProgram.add(selected.exerciseId));

    const volumeTargets = this.buildVolumeTargets(dayBlueprint.primaryFocus, frequencyPlan);
    const { assignments } = planners.volumePlanner.planVolume({
      planningContext,
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
      id: this.idGenerator.nextExerciseId(dayId, selected.order),
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
    planningContext: PlanningContext,
    planners: ProgramGeneratorPlanners,
  ): ReadonlyMap<ExerciseId, ProgressionPlanningResult> {
    const progressionByExercise = new Map<ExerciseId, ProgressionPlanningResult>();

    for (const exerciseId of exerciseIds) {
      const exerciseCategory = planningContext.exerciseLookup.get(exerciseId)?.category ?? ExerciseCategory.Accessory;
      const result = planners.progressionPlanner.planProgression({
        planningContext,
        exerciseId,
        exerciseCategory,
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

}
