import { ExerciseCategory } from "../../enums/ExerciseCategory";
import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { MovementPattern } from "../../enums/MovementPattern";
import { ProgressionModel } from "../../enums/ProgressionModel";
import { TrainingGoal } from "../../enums/TrainingGoal";
import { WeightUnit } from "../../enums/WeightUnit";
import type { ProgressionScheme } from "../../models/ProgressionScheme";
import type { ExerciseId, ProgressionSchemeId } from "../../types/ids";
import type {
  ProgressionPlanner,
  ProgressionPlanningInput,
  ProgressionPlanningResult,
} from "../contracts/ProgressionPlanner";

/**
 * Everything a progression decision actually depends on, resolved once up
 * front from `ProgressionPlanningInput` plus a catalogue lookup. Kept as
 * its own type — rather than passing `ProgressionPlanningInput` straight
 * through — because `movementPattern` is not part of that contract (it
 * lives on `ExerciseDefinition`) yet every strategy below needs it
 * alongside goal, experience, and category to make its call.
 */
export interface ExerciseProgressionContext {
  readonly goal: TrainingGoal;
  readonly experienceLevel: ExperienceLevel;
  readonly exerciseCategory: ExerciseCategory;
  readonly movementPattern: MovementPattern | null;
  readonly programDurationWeeks: number;
}

/** Concrete load-increment parameters for a `ProgressionScheme`. */
export interface ProgressionIncrement {
  readonly incrementValue: number | null;
  readonly incrementUnit: WeightUnit | null;
}

/**
 * Decides *which* `ProgressionModel` governs an exercise. The single
 * broadest decision in the pipeline — every later strategy receives the
 * chosen model as an input rather than re-deriving it, so goal/experience/
 * category/movement-pattern reasoning about "which philosophy fits" stays
 * in exactly one place.
 */
export interface ProgressionModelStrategy {
  selectModel(context: ExerciseProgressionContext): ProgressionModel;
}

/**
 * Decides the flat load jump (value + unit) applied whenever the chosen
 * model calls for one. Kept separate from model selection so the "how
 * much weight" question — driven mainly by movement pattern and
 * experience — can be retuned without touching "which model" logic at
 * all.
 */
export interface IncrementStrategy {
  resolveIncrement(context: ExerciseProgressionContext, model: ProgressionModel): ProgressionIncrement;
}

/**
 * Decides how often, in weeks, planned fatigue-management deloads should
 * recur — or `null` when the program is too short, or the athlete too
 * inexperienced, to warrant one.
 */
export interface DeloadCadenceStrategy {
  resolveDeloadFrequencyWeeks(context: ExerciseProgressionContext, model: ProgressionModel): number | null;
}

/**
 * Decides the progression "limit" — the cycle length, in weeks, after
 * which the chosen model's current block/wave/rep-ceiling resets or is
 * expected to be reassessed. `null` signals a model with no fixed cycle
 * (e.g. autoregulation, or a static scheme with nothing to cycle).
 */
export interface ProgressionLimitStrategy {
  resolveCycleLengthWeeks(
    context: ExerciseProgressionContext,
    model: ProgressionModel,
    deloadFrequencyWeeks: number | null,
  ): number | null;
}

/** Categories whose stimulus is duration/output-based rather than external-load-based; no model here progresses them by adding weight. */
const CATEGORY_MODEL_OVERRIDE: Readonly<Partial<Record<ExerciseCategory, ProgressionModel>>> = {
  [ExerciseCategory.Cardio]: ProgressionModel.Static,
  [ExerciseCategory.Mobility]: ProgressionModel.Static,
};

/**
 * Movement patterns that are primarily skill- or stability-driven rather
 * than max-load-driven, so they favor progressing rep quality/volume
 * within a range over any periodized load scheme — regardless of what
 * goal or experience would otherwise select. Only consulted for athletes
 * past the beginner baseline (see `selectModel`), since beginners get the
 * simplest possible model no matter the pattern.
 */
const MOVEMENT_PATTERN_MODEL_OVERRIDE: Readonly<Partial<Record<MovementPattern, ProgressionModel>>> = {
  [MovementPattern.Carry]: ProgressionModel.DoubleProgression,
  [MovementPattern.Rotation]: ProgressionModel.DoubleProgression,
};

/** Goals whose programming is organized around maximal barbell load, best served by a periodized block model once past the beginner stage. */
const GOAL_MODEL_OVERRIDE: Readonly<Partial<Record<TrainingGoal, ProgressionModel>>> = {
  [TrainingGoal.Powerlifting]: ProgressionModel.Block,
  [TrainingGoal.Strength]: ProgressionModel.Block,
  [TrainingGoal.Bodybuilding]: ProgressionModel.DoubleProgression,
  [TrainingGoal.Hypertrophy]: ProgressionModel.DoubleProgression,
  [TrainingGoal.Endurance]: ProgressionModel.DoubleProgression,
};

/** Hybrid strength/physique goals that, once an athlete can self-assess effort reliably, are best driven by RPE rather than a fixed percentage or block scheme. */
const ADVANCED_GOAL_MODEL_OVERRIDE: Readonly<Partial<Record<TrainingGoal, ProgressionModel>>> = {
  [TrainingGoal.Powerbuilding]: ProgressionModel.AutoregulatedRpe,
  [TrainingGoal.Hybrid]: ProgressionModel.AutoregulatedRpe,
};

/** Experience levels trusted to rate their own effort accurately enough for `ADVANCED_GOAL_MODEL_OVERRIDE` to apply. */
const RPE_RELIABLE_EXPERIENCE_LEVELS: ReadonlySet<ExperienceLevel> = new Set([
  ExperienceLevel.Advanced,
  ExperienceLevel.Elite,
]);

/** Baseline model once no override above applies, indexed purely by experience — the fallback every other rule narrows or replaces. */
const EXPERIENCE_BASE_MODEL: Readonly<Record<ExperienceLevel, ProgressionModel>> = {
  [ExperienceLevel.Beginner]: ProgressionModel.Linear,
  [ExperienceLevel.Intermediate]: ProgressionModel.DoubleProgression,
  [ExperienceLevel.Advanced]: ProgressionModel.Undulating,
  [ExperienceLevel.Elite]: ProgressionModel.Block,
};

/**
 * Default, purely deterministic progression-model selection.
 *
 * Resolves as a fixed-precedence waterfall so every one of the four
 * required inputs gets a say, from narrowest/most-certain rule to
 * broadest fallback:
 *
 * 1. Category override — cardio and mobility work is not progressed by
 *    adding external load in this model set, so it is always `Static`.
 * 2. Beginner baseline — novices always get `Linear`: the simplest model,
 *    and the one novice neuromuscular adaptation actually supports
 *    (near-every-session load increases), regardless of goal or pattern.
 * 3. Movement-pattern override — for everyone past the beginner stage,
 *    skill/stability patterns (carry, rotation) favor rep-based double
 *    progression over a periodized load model.
 * 4. Advanced-goal override — for athletes trusted to self-assess effort
 *    (advanced/elite), hybrid strength/physique goals move to
 *    autoregulated RPE.
 * 5. Goal override — for everyone past the beginner stage, heavy-strength
 *    goals move to block periodization and hypertrophy/endurance goals to
 *    double progression.
 * 6. Experience baseline — anything left (intermediate general fitness or
 *    powerbuilding/hybrid work not caught by rule 4, etc.) falls back to
 *    the experience level's default model.
 */
export class DefaultProgressionModelStrategy implements ProgressionModelStrategy {
  selectModel(context: ExerciseProgressionContext): ProgressionModel {
    const categoryOverride = CATEGORY_MODEL_OVERRIDE[context.exerciseCategory];
    if (categoryOverride) {
      return categoryOverride;
    }

    if (context.experienceLevel === ExperienceLevel.Beginner) {
      return ProgressionModel.Linear;
    }

    const patternOverride = context.movementPattern
      ? MOVEMENT_PATTERN_MODEL_OVERRIDE[context.movementPattern]
      : undefined;
    if (patternOverride) {
      return patternOverride;
    }

    if (RPE_RELIABLE_EXPERIENCE_LEVELS.has(context.experienceLevel)) {
      const advancedGoalOverride = ADVANCED_GOAL_MODEL_OVERRIDE[context.goal];
      if (advancedGoalOverride) {
        return advancedGoalOverride;
      }
    }

    const goalOverride = GOAL_MODEL_OVERRIDE[context.goal];
    if (goalOverride) {
      return goalOverride;
    }

    return EXPERIENCE_BASE_MODEL[context.experienceLevel];
  }
}

/**
 * Base load increment, in kilograms, for a movement pattern — bilateral
 * barbell patterns and loaded carries tolerate (and need) the largest
 * jumps to keep progressing; unilateral, single-joint, and vertical
 * pressing/pulling patterns are limited by smaller stabilizer musculature
 * and progress in finer steps.
 */
const MOVEMENT_PATTERN_BASE_INCREMENT_KG: Readonly<Record<MovementPattern, number>> = {
  [MovementPattern.Squat]: 2.5,
  [MovementPattern.Hinge]: 2.5,
  [MovementPattern.HorizontalPush]: 2.5,
  [MovementPattern.HorizontalPull]: 2.5,
  [MovementPattern.Carry]: 2.5,
  [MovementPattern.Lunge]: 2,
  [MovementPattern.VerticalPush]: 1.25,
  [MovementPattern.VerticalPull]: 1.25,
  [MovementPattern.Rotation]: 1.25,
  [MovementPattern.Isolation]: 1.25,
};

/** Fallback base increment, in kilograms, used when an exercise has no known movement pattern (e.g. not found in the injected catalogue). */
const CATEGORY_FALLBACK_INCREMENT_KG: Readonly<Record<ExerciseCategory, number>> = {
  [ExerciseCategory.Compound]: 2.5,
  [ExerciseCategory.Olympic]: 2.5,
  [ExerciseCategory.Isolation]: 1.25,
  [ExerciseCategory.Accessory]: 1.25,
  [ExerciseCategory.Plyometric]: 1.25,
  [ExerciseCategory.Cardio]: 0,
  [ExerciseCategory.Mobility]: 0,
};

/** Models whose progression is expressed as a discrete load jump; every other model progresses via reps, percentage tables, or feel instead. */
const INCREMENT_ELIGIBLE_MODELS: ReadonlySet<ProgressionModel> = new Set([
  ProgressionModel.Linear,
  ProgressionModel.DoubleProgression,
]);

/**
 * Advanced and elite athletes are closer to their genetic ceiling and
 * recover less rewardingly from large jumps, so their increments are
 * halved relative to the movement pattern's base value; beginners and
 * intermediates use the base value as-is.
 */
const EXPERIENCE_INCREMENT_MULTIPLIER: Readonly<Record<ExperienceLevel, number>> = {
  [ExperienceLevel.Beginner]: 1,
  [ExperienceLevel.Intermediate]: 1,
  [ExperienceLevel.Advanced]: 0.5,
  [ExperienceLevel.Elite]: 0.5,
};

/** Smallest real-world plate/microplate step increments are rounded to, so results are always loadable. */
const INCREMENT_ROUNDING_STEP_KG = 0.25;

/**
 * Default, purely deterministic increment resolution.
 *
 * Only models in `INCREMENT_ELIGIBLE_MODELS` receive a concrete
 * `incrementValue`/`incrementUnit` pair — a percentage-based, block,
 * undulating, autoregulated, or static scheme expresses its progression
 * some other way (a percentage table, a wave, RPE feel, or nothing at
 * all), so forcing a flat weight jump onto them would misrepresent how
 * they actually work.
 *
 * When eligible, the increment is the movement pattern's base jump (or
 * the category's fallback, when the exercise's pattern is unknown to the
 * injected catalogue), scaled by the athlete's experience multiplier and
 * rounded to the nearest loadable microplate step. `WeightUnit` is fixed
 * per strategy instance at construction time (defaulting to kilograms)
 * rather than per call, since a single program is expected to stay in one
 * unit system throughout.
 */
export class DefaultIncrementStrategy implements IncrementStrategy {
  private readonly unit: WeightUnit;

  constructor(unit: WeightUnit = WeightUnit.Kilograms) {
    this.unit = unit;
  }

  resolveIncrement(context: ExerciseProgressionContext, model: ProgressionModel): ProgressionIncrement {
    if (!INCREMENT_ELIGIBLE_MODELS.has(model)) {
      return { incrementValue: null, incrementUnit: null };
    }

    const base = context.movementPattern
      ? MOVEMENT_PATTERN_BASE_INCREMENT_KG[context.movementPattern]
      : CATEGORY_FALLBACK_INCREMENT_KG[context.exerciseCategory];

    if (base <= 0) {
      return { incrementValue: null, incrementUnit: null };
    }

    const scaled = base * EXPERIENCE_INCREMENT_MULTIPLIER[context.experienceLevel];
    const rounded = Math.round(scaled / INCREMENT_ROUNDING_STEP_KG) * INCREMENT_ROUNDING_STEP_KG;

    return { incrementValue: rounded, incrementUnit: this.unit };
  }
}

/** Categories with no programmed-load fatigue to manage here, mirroring `CATEGORY_MODEL_OVERRIDE`'s `Static` assignment. */
const DELOAD_EXEMPT_CATEGORIES: ReadonlySet<ExerciseCategory> = new Set([
  ExerciseCategory.Cardio,
  ExerciseCategory.Mobility,
]);

/**
 * Baseline deload cadence, in weeks, by experience level. Beginners train
 * at low absolute intensity relative to their ceiling and rarely
 * accumulate enough systemic fatigue to need a *programmed* deload; every
 * level past that needs one increasingly often as intensity and volume
 * tolerance shrink the gap to true recovery capacity.
 */
const EXPERIENCE_BASE_DELOAD_WEEKS: Readonly<Record<ExperienceLevel, number | null>> = {
  [ExperienceLevel.Beginner]: null,
  [ExperienceLevel.Intermediate]: 6,
  [ExperienceLevel.Advanced]: 5,
  [ExperienceLevel.Elite]: 4,
};

/** Goals whose typical intensity or fatigue profile shortens or lengthens the baseline cadence. */
const GOAL_DELOAD_ADJUSTMENT_WEEKS: Readonly<Partial<Record<TrainingGoal, number>>> = {
  [TrainingGoal.Powerlifting]: -1,
  [TrainingGoal.Strength]: -1,
  [TrainingGoal.Endurance]: 1,
};

/** A deload cadence shorter than this would recur more than once inside its own recovery window and is treated as noise, not signal. */
const MIN_DELOAD_FREQUENCY_WEEKS = 3;

/**
 * Default, purely deterministic deload-cadence resolution.
 *
 * Categories exempt from load-driven fatigue (mirroring the `Static`
 * category override in model selection) never get a deload. Otherwise the
 * experience baseline is nudged by the goal's fatigue profile, floored at
 * `MIN_DELOAD_FREQUENCY_WEEKS`, and finally suppressed (`null`) whenever
 * the program is too short to ever reach even one scheduled deload — a
 * cadence that never fires is not a cadence at all.
 */
export class DefaultDeloadCadenceStrategy implements DeloadCadenceStrategy {
  resolveDeloadFrequencyWeeks(context: ExerciseProgressionContext, _model: ProgressionModel): number | null {
    if (DELOAD_EXEMPT_CATEGORIES.has(context.exerciseCategory)) {
      return null;
    }

    const baseline = EXPERIENCE_BASE_DELOAD_WEEKS[context.experienceLevel];
    if (baseline === null) {
      return null;
    }

    const adjustment = GOAL_DELOAD_ADJUSTMENT_WEEKS[context.goal] ?? 0;
    const cadence = Math.max(MIN_DELOAD_FREQUENCY_WEEKS, baseline + adjustment);

    return cadence <= context.programDurationWeeks ? cadence : null;
  }
}

/**
 * Base cycle length, in weeks, intrinsic to each model — how long its
 * current block/wave/rep-ceiling runs before it resets or is due for
 * reassessment. Autoregulation and static schemes have no such cycle: an
 * RPE-driven scheme is reassessed every session by definition, and a
 * static scheme has nothing to cycle in the first place.
 */
const MODEL_BASE_CYCLE_LENGTH_WEEKS: Readonly<Record<ProgressionModel, number | null>> = {
  [ProgressionModel.Linear]: 12,
  [ProgressionModel.DoubleProgression]: 6,
  [ProgressionModel.PercentageBased]: 4,
  [ProgressionModel.Block]: 4,
  [ProgressionModel.Undulating]: 3,
  [ProgressionModel.AutoregulatedRpe]: null,
  [ProgressionModel.Static]: null,
};

/**
 * Default, purely deterministic progression-limit resolution.
 *
 * Starts from the chosen model's intrinsic base cycle length, then clamps
 * it so it can never claim a cycle longer than the program actually runs
 * — a cycle the program can't complete isn't a meaningful limit. Ignores
 * `deloadFrequencyWeeks` for the `null` short-circuit itself (a model
 * legitimately has no cycle regardless of deload cadence) but the
 * parameter is threaded through so a future evidence-based strategy can
 * choose to align cycle boundaries with deload timing without a contract
 * change.
 */
export class DefaultProgressionLimitStrategy implements ProgressionLimitStrategy {
  resolveCycleLengthWeeks(
    context: ExerciseProgressionContext,
    model: ProgressionModel,
    _deloadFrequencyWeeks: number | null,
  ): number | null {
    const base = MODEL_BASE_CYCLE_LENGTH_WEEKS[model];
    if (base === null || context.programDurationWeeks <= 0) {
      return null;
    }

    return Math.max(1, Math.min(base, context.programDurationWeeks));
  }
}

/** Human-readable label for each model, used only to build the scheme's `description`. */
const MODEL_LABEL: Readonly<Record<ProgressionModel, string>> = {
  [ProgressionModel.Linear]: "Linear progression",
  [ProgressionModel.DoubleProgression]: "Double progression",
  [ProgressionModel.PercentageBased]: "Percentage-based progression",
  [ProgressionModel.AutoregulatedRpe]: "Autoregulated (RPE-based) progression",
  [ProgressionModel.Undulating]: "Undulating periodization",
  [ProgressionModel.Block]: "Block periodization",
  [ProgressionModel.Static]: "Static prescription",
};

/**
 * Deterministic, rule-based implementation of `ProgressionPlanner`.
 *
 * Planning happens in three composed, independently swappable stages, all
 * supplied through the constructor rather than hard-coded (Open/Closed,
 * Dependency Inversion) so a future evidence-based progression model —
 * one driven by published periodization or autoregulation research — can
 * replace any single stage later without touching this class or any
 * caller that only knows about the `ProgressionPlanner` contract:
 *
 * 1. Model selection — a `ProgressionModelStrategy` picks the
 *    `ProgressionModel` from goal, experience level, exercise category,
 *    and movement pattern.
 * 2. Increment resolution — an `IncrementStrategy` decides the load jump
 *    (value + unit) the chosen model should apply, or `null` for models
 *    that do not progress via a flat weight increment.
 * 3. Deload cadence and progression limits — a `DeloadCadenceStrategy`
 *    and a `ProgressionLimitStrategy` independently decide, respectively,
 *    how often planned fatigue-management deloads recur and how long the
 *    model's current cycle runs before reassessment.
 *
 * `ProgressionPlanningInput` has no `movementPattern` field — it lives on
 * `ExerciseDefinition`, not on the planning contract — so movement
 * pattern is resolved from `input.planningContext.exerciseLookup`, the
 * single `ExerciseLookup` `RuleBasedProgramGenerator` builds once per
 * generation pass and threads through every planner via the shared
 * `PlanningContext` (see `ExerciseLookup`), exactly like
 * `RuleBasedVolumePlanner` resolves category and movement pattern from
 * the same shared lookup. `planProgression` itself only receives
 * `ProgressionPlanningInput`, as fixed by the `ProgressionPlanner`
 * contract, but that input already carries `planningContext`, so no
 * separate catalogue dependency is needed at construction time; the
 * lookup happens internally to resolve the `ExerciseProgressionContext`
 * every strategy above actually depends on.
 *
 * There is no randomness, network access, persistence, or UI concern
 * anywhere in this pipeline: identical inputs always produce identical,
 * fully immutable `ProgressionScheme` output.
 */
export class RuleBasedProgressionPlanner implements ProgressionPlanner {
  private readonly modelStrategy: ProgressionModelStrategy;
  private readonly incrementStrategy: IncrementStrategy;
  private readonly deloadCadenceStrategy: DeloadCadenceStrategy;
  private readonly progressionLimitStrategy: ProgressionLimitStrategy;

  constructor(
    modelStrategy: ProgressionModelStrategy = new DefaultProgressionModelStrategy(),
    incrementStrategy: IncrementStrategy = new DefaultIncrementStrategy(),
    deloadCadenceStrategy: DeloadCadenceStrategy = new DefaultDeloadCadenceStrategy(),
    progressionLimitStrategy: ProgressionLimitStrategy = new DefaultProgressionLimitStrategy(),
  ) {
    this.modelStrategy = modelStrategy;
    this.incrementStrategy = incrementStrategy;
    this.deloadCadenceStrategy = deloadCadenceStrategy;
    this.progressionLimitStrategy = progressionLimitStrategy;
  }

  planProgression(input: ProgressionPlanningInput): ProgressionPlanningResult {
    const context = this.buildContext(input);

    const model = this.modelStrategy.selectModel(context);
    const increment = this.incrementStrategy.resolveIncrement(context, model);
    const deloadFrequencyWeeks = this.deloadCadenceStrategy.resolveDeloadFrequencyWeeks(context, model);
    const cycleLengthWeeks = this.progressionLimitStrategy.resolveCycleLengthWeeks(
      context,
      model,
      deloadFrequencyWeeks,
    );

    const progressionScheme: ProgressionScheme = {
      id: this.buildSchemeId(input.exerciseId),
      model,
      incrementValue: increment.incrementValue,
      incrementUnit: increment.incrementUnit,
      cycleLengthWeeks,
      deloadFrequencyWeeks,
      description: this.buildDescription(model, increment, cycleLengthWeeks, deloadFrequencyWeeks),
    };

    return { exerciseId: input.exerciseId, progressionScheme };
  }

  private buildContext(input: ProgressionPlanningInput): ExerciseProgressionContext {
    return {
      goal: input.planningContext.goal,
      experienceLevel: input.planningContext.experienceLevel,
      exerciseCategory: input.exerciseCategory,
      movementPattern: input.planningContext.exerciseLookup.get(input.exerciseId)?.movementPattern ?? null,
      programDurationWeeks: input.planningContext.durationWeeks,
    };
  }

  private buildSchemeId(exerciseId: ExerciseId): ProgressionSchemeId {
    return `${String(exerciseId)}::progression` as ProgressionSchemeId;
  }

  private buildDescription(
    model: ProgressionModel,
    increment: ProgressionIncrement,
    cycleLengthWeeks: number | null,
    deloadFrequencyWeeks: number | null,
  ): string {
    const parts: string[] = [MODEL_LABEL[model]];

    if (increment.incrementValue !== null && increment.incrementUnit !== null) {
      parts.push(`add ${increment.incrementValue}${increment.incrementUnit} once target reps/RPE are met`);
    }
    if (cycleLengthWeeks !== null) {
      parts.push(`${cycleLengthWeeks}-week cycle`);
    }
    if (deloadFrequencyWeeks !== null) {
      parts.push(`deload every ${deloadFrequencyWeeks} weeks`);
    }

    return parts.join("; ");
  }
}
