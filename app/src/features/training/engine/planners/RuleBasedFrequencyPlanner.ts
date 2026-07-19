import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { TrainingGoal } from "../../enums/TrainingGoal";
import type {
  FrequencyPlanner,
  FrequencyPlanningInput,
  FrequencyPlanningResult,
  MuscleGroupFrequency,
} from "../contracts/FrequencyPlanner";

/** How many training sessions a microcycle contains, and how long the microcycle is. */
export interface SessionStructure {
  readonly sessionsPerWeek: number;
  readonly microcycleLengthDays: number;
}

/**
 * Decides the shape of the microcycle itself — session count and length —
 * before any per-muscle decision is made. Kept separate from
 * `MuscleFrequencyStrategy` so "how many times do we train" and "what do
 * we train each time" can evolve, be tuned, or be replaced independently.
 */
export interface SessionCountStrategy {
  resolveSessionStructure(input: FrequencyPlanningInput): SessionStructure;
}

/**
 * Decides how often each requested muscle group is trained, given an
 * already-decided `SessionStructure`. Receives the structure rather than
 * deriving its own, keeping the two decisions independent and testable in
 * isolation.
 */
export interface MuscleFrequencyStrategy {
  resolveMuscleGroupFrequencies(
    input: FrequencyPlanningInput,
    sessionStructure: SessionStructure,
  ): readonly MuscleGroupFrequency[];
}

/** Length, in days, of the recurring microcycle every default strategy plans against. */
const MICROCYCLE_LENGTH_DAYS = 7;

/**
 * Goal-driven baseline for how many sessions a microcycle should contain
 * before experience and availability narrow it down. Strength-biased
 * goals favor fewer, heavier sessions per muscle; hypertrophy- and
 * hybrid-biased goals favor more, lighter ones.
 */
const GOAL_BASE_SESSIONS_PER_WEEK: Readonly<Record<TrainingGoal, number>> = {
  [TrainingGoal.Powerlifting]: 4,
  [TrainingGoal.Strength]: 4,
  [TrainingGoal.Powerbuilding]: 5,
  [TrainingGoal.Bodybuilding]: 5,
  [TrainingGoal.Hypertrophy]: 5,
  [TrainingGoal.Hybrid]: 5,
  [TrainingGoal.Endurance]: 4,
  [TrainingGoal.GeneralFitness]: 3,
};

/**
 * Floor and ceiling on sessions-per-week an athlete's experience level can
 * reasonably recover from and execute with good technique, independent of
 * goal. Beginners are bounded tightly to protect recovery and technique
 * acquisition; advanced/elite athletes are allowed a wider band.
 */
const EXPERIENCE_SESSION_BOUNDS: Readonly<Record<ExperienceLevel, { readonly min: number; readonly max: number }>> = {
  [ExperienceLevel.Beginner]: { min: 2, max: 4 },
  [ExperienceLevel.Intermediate]: { min: 3, max: 5 },
  [ExperienceLevel.Advanced]: { min: 3, max: 6 },
  [ExperienceLevel.Elite]: { min: 4, max: 6 },
};

/**
 * Default, purely deterministic session-structure resolution.
 *
 * Starts from the goal's base sessions-per-week, clamps it to what the
 * athlete's experience level can reasonably recover from, and finally
 * clamps it to real athlete availability — availability is always the
 * hard ceiling, since a plan that ignores it is not executable regardless
 * of what goal or experience would otherwise prescribe. The microcycle is
 * always a fixed 7-day week: every default rule in this planner reasons
 * about "per week", so a variable-length microcycle is left for a future
 * strategy that explicitly needs one.
 */
export class DefaultSessionCountStrategy implements SessionCountStrategy {
  resolveSessionStructure(input: FrequencyPlanningInput): SessionStructure {
    const { planningContext } = input;
    const availableDaysPerWeek = this.clamp(
      Math.round(planningContext.availableDaysPerWeek),
      0,
      MICROCYCLE_LENGTH_DAYS,
    );
    const bounds = EXPERIENCE_SESSION_BOUNDS[planningContext.experienceLevel];
    const goalBaseline = GOAL_BASE_SESSIONS_PER_WEEK[planningContext.goal];
    const experienceAdjusted = this.clamp(goalBaseline, bounds.min, bounds.max);
    const sessionsPerWeek = Math.min(experienceAdjusted, availableDaysPerWeek);

    return { sessionsPerWeek, microcycleLengthDays: MICROCYCLE_LENGTH_DAYS };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

/**
 * Minimum full rest days a muscle group needs between two sessions that
 * train it, before the next hit is added back on top of residual fatigue
 * rather than recovered tissue. Heavy-strength goals demand the longest
 * spacing; hypertrophy- and hybrid-biased goals recover faster at the
 * loads they use and can be trained closer together; endurance work
 * carries negligible localized muscle damage and needs none.
 */
const MIN_REST_DAYS_BETWEEN_MUSCLE_HITS: Readonly<Record<TrainingGoal, number>> = {
  [TrainingGoal.Powerlifting]: 2,
  [TrainingGoal.Strength]: 2,
  [TrainingGoal.Powerbuilding]: 1,
  [TrainingGoal.Bodybuilding]: 1,
  [TrainingGoal.Hypertrophy]: 1,
  [TrainingGoal.Hybrid]: 1,
  [TrainingGoal.Endurance]: 0,
  [TrainingGoal.GeneralFitness]: 1,
};

/**
 * Goal-driven baseline weekly frequency for a muscle group before priority
 * and capacity adjust it. Strength-biased goals concentrate their limited
 * sessions on a few heavy lifts and default to once per week per muscle;
 * hypertrophy- and hybrid-biased goals spread stimulus across the week and
 * default to twice.
 */
const GOAL_BASE_MUSCLE_FREQUENCY: Readonly<Record<TrainingGoal, number>> = {
  [TrainingGoal.Powerlifting]: 1,
  [TrainingGoal.Strength]: 1,
  [TrainingGoal.Powerbuilding]: 2,
  [TrainingGoal.Bodybuilding]: 2,
  [TrainingGoal.Hypertrophy]: 2,
  [TrainingGoal.Hybrid]: 2,
  [TrainingGoal.Endurance]: 1,
  [TrainingGoal.GeneralFitness]: 1,
};

/**
 * Experience levels trusted to absorb an extra weekly hit on their
 * highest-priority muscle groups. Beginners are excluded: they get a flat
 * baseline frequency across every target so early programming stays
 * simple and recovery risk stays low.
 */
const PRIORITY_BOOST_EXPERIENCE_LEVELS: ReadonlySet<ExperienceLevel> = new Set([
  ExperienceLevel.Intermediate,
  ExperienceLevel.Advanced,
  ExperienceLevel.Elite,
]);

/** Extra weekly hit granted to a top-priority muscle group, on top of the goal baseline. */
const PRIORITY_BOOST_FREQUENCY = 1;

/**
 * `targetMuscleGroups` is treated as priority-ordered, mirroring the
 * `order`-as-priority convention `RuleBasedVolumePlanner` uses for
 * `SelectedExercise`: the earlier a muscle group appears, the more of the
 * week's limited attention it is entitled to. Only the top half of the
 * list is eligible for the priority boost.
 */
function resolvePriorityBoostCount(targetCount: number): number {
  return Math.ceil(targetCount / 2);
}

/**
 * Weekly "focus slots" one session can meaningfully spend on distinct
 * muscle groups without every session degenerating into a full-body
 * session. Multiplied by `sessionsPerWeek`, this becomes the week's total
 * muscle-group-hit budget that `DefaultMuscleFrequencyStrategy` must fit
 * every target's frequency inside of — the mechanism that actually
 * enforces a feasible weekly distribution.
 */
const MAX_MUSCLE_FOCUS_SLOTS_PER_SESSION = 3;

/**
 * Default, purely deterministic muscle-frequency resolution.
 *
 * Runs in three steps, each bounded by a different one of the required
 * considerations:
 *
 * 1. Recovery spacing — `MIN_REST_DAYS_BETWEEN_MUSCLE_HITS` for the goal
 *    caps how many times per microcycle a muscle group can be hit at all
 *    (`floor(microcycleLengthDays / (minRestDays + 1))`), further capped
 *    by `sessionsPerWeek` itself.
 * 2. Desired frequency — the goal's baseline frequency, boosted by one
 *    extra weekly hit for the top (priority-ordered) half of
 *    `targetMuscleGroups`, but only for experience levels trusted to
 *    absorb it. Clamped to the recovery cap from step 1.
 * 3. Weekly distribution — every target is guaranteed its first weekly hit
 *    (priority order decides who is dropped first if even that is not
 *    affordable), then any further desired frequency is distributed as
 *    bonus hits across the week's remaining "focus slot" budget using the
 *    same largest-remainder method `RuleBasedVolumePlanner` uses for set
 *    allocation, so the total never exceeds what the week can actually
 *    hold.
 */
export class DefaultMuscleFrequencyStrategy implements MuscleFrequencyStrategy {
  resolveMuscleGroupFrequencies(
    input: FrequencyPlanningInput,
    sessionStructure: SessionStructure,
  ): readonly MuscleGroupFrequency[] {
    const { targetMuscleGroups } = input;
    if (targetMuscleGroups.length === 0 || sessionStructure.sessionsPerWeek <= 0) {
      return [];
    }

    const perMuscleCap = this.resolvePerMuscleCap(input.planningContext.goal, sessionStructure);
    const desiredFrequencies = this.resolveDesiredFrequencies(input, perMuscleCap);
    const finalFrequencies = this.distributeAcrossWeek(desiredFrequencies, sessionStructure.sessionsPerWeek);

    return targetMuscleGroups.map((muscleGroup, index) => ({
      muscleGroup,
      sessionsPerWeek: finalFrequencies[index],
    }));
  }

  private resolvePerMuscleCap(goal: TrainingGoal, sessionStructure: SessionStructure): number {
    const minRestDays = MIN_REST_DAYS_BETWEEN_MUSCLE_HITS[goal];
    const recoveryCap = Math.floor(sessionStructure.microcycleLengthDays / (minRestDays + 1));
    return Math.max(1, Math.min(recoveryCap, sessionStructure.sessionsPerWeek));
  }

  private resolveDesiredFrequencies(input: FrequencyPlanningInput, perMuscleCap: number): readonly number[] {
    const boostEligibleCount = PRIORITY_BOOST_EXPERIENCE_LEVELS.has(input.planningContext.experienceLevel)
      ? resolvePriorityBoostCount(input.targetMuscleGroups.length)
      : 0;
    const baseline = GOAL_BASE_MUSCLE_FREQUENCY[input.planningContext.goal];

    return input.targetMuscleGroups.map((_, index) => {
      const boosted = index < boostEligibleCount ? baseline + PRIORITY_BOOST_FREQUENCY : baseline;
      return Math.max(1, Math.min(boosted, perMuscleCap));
    });
  }

  /**
   * Guarantees every target its first weekly hit — dropping lowest-priority
   * (highest-index) targets first if even one hit each does not fit — then
   * distributes each target's remaining desired frequency as bonus hits
   * across whatever weekly budget is left over, proportionally to how much
   * bonus it desired.
   */
  private distributeAcrossWeek(desiredFrequencies: readonly number[], sessionsPerWeek: number): readonly number[] {
    const weeklyBudget = sessionsPerWeek * MAX_MUSCLE_FOCUS_SLOTS_PER_SESSION;
    const baselineCount = Math.min(desiredFrequencies.length, weeklyBudget);

    const baselineHits = desiredFrequencies.map((_, index) => (index < baselineCount ? 1 : 0));
    const bonusDesired = desiredFrequencies.map((desired, index) =>
      index < baselineCount ? Math.max(0, desired - 1) : 0,
    );
    const remainingBudget = weeklyBudget - baselineCount;
    const bonusHits = this.distributeProportionally(bonusDesired, remainingBudget);

    return baselineHits.map((hit, index) => hit + bonusHits[index]);
  }

  /**
   * Splits `capacity` whole units across `weights` proportionally, using
   * the largest remainder method so results are deterministic, never
   * exceed each entry's own weight, and always sum back to
   * `min(capacity, sum(weights))`.
   */
  private distributeProportionally(weights: readonly number[], capacity: number): readonly number[] {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0 || capacity <= 0) {
      return weights.map(() => 0);
    }
    if (totalWeight <= capacity) {
      return weights;
    }

    const rawShares = weights.map((weight) => (capacity * weight) / totalWeight);
    const flooredShares = rawShares.map((share) => Math.max(0, Math.floor(share)));
    const allocated = flooredShares.reduce((sum, share) => sum + share, 0);
    let remainder = capacity - allocated;

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
}

/**
 * Deterministic, rule-based implementation of `FrequencyPlanner`.
 *
 * Planning happens in two composed, independently swappable stages, both
 * supplied through the constructor rather than hard-coded (Open/Closed,
 * Dependency Inversion) so an evidence-based frequency model — e.g. one
 * driven by published muscle-protein-synthesis or fatigue-decay research —
 * can replace either stage later without touching this class or any
 * caller that only knows about the `FrequencyPlanner` contract:
 *
 * 1. Session structure — a `SessionCountStrategy` decides how many
 *    sessions the microcycle contains and how long the microcycle is,
 *    from `goal`, `experienceLevel`, and `availableDaysPerWeek`.
 * 2. Muscle frequency — a `MuscleFrequencyStrategy` decides how often each
 *    of `targetMuscleGroups` is trained within that structure, applying
 *    recovery spacing, priority (list order), and weekly-distribution
 *    limits.
 *
 * There is no randomness, network access, persistence, or UI concern
 * anywhere in this pipeline: identical inputs always produce identical,
 * fully immutable output.
 */
export class RuleBasedFrequencyPlanner implements FrequencyPlanner {
  private readonly sessionCountStrategy: SessionCountStrategy;
  private readonly muscleFrequencyStrategy: MuscleFrequencyStrategy;

  constructor(
    sessionCountStrategy: SessionCountStrategy = new DefaultSessionCountStrategy(),
    muscleFrequencyStrategy: MuscleFrequencyStrategy = new DefaultMuscleFrequencyStrategy(),
  ) {
    this.sessionCountStrategy = sessionCountStrategy;
    this.muscleFrequencyStrategy = muscleFrequencyStrategy;
  }

  planFrequency(input: FrequencyPlanningInput): FrequencyPlanningResult {
    const sessionStructure = this.sessionCountStrategy.resolveSessionStructure(input);
    const muscleGroupFrequencies = this.muscleFrequencyStrategy.resolveMuscleGroupFrequencies(
      input,
      sessionStructure,
    );

    return {
      sessionsPerWeek: sessionStructure.sessionsPerWeek,
      microcycleLengthDays: sessionStructure.microcycleLengthDays,
      muscleGroupFrequencies,
    };
  }
}
