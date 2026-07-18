import { ExerciseCategory } from "../../enums/ExerciseCategory";
import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { TrainingGoal } from "../../enums/TrainingGoal";
import type { MovementPattern } from "../../enums/MovementPattern";
import type { MuscleGroup } from "../../enums/MuscleGroup";
import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type {
  ExerciseSelectionCriteria,
  ExerciseSelectionResult,
  ExerciseSelector,
  SelectedExercise,
} from "../contracts/ExerciseSelector";

/**
 * A single deterministic pass/fail check an exercise must satisfy before it
 * is even considered for selection. Rules are intentionally narrow (one
 * concern each) so eligibility logic can grow — new equipment policies, new
 * exclusion sources — without editing existing rules or the selector that
 * runs them.
 */
export interface ExerciseEligibilityRule {
  isSatisfiedBy(exercise: ExerciseDefinition, criteria: ExerciseSelectionCriteria): boolean;
}

/**
 * Assigns a numeric fit score to an exercise that has already passed every
 * `ExerciseEligibilityRule`. The score is used only to rank and choose among
 * eligible candidates; it never decides eligibility itself. Swapping this
 * strategy (e.g. for a future evidence-weighted or periodization-aware
 * scorer) changes ranking only — `RuleBasedExerciseSelector` and everything
 * that depends on the `ExerciseSelector` contract stays untouched.
 */
export interface ExerciseScoringStrategy {
  score(exercise: ExerciseDefinition, criteria: ExerciseSelectionCriteria): number;
}

/** Excludes any exercise explicitly named in `criteria.excludedExerciseIds`. */
export class ExcludedExerciseRule implements ExerciseEligibilityRule {
  isSatisfiedBy(exercise: ExerciseDefinition, criteria: ExerciseSelectionCriteria): boolean {
    return !criteria.excludedExerciseIds.includes(exercise.id);
  }
}

/**
 * Requires an exercise to be performable with the caller's available
 * equipment. An exercise with no equipment requirement (e.g. pure
 * bodyweight work) is always eligible; otherwise at least one of the
 * exercise's required equipment types must be available.
 */
export class EquipmentAvailabilityRule implements ExerciseEligibilityRule {
  isSatisfiedBy(exercise: ExerciseDefinition, criteria: ExerciseSelectionCriteria): boolean {
    if (exercise.equipment.length === 0) {
      return true;
    }
    return exercise.equipment.some((equipment) => criteria.availableEquipment.includes(equipment));
  }
}

/**
 * Requires an exercise to actually target at least one of the requested
 * muscle groups (primary or secondary). When no target muscle groups are
 * specified, every exercise is considered relevant, since there is nothing
 * to narrow against.
 */
export class MuscleRelevanceRule implements ExerciseEligibilityRule {
  isSatisfiedBy(exercise: ExerciseDefinition, criteria: ExerciseSelectionCriteria): boolean {
    if (criteria.targetMuscleGroups.length === 0) {
      return true;
    }
    return [...exercise.primaryMuscles, ...exercise.secondaryMuscles].some((muscle) =>
      criteria.targetMuscleGroups.includes(muscle),
    );
  }
}

/** Categories that are considered a natural fit for a given training goal. */
const GOAL_CATEGORY_AFFINITY: Readonly<Record<TrainingGoal, ReadonlySet<ExerciseCategory>>> = {
  [TrainingGoal.Powerlifting]: new Set([ExerciseCategory.Compound]),
  [TrainingGoal.Strength]: new Set([ExerciseCategory.Compound, ExerciseCategory.Olympic]),
  [TrainingGoal.Bodybuilding]: new Set([ExerciseCategory.Isolation, ExerciseCategory.Accessory]),
  [TrainingGoal.Hypertrophy]: new Set([
    ExerciseCategory.Isolation,
    ExerciseCategory.Accessory,
    ExerciseCategory.Compound,
  ]),
  [TrainingGoal.Powerbuilding]: new Set([ExerciseCategory.Compound, ExerciseCategory.Isolation]),
  [TrainingGoal.Hybrid]: new Set([ExerciseCategory.Compound, ExerciseCategory.Plyometric]),
  [TrainingGoal.Endurance]: new Set([ExerciseCategory.Cardio, ExerciseCategory.Mobility]),
  [TrainingGoal.GeneralFitness]: new Set([ExerciseCategory.Compound, ExerciseCategory.Mobility]),
};

/**
 * Categories that demand coordination or skill beyond what an experience
 * level can reliably manage, expressed as a score penalty rather than a
 * hard exclusion — a novice-inappropriate exercise should rank low, not
 * vanish outright, in case the catalogue offers nothing better.
 */
const EXPERIENCE_CATEGORY_PENALTY: Readonly<Record<ExperienceLevel, ReadonlySet<ExerciseCategory>>> = {
  [ExperienceLevel.Beginner]: new Set([ExerciseCategory.Olympic, ExerciseCategory.Plyometric]),
  [ExperienceLevel.Intermediate]: new Set([ExerciseCategory.Olympic]),
  [ExperienceLevel.Advanced]: new Set(),
  [ExperienceLevel.Elite]: new Set(),
};

const PRIMARY_MUSCLE_MATCH_WEIGHT = 3;
const SECONDARY_MUSCLE_MATCH_WEIGHT = 1;
const MOVEMENT_PATTERN_MATCH_WEIGHT = 4;
const CATEGORY_PREFERENCE_WEIGHT = 2;
const GOAL_CATEGORY_AFFINITY_WEIGHT = 2;
const EXPERIENCE_CATEGORY_PENALTY_WEIGHT = 3;

/**
 * Default, purely deterministic scoring strategy. Combines how well an
 * exercise's muscles, movement pattern, and category align with the
 * selection criteria into a single additive score. Every weight is a named
 * constant so the ranking behavior is auditable and easy to retune without
 * touching the selection algorithm itself.
 */
export class DefaultExerciseScoringStrategy implements ExerciseScoringStrategy {
  score(exercise: ExerciseDefinition, criteria: ExerciseSelectionCriteria): number {
    return (
      this.scoreMuscleMatch(exercise, criteria.targetMuscleGroups) +
      this.scoreMovementPatternMatch(exercise, criteria.requiredMovementPatterns) +
      this.scoreCategoryPreference(exercise, criteria.preferredCategories) +
      this.scoreGoalAffinity(exercise, criteria.goal) +
      this.scoreExperienceSuitability(exercise, criteria.experienceLevel)
    );
  }

  private scoreMuscleMatch(exercise: ExerciseDefinition, targetMuscleGroups: readonly MuscleGroup[]): number {
    const primaryMatches = exercise.primaryMuscles.filter((muscle) => targetMuscleGroups.includes(muscle)).length;
    const secondaryMatches = exercise.secondaryMuscles.filter((muscle) => targetMuscleGroups.includes(muscle)).length;
    return primaryMatches * PRIMARY_MUSCLE_MATCH_WEIGHT + secondaryMatches * SECONDARY_MUSCLE_MATCH_WEIGHT;
  }

  private scoreMovementPatternMatch(
    exercise: ExerciseDefinition,
    requiredMovementPatterns: readonly MovementPattern[],
  ): number {
    return requiredMovementPatterns.includes(exercise.movementPattern) ? MOVEMENT_PATTERN_MATCH_WEIGHT : 0;
  }

  private scoreCategoryPreference(
    exercise: ExerciseDefinition,
    preferredCategories: readonly ExerciseCategory[],
  ): number {
    return preferredCategories.includes(exercise.category) ? CATEGORY_PREFERENCE_WEIGHT : 0;
  }

  private scoreGoalAffinity(exercise: ExerciseDefinition, goal: TrainingGoal): number {
    return GOAL_CATEGORY_AFFINITY[goal].has(exercise.category) ? GOAL_CATEGORY_AFFINITY_WEIGHT : 0;
  }

  private scoreExperienceSuitability(exercise: ExerciseDefinition, experienceLevel: ExperienceLevel): number {
    return EXPERIENCE_CATEGORY_PENALTY[experienceLevel].has(exercise.category)
      ? -EXPERIENCE_CATEGORY_PENALTY_WEIGHT
      : 0;
  }
}

/** An eligible exercise paired with the score it was ranked by. */
interface ScoredExercise {
  readonly exercise: ExerciseDefinition;
  readonly score: number;
}

const DEFAULT_ELIGIBILITY_RULES: readonly ExerciseEligibilityRule[] = [
  new ExcludedExerciseRule(),
  new EquipmentAvailabilityRule(),
  new MuscleRelevanceRule(),
];

/**
 * Deterministic, rule-based implementation of `ExerciseSelector`.
 *
 * Selection happens in two composed stages, each independently swappable:
 *
 * 1. Eligibility — every candidate must satisfy all injected
 *    `ExerciseEligibilityRule`s (exclusion, equipment, muscle relevance).
 *    A candidate that fails any rule is never selected, regardless of score.
 * 2. Scoring — every eligible candidate is ranked by an injected
 *    `ExerciseScoringStrategy` that weighs muscle, movement pattern,
 *    category, goal, and experience-level fit.
 *
 * Both stages are supplied through the constructor rather than hard-coded,
 * so new rules or a new scoring strategy can be composed in without
 * subclassing or modifying this class (Open/Closed), and any caller that
 * only knows about the `ExerciseSelector` contract is unaffected by the
 * swap (Dependency Inversion). There is no randomness anywhere in this
 * pipeline: identical inputs always produce identical, fully ordered
 * output, with remaining ties broken by exercise name and then id.
 */
export class RuleBasedExerciseSelector implements ExerciseSelector {
  private readonly eligibilityRules: readonly ExerciseEligibilityRule[];
  private readonly scoringStrategy: ExerciseScoringStrategy;

  constructor(
    eligibilityRules: readonly ExerciseEligibilityRule[] = DEFAULT_ELIGIBILITY_RULES,
    scoringStrategy: ExerciseScoringStrategy = new DefaultExerciseScoringStrategy(),
  ) {
    this.eligibilityRules = eligibilityRules;
    this.scoringStrategy = scoringStrategy;
  }

  selectExercises(
    catalogue: readonly ExerciseDefinition[],
    criteria: ExerciseSelectionCriteria,
  ): ExerciseSelectionResult {
    const eligible = catalogue.filter((exercise) => this.isEligible(exercise, criteria));
    const ranked = this.rankByScore(eligible, criteria);
    const chosen = this.chooseWithMovementPatternCoverage(ranked, criteria);

    return {
      selections: chosen.map((scored, index) => this.toSelectedExercise(scored, index, criteria)),
    };
  }

  private isEligible(exercise: ExerciseDefinition, criteria: ExerciseSelectionCriteria): boolean {
    return this.eligibilityRules.every((rule) => rule.isSatisfiedBy(exercise, criteria));
  }

  private rankByScore(
    candidates: readonly ExerciseDefinition[],
    criteria: ExerciseSelectionCriteria,
  ): readonly ScoredExercise[] {
    const scored = candidates.map((exercise) => ({
      exercise,
      score: this.scoringStrategy.score(exercise, criteria),
    }));

    return [...scored].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const nameComparison = a.exercise.name.localeCompare(b.exercise.name);
      if (nameComparison !== 0) {
        return nameComparison;
      }
      return String(a.exercise.id).localeCompare(String(b.exercise.id));
    });
  }

  /**
   * Picks the final set of exercises from an already score-sorted list.
   * First guarantees, best-effort, that every required movement pattern is
   * represented by its highest-scoring eligible exercise; then fills any
   * remaining capacity with the next best-scoring exercises overall. The
   * result never exceeds `maxExercises` and never exceeds the number of
   * eligible candidates available.
   */
  private chooseWithMovementPatternCoverage(
    ranked: readonly ScoredExercise[],
    criteria: ExerciseSelectionCriteria,
  ): readonly ScoredExercise[] {
    const capacity = Math.max(0, Math.min(criteria.maxExercises, ranked.length));
    const chosen: ScoredExercise[] = [];
    const chosenIds = new Set<string>();

    const requiredPatterns = Array.from(new Set(criteria.requiredMovementPatterns));
    for (const pattern of requiredPatterns) {
      if (chosen.length >= capacity) {
        break;
      }
      const bestMatch = ranked.find(
        (candidate) => candidate.exercise.movementPattern === pattern && !chosenIds.has(String(candidate.exercise.id)),
      );
      if (bestMatch) {
        chosen.push(bestMatch);
        chosenIds.add(String(bestMatch.exercise.id));
      }
    }

    for (const candidate of ranked) {
      if (chosen.length >= capacity) {
        break;
      }
      if (!chosenIds.has(String(candidate.exercise.id))) {
        chosen.push(candidate);
        chosenIds.add(String(candidate.exercise.id));
      }
    }

    return chosen;
  }

  private toSelectedExercise(
    scored: ScoredExercise,
    order: number,
    criteria: ExerciseSelectionCriteria,
  ): SelectedExercise {
    const allMuscles = [...scored.exercise.primaryMuscles, ...scored.exercise.secondaryMuscles];
    const targetedMuscles =
      criteria.targetMuscleGroups.length === 0
        ? scored.exercise.primaryMuscles
        : allMuscles.filter((muscle) => criteria.targetMuscleGroups.includes(muscle));

    return {
      exerciseId: scored.exercise.id,
      order,
      targetedMuscles: Array.from(new Set(targetedMuscles)),
    };
  }
}
