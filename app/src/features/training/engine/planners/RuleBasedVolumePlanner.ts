import { ExerciseCategory } from "../../enums/ExerciseCategory";
import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { IntensityMetric } from "../../enums/IntensityMetric";
import { MovementPattern } from "../../enums/MovementPattern";
import { SetType } from "../../enums/SetType";
import { TrainingGoal } from "../../enums/TrainingGoal";
import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { SetPrescription } from "../../models/SetPrescription";
import type { ExerciseId, SetPrescriptionId } from "../../types/ids";
import type { IntensityTarget } from "../../types/IntensityTarget";
import type { RepRange } from "../../types/RepRange";
import type { Tempo } from "../../types/Tempo";
import type { SelectedExercise } from "../contracts/ExerciseSelector";
import type {
  ExerciseVolumeAssignment,
  VolumePlanner,
  VolumePlanningInput,
  VolumePlanningResult,
} from "../contracts/VolumePlanner";

/**
 * Whether a selected exercise is the main driver of a muscle group's
 * per-session volume, or a supporting contributor to it. Roles are decided
 * per muscle group (an exercise can be primary for one target and
 * secondary for another) rather than being a fixed property of the
 * exercise itself, since the same movement plays different roles in
 * different programs.
 */
export enum ExerciseVolumeRole {
  Primary = "primary",
  Secondary = "secondary",
}

/** A muscle group's per-session set share assigned to one selected exercise. */
export interface MuscleVolumeContribution {
  readonly exerciseId: ExerciseId;
  readonly role: ExerciseVolumeRole;
  readonly sets: number;
}

/**
 * Final set allocation for one selected exercise, already reconciled
 * across every muscle group it targets. `role` reflects the muscle group
 * that produced this exercise's set count (its "driving" target).
 */
export interface ExerciseVolumeAllocation {
  readonly exerciseId: ExerciseId;
  readonly totalSets: number;
  readonly role: ExerciseVolumeRole;
}

/**
 * Decides how many sets each selected exercise performs in one planning
 * pass. Kept separate from `SetSchemeStrategy` so the "how much volume"
 * decision and the "what does a set look like" decision can evolve, be
 * tuned, or be replaced independently.
 */
export interface VolumeAllocationStrategy {
  allocate(
    input: VolumePlanningInput,
    exerciseLookup: ReadonlyMap<ExerciseId, ExerciseDefinition>,
  ): readonly ExerciseVolumeAllocation[];
}

/**
 * Decides the concrete `SetPrescription` shape (reps, intensity, rest,
 * tempo, set type) for one exercise, given its allocation and the
 * program's goal and experience level. Never assigns an `id` — that is
 * the calling planner's responsibility, keeping this strategy pure and
 * side-effect free.
 */
export interface SetSchemeStrategy {
  buildSetPrescriptions(
    exercise: ExerciseDefinition | null,
    allocation: ExerciseVolumeAllocation,
    goal: TrainingGoal,
    experienceLevel: ExperienceLevel,
  ): readonly Omit<SetPrescription, "id">[];
}

const ROLE_WEIGHT: Readonly<Record<ExerciseVolumeRole, number>> = {
  [ExerciseVolumeRole.Primary]: 2,
  [ExerciseVolumeRole.Secondary]: 1,
};

/**
 * How much of a muscle group's per-session sets an exercise of this
 * category should carry, relative to other exercises targeting the same
 * muscle. Isolation work leans on direct, dedicated sets (nothing else is
 * being trained at the same time), while technical or conditioning
 * categories carry a lighter direct-set share since their volume is
 * better expressed through skill practice or duration than raw set count.
 */
const CATEGORY_SET_WEIGHT: Readonly<Record<ExerciseCategory, number>> = {
  [ExerciseCategory.Compound]: 1,
  [ExerciseCategory.Isolation]: 1.3,
  [ExerciseCategory.Accessory]: 1.1,
  [ExerciseCategory.Olympic]: 0.7,
  [ExerciseCategory.Plyometric]: 0.7,
  [ExerciseCategory.Cardio]: 0.4,
  [ExerciseCategory.Mobility]: 0.4,
};

/** Sets assigned when a selected exercise matches none of the day's muscle group targets. */
const ORPHAN_EXERCISE_FALLBACK_SETS = 2;

/**
 * Default, purely deterministic volume allocation.
 *
 * For every `MuscleGroupVolumeTarget`, the exercises that target that
 * muscle share its `setsPerSession` sets, weighted by role (the
 * earliest-ordered contributor is primary, the rest are secondary) and by
 * exercise category. Shares are rounded to whole sets with the largest
 * remainder method so the muscle group's total is preserved as closely as
 * possible.
 *
 * A single exercise frequently targets more than one muscle group (e.g. a
 * squat targets quads, glutes, and hamstrings at once). Since performing
 * one set of that exercise satisfies all of those targets simultaneously,
 * an exercise's final set count is the *maximum* of its per-muscle shares
 * — never their sum — with `role` taken from whichever muscle group
 * produced that maximum. This is a deliberate simplification: it avoids
 * inflating an exercise's volume just because it happens to be relevant to
 * several targets.
 */
export class DefaultVolumeAllocationStrategy implements VolumeAllocationStrategy {
  allocate(
    input: VolumePlanningInput,
    exerciseLookup: ReadonlyMap<ExerciseId, ExerciseDefinition>,
  ): readonly ExerciseVolumeAllocation[] {
    const contributionsByExercise = this.collectContributionsByExercise(input, exerciseLookup);

    return [...input.selectedExercises]
      .sort((a, b) => a.order - b.order)
      .map((selected) => this.reconcile(selected, contributionsByExercise.get(selected.exerciseId)));
  }

  private collectContributionsByExercise(
    input: VolumePlanningInput,
    exerciseLookup: ReadonlyMap<ExerciseId, ExerciseDefinition>,
  ): ReadonlyMap<ExerciseId, readonly MuscleVolumeContribution[]> {
    const byExercise = new Map<ExerciseId, MuscleVolumeContribution[]>();

    for (const target of input.volumeTargets) {
      const contributors = input.selectedExercises
        .filter((selected) => selected.targetedMuscles.includes(target.muscleGroup))
        .sort((a, b) => a.order - b.order);

      if (contributors.length === 0) {
        continue;
      }

      const weights = contributors.map((_, index) => {
        const role = index === 0 ? ExerciseVolumeRole.Primary : ExerciseVolumeRole.Secondary;
        return ROLE_WEIGHT[role];
      });
      const categoryWeights = contributors.map((selected) => {
        const category = exerciseLookup.get(selected.exerciseId)?.category;
        return category ? CATEGORY_SET_WEIGHT[category] : 1;
      });
      const combinedWeights = weights.map((weight, index) => weight * categoryWeights[index]);
      const sets = this.distributeSets(target.setsPerSession, combinedWeights);

      contributors.forEach((selected, index) => {
        const role = index === 0 ? ExerciseVolumeRole.Primary : ExerciseVolumeRole.Secondary;
        const existing = byExercise.get(selected.exerciseId) ?? [];
        existing.push({ exerciseId: selected.exerciseId, role, sets: sets[index] });
        byExercise.set(selected.exerciseId, existing);
      });
    }

    return byExercise;
  }

  /**
   * Splits `total` whole sets across `weights` proportionally, using the
   * largest remainder method so results are deterministic and always sum
   * back to `total` (never over- or under-allocating due to rounding).
   */
  private distributeSets(total: number, weights: readonly number[]): readonly number[] {
    if (weights.length === 0 || total <= 0) {
      return weights.map(() => 0);
    }

    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const rawShares = weights.map((weight) => (weightSum > 0 ? (total * weight) / weightSum : total / weights.length));
    const flooredShares = rawShares.map((share) => Math.max(0, Math.floor(share)));
    const allocated = flooredShares.reduce((sum, share) => sum + share, 0);
    let remainder = total - allocated;

    const byRemainingFraction = rawShares
      .map((share, index) => ({ index, fraction: share - flooredShares[index] }))
      .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

    const result = [...flooredShares];
    for (let i = 0; i < byRemainingFraction.length && remainder > 0; i += 1) {
      result[byRemainingFraction[i].index] += 1;
      remainder -= 1;
    }

    return result;
  }

  private reconcile(
    selected: SelectedExercise,
    contributions: readonly MuscleVolumeContribution[] | undefined,
  ): ExerciseVolumeAllocation {
    if (!contributions || contributions.length === 0) {
      return {
        exerciseId: selected.exerciseId,
        totalSets: ORPHAN_EXERCISE_FALLBACK_SETS,
        role: ExerciseVolumeRole.Secondary,
      };
    }

    const driving = contributions.reduce((best, current) => (current.sets > best.sets ? current : best));
    return { exerciseId: selected.exerciseId, totalSets: driving.sets, role: driving.role };
  }
}

const GOAL_BASE_REP_RANGE: Readonly<Record<TrainingGoal, RepRange>> = {
  [TrainingGoal.Powerlifting]: { min: 3, max: 6 },
  [TrainingGoal.Strength]: { min: 4, max: 6 },
  [TrainingGoal.Powerbuilding]: { min: 5, max: 8 },
  [TrainingGoal.Bodybuilding]: { min: 8, max: 12 },
  [TrainingGoal.Hypertrophy]: { min: 8, max: 12 },
  [TrainingGoal.Hybrid]: { min: 6, max: 10 },
  [TrainingGoal.Endurance]: { min: 15, max: 20 },
  [TrainingGoal.GeneralFitness]: { min: 10, max: 15 },
};

/** Rep ranges that are intrinsic to the category and hold regardless of program goal. */
const CATEGORY_REP_RANGE_OVERRIDE: Readonly<Partial<Record<ExerciseCategory, RepRange>>> = {
  [ExerciseCategory.Olympic]: { min: 1, max: 5 },
  [ExerciseCategory.Plyometric]: { min: 3, max: 8 },
  [ExerciseCategory.Cardio]: { min: 12, max: 20 },
  [ExerciseCategory.Mobility]: { min: 8, max: 15 },
};

/** Reps added on top of the goal's base range for categories that favor higher reps. */
const CATEGORY_REP_ADJUSTMENT: Readonly<Partial<Record<ExerciseCategory, number>>> = {
  [ExerciseCategory.Isolation]: 2,
  [ExerciseCategory.Accessory]: 1,
};

const EXPERIENCE_BASE_RIR: Readonly<Record<ExperienceLevel, number>> = {
  [ExperienceLevel.Beginner]: 3,
  [ExperienceLevel.Intermediate]: 2,
  [ExperienceLevel.Advanced]: 1,
  [ExperienceLevel.Elite]: 0,
};

/** Secondary work is left a little further from failure than the primary driver for the same muscle. */
const ROLE_RIR_ADJUSTMENT: Readonly<Record<ExerciseVolumeRole, number>> = {
  [ExerciseVolumeRole.Primary]: 0,
  [ExerciseVolumeRole.Secondary]: 1,
};

const CATEGORY_REST_SECONDS: Readonly<Record<ExerciseCategory, number>> = {
  [ExerciseCategory.Compound]: 150,
  [ExerciseCategory.Isolation]: 75,
  [ExerciseCategory.Accessory]: 90,
  [ExerciseCategory.Olympic]: 180,
  [ExerciseCategory.Plyometric]: 120,
  [ExerciseCategory.Cardio]: 30,
  [ExerciseCategory.Mobility]: 20,
};

/** Movement patterns that recruit enough total musculature to warrant longer or shorter recovery than their category's default. */
const MOVEMENT_PATTERN_REST_ADJUSTMENT_SECONDS: Readonly<Partial<Record<MovementPattern, number>>> = {
  [MovementPattern.Squat]: 15,
  [MovementPattern.Hinge]: 15,
  [MovementPattern.Lunge]: 10,
  [MovementPattern.Carry]: -15,
};

const HEAVY_STRENGTH_GOALS: ReadonlySet<TrainingGoal> = new Set([TrainingGoal.Powerlifting, TrainingGoal.Strength]);
const STRENGTH_REST_BONUS_SECONDS = 60;
const MIN_REST_SECONDS = 10;

/** Top-set %1RM used for the first set of a primary compound lift under a heavy-strength goal. */
const STRENGTH_TOP_SET_PERCENTAGE: Readonly<Partial<Record<TrainingGoal, number>>> = {
  [TrainingGoal.Powerlifting]: 87,
  [TrainingGoal.Strength]: 82,
};
const BACK_OFF_PERCENTAGE_DROP = 10;

const HYPERTROPHY_GOALS: ReadonlySet<TrainingGoal> = new Set([TrainingGoal.Bodybuilding, TrainingGoal.Hypertrophy]);
/** Slow, controlled tempo used for isolation work under hypertrophy-oriented goals to emphasize time under tension. */
const ISOLATION_HYPERTROPHY_TEMPO: Tempo = {
  eccentricSeconds: 3,
  bottomPauseSeconds: 1,
  concentricSeconds: 1,
  topPauseSeconds: 0,
};

/**
 * Default, purely deterministic set scheme.
 *
 * Combines category (compound vs. isolation vs. technical/conditioning),
 * movement pattern, program goal, experience level, and the exercise's
 * primary/secondary role into reps, intensity, rest, and tempo. A primary
 * compound lift under a heavy-strength goal gets an optional warm-up plus
 * a top set/back-off structure expressed in %1RM; everything else uses a
 * flat, RIR-based working-set scheme sized to the athlete's experience.
 * Every weight and table here is a named constant so the resulting
 * program is auditable and easy to retune without touching the algorithm.
 */
export class DefaultSetSchemeStrategy implements SetSchemeStrategy {
  buildSetPrescriptions(
    exercise: ExerciseDefinition | null,
    allocation: ExerciseVolumeAllocation,
    goal: TrainingGoal,
    experienceLevel: ExperienceLevel,
  ): readonly Omit<SetPrescription, "id">[] {
    if (allocation.totalSets <= 0) {
      return [];
    }

    const category = exercise?.category ?? ExerciseCategory.Accessory;
    const movementPattern = exercise?.movementPattern ?? null;
    const repRange = this.resolveRepRange(goal, category);
    const restSeconds = this.resolveRestSeconds(goal, category, movementPattern);
    const tempo = this.resolveTempo(goal, category);
    const usesTopSetScheme = this.usesTopSetScheme(goal, category, allocation.role);
    const rir = EXPERIENCE_BASE_RIR[experienceLevel] + ROLE_RIR_ADJUSTMENT[allocation.role];

    const prescriptions: Omit<SetPrescription, "id">[] = [];

    if (this.includesWarmup(category, allocation.role)) {
      prescriptions.push({
        setType: SetType.Warmup,
        targetReps: repRange,
        intensity: { metric: IntensityMetric.Rir, value: rir + 4 },
        restSeconds: Math.round(restSeconds / 2),
        tempo: null,
        notes: null,
      });
    }

    for (let setIndex = 0; setIndex < allocation.totalSets; setIndex += 1) {
      const isTopSet = usesTopSetScheme && setIndex === 0;
      const isBackOffSet = usesTopSetScheme && setIndex > 0;

      prescriptions.push({
        setType: isTopSet ? SetType.TopSet : isBackOffSet ? SetType.BackOff : SetType.Working,
        targetReps: repRange,
        intensity: this.resolveIntensity(goal, category, rir, isTopSet, isBackOffSet),
        restSeconds,
        tempo,
        notes: null,
      });
    }

    return prescriptions;
  }

  private resolveRepRange(goal: TrainingGoal, category: ExerciseCategory): RepRange {
    const override = CATEGORY_REP_RANGE_OVERRIDE[category];
    if (override) {
      return override;
    }

    const base = GOAL_BASE_REP_RANGE[goal];
    const adjustment = CATEGORY_REP_ADJUSTMENT[category] ?? 0;
    return { min: base.min + adjustment, max: base.max + adjustment };
  }

  private resolveRestSeconds(
    goal: TrainingGoal,
    category: ExerciseCategory,
    movementPattern: MovementPattern | null,
  ): number {
    const base = CATEGORY_REST_SECONDS[category];
    const patternAdjustment = movementPattern
      ? MOVEMENT_PATTERN_REST_ADJUSTMENT_SECONDS[movementPattern] ?? 0
      : 0;
    const strengthBonus =
      HEAVY_STRENGTH_GOALS.has(goal) && category === ExerciseCategory.Compound ? STRENGTH_REST_BONUS_SECONDS : 0;

    return Math.max(MIN_REST_SECONDS, base + patternAdjustment + strengthBonus);
  }

  private resolveTempo(goal: TrainingGoal, category: ExerciseCategory): Tempo | null {
    return HYPERTROPHY_GOALS.has(goal) && category === ExerciseCategory.Isolation
      ? ISOLATION_HYPERTROPHY_TEMPO
      : null;
  }

  private usesTopSetScheme(goal: TrainingGoal, category: ExerciseCategory, role: ExerciseVolumeRole): boolean {
    return HEAVY_STRENGTH_GOALS.has(goal) && category === ExerciseCategory.Compound && role === ExerciseVolumeRole.Primary;
  }

  private includesWarmup(category: ExerciseCategory, role: ExerciseVolumeRole): boolean {
    return category === ExerciseCategory.Compound && role === ExerciseVolumeRole.Primary;
  }

  private resolveIntensity(
    goal: TrainingGoal,
    category: ExerciseCategory,
    rir: number,
    isTopSet: boolean,
    isBackOffSet: boolean,
  ): IntensityTarget {
    const topSetPercentage = STRENGTH_TOP_SET_PERCENTAGE[goal];
    if (topSetPercentage !== undefined && category === ExerciseCategory.Compound) {
      const value = isBackOffSet ? topSetPercentage - BACK_OFF_PERCENTAGE_DROP : topSetPercentage;
      return { metric: IntensityMetric.PercentageOneRepMax, value };
    }

    const value = isBackOffSet ? rir + 1 : rir;
    return { metric: IntensityMetric.Rir, value };
  }
}

/**
 * Deterministic, rule-based implementation of `VolumePlanner`.
 *
 * Planning happens in two composed, independently swappable stages, both
 * supplied through the constructor rather than hard-coded (Open/Closed,
 * Dependency Inversion) so an evidence-weighted or periodization-aware
 * model can replace either stage later without touching this class or any
 * caller that only knows about the `VolumePlanner` contract:
 *
 * 1. Allocation — a `VolumeAllocationStrategy` decides how many sets each
 *    selected exercise performs, distributing each muscle group's
 *    `setsPerSession` across the exercises that target it and reconciling
 *    exercises that target more than one muscle group at once.
 * 2. Scheming — a `SetSchemeStrategy` turns each exercise's set count into
 *    concrete, immutable `SetPrescription`s (reps, intensity, rest, tempo)
 *    based on goal, experience level, category, movement pattern, and role.
 *
 * The exercise catalogue is injected once at construction time, mirroring
 * `ExerciseCatalog`'s dependency on `ExerciseRepository`: `planVolume`
 * itself only receives `VolumePlanningInput`, as fixed by the
 * `VolumePlanner` contract, so category and movement pattern lookups must
 * come from a dependency rather than the call site. There is no
 * randomness, network access, persistence, or UI concern anywhere in this
 * pipeline: identical inputs always produce identical, fully immutable
 * output.
 */
export class RuleBasedVolumePlanner implements VolumePlanner {
  private readonly exerciseLookup: ReadonlyMap<ExerciseId, ExerciseDefinition>;
  private readonly allocationStrategy: VolumeAllocationStrategy;
  private readonly setSchemeStrategy: SetSchemeStrategy;

  constructor(
    exerciseCatalogue: readonly ExerciseDefinition[] = [],
    allocationStrategy: VolumeAllocationStrategy = new DefaultVolumeAllocationStrategy(),
    setSchemeStrategy: SetSchemeStrategy = new DefaultSetSchemeStrategy(),
  ) {
    this.exerciseLookup = new Map(exerciseCatalogue.map((exercise) => [exercise.id, exercise]));
    this.allocationStrategy = allocationStrategy;
    this.setSchemeStrategy = setSchemeStrategy;
  }

  planVolume(input: VolumePlanningInput): VolumePlanningResult {
    const allocations = this.allocationStrategy.allocate(input, this.exerciseLookup);

    const assignments: readonly ExerciseVolumeAssignment[] = allocations.map((allocation) => {
      const exercise = this.exerciseLookup.get(allocation.exerciseId) ?? null;
      const prescriptions = this.setSchemeStrategy.buildSetPrescriptions(
        exercise,
        allocation,
        input.goal,
        input.experienceLevel,
      );

      return {
        exerciseId: allocation.exerciseId,
        setPrescriptions: prescriptions.map((prescription, index) =>
          this.withId(prescription, allocation.exerciseId, index),
        ),
      };
    });

    return { assignments };
  }

  private withId(
    prescription: Omit<SetPrescription, "id">,
    exerciseId: ExerciseId,
    index: number,
  ): SetPrescription {
    return {
      ...prescription,
      id: `${String(exerciseId)}::set-${index}` as SetPrescriptionId,
    };
  }
}
