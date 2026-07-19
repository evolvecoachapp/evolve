import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { MuscleGroup } from "../../enums/MuscleGroup";
import { SplitType } from "../../enums/SplitType";
import { TrainingGoal } from "../../enums/TrainingGoal";
import type { MuscleGroupFrequency } from "../contracts/FrequencyPlanner";
import type {
  SplitPlanner,
  SplitPlanningInput,
  SplitPlanningResult,
  TrainingDayBlueprint,
} from "../contracts/SplitPlanner";

/**
 * A single recurring day-slot within a split's weekly rotation, before any
 * specific target muscles are bound to it. `muscleGroups: null` marks a
 * "wildcard" day (e.g. Full Body, or a Powerlifting accessory day) that may
 * absorb any muscle group rather than a fixed subset — this is what lets
 * `FullBody` and the generic fallback used for `Custom` share the exact
 * same assignment logic as every named archetype below.
 */
export interface SplitDayTemplate {
  readonly name: string;
  readonly muscleGroups: readonly MuscleGroup[] | null;
}

/**
 * Decides which `SplitType` to build when the caller has no preference.
 * Kept separate from day-structure and muscle-assignment concerns so the
 * "which philosophy fits this goal/experience/frequency" decision can be
 * retuned or replaced independently of how a chosen split is actually laid
 * out.
 */
export interface SplitTypeSelector {
  selectSplitType(input: SplitPlanningInput): SplitType;
}

/**
 * Resolves the repeating sequence of `SplitDayTemplate`s that defines a
 * `SplitType`'s shape (e.g. Push/Pull/Legs, Upper/Lower). Returning `null`
 * signals "no fixed archetype is registered for this split type" rather
 * than an error — the planner falls back to a single wildcard template in
 * that case, which is exactly how `Custom` degrades gracefully, and how a
 * brand-new `SplitType` would behave until someone registers a dedicated
 * template set for it via the constructor-injected override map.
 */
export interface SplitDayTemplateProvider {
  getDayTemplates(splitType: SplitType): readonly SplitDayTemplate[] | null;
}

/**
 * Decides which of a microcycle's `cycleLengthDays` day-slots are training
 * days versus rest days, given only how many sessions the week must
 * contain. Isolated from muscle assignment so "how many days, spaced how"
 * and "which muscle goes where" remain independently testable.
 */
export interface DayLayoutStrategy {
  resolveTrainingDayFlags(sessionsPerWeek: number, cycleLengthDays: number): readonly boolean[];
}

/**
 * Binds each `MuscleGroupFrequency` from the frequency plan to specific
 * training day-slots, honoring each muscle's target weekly frequency,
 * each day's template constraints, and priority order (index order, per
 * the same convention `RuleBasedFrequencyPlanner` and
 * `RuleBasedVolumePlanner` use for their own priority-ordered inputs).
 */
export interface MuscleGroupAssignmentStrategy {
  assignMuscleGroups(
    trainingDayIndices: readonly number[],
    templateByDayIndex: ReadonlyMap<number, SplitDayTemplate>,
    muscleGroupFrequencies: readonly MuscleGroupFrequency[],
  ): ReadonlyMap<number, readonly MuscleGroup[]>;
}

/** Single wildcard day-slot used whenever a `SplitType` has no registered template set. */
const FALLBACK_TEMPLATE_SET: readonly SplitDayTemplate[] = [{ name: "Training Day", muscleGroups: null }];

const UPPER_BODY_MUSCLES: readonly MuscleGroup[] = [
  MuscleGroup.Chest,
  MuscleGroup.UpperBack,
  MuscleGroup.Lats,
  MuscleGroup.Traps,
  MuscleGroup.Shoulders,
  MuscleGroup.Biceps,
  MuscleGroup.Triceps,
  MuscleGroup.Forearms,
];

const LOWER_BODY_MUSCLES: readonly MuscleGroup[] = [
  MuscleGroup.Quads,
  MuscleGroup.Hamstrings,
  MuscleGroup.Glutes,
  MuscleGroup.Calves,
  MuscleGroup.LowerBack,
  MuscleGroup.Core,
];

/**
 * Default archetype registry, keyed by `SplitType`. `Custom` is
 * intentionally absent: it always resolves through
 * `DefaultSplitDayTemplateProvider.getDayTemplates` returning `null`, which
 * the planner turns into `FALLBACK_TEMPLATE_SET` — a deliberate design
 * choice so a truly custom split degrades to "spread requested muscles
 * evenly across every training day" instead of guessing at a shape. Any
 * future split archetype (including a bespoke `Custom` variant) can be
 * added without touching this file by passing an override map into
 * `DefaultSplitDayTemplateProvider`'s constructor.
 */
const DEFAULT_SPLIT_DAY_TEMPLATES: ReadonlyMap<SplitType, readonly SplitDayTemplate[]> = new Map([
  [SplitType.FullBody, [{ name: "Full Body", muscleGroups: null }]],
  [
    SplitType.UpperLower,
    [
      { name: "Upper Body", muscleGroups: UPPER_BODY_MUSCLES },
      { name: "Lower Body", muscleGroups: LOWER_BODY_MUSCLES },
    ],
  ],
  [
    SplitType.PushPullLegs,
    [
      { name: "Push", muscleGroups: [MuscleGroup.Chest, MuscleGroup.Shoulders, MuscleGroup.Triceps] },
      {
        name: "Pull",
        muscleGroups: [MuscleGroup.UpperBack, MuscleGroup.Lats, MuscleGroup.Traps, MuscleGroup.Biceps, MuscleGroup.Forearms],
      },
      { name: "Legs", muscleGroups: LOWER_BODY_MUSCLES },
    ],
  ],
  [
    SplitType.BroSplit,
    [
      { name: "Chest", muscleGroups: [MuscleGroup.Chest] },
      { name: "Back", muscleGroups: [MuscleGroup.UpperBack, MuscleGroup.Lats, MuscleGroup.Traps, MuscleGroup.LowerBack] },
      { name: "Shoulders", muscleGroups: [MuscleGroup.Shoulders] },
      { name: "Arms", muscleGroups: [MuscleGroup.Biceps, MuscleGroup.Triceps, MuscleGroup.Forearms] },
      {
        name: "Legs",
        muscleGroups: [MuscleGroup.Quads, MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.Calves, MuscleGroup.Core],
      },
    ],
  ],
  [
    SplitType.PowerliftingSpecialized,
    [
      { name: "Squat Day", muscleGroups: [MuscleGroup.Quads, MuscleGroup.Glutes, MuscleGroup.LowerBack, MuscleGroup.Core] },
      { name: "Bench Day", muscleGroups: [MuscleGroup.Chest, MuscleGroup.Triceps, MuscleGroup.Shoulders] },
      {
        name: "Deadlift Day",
        muscleGroups: [MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.LowerBack, MuscleGroup.UpperBack],
      },
      { name: "Accessory Day", muscleGroups: null },
    ],
  ],
  [
    SplitType.Conjugate,
    [
      {
        name: "Max Effort Lower",
        muscleGroups: [MuscleGroup.Quads, MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.LowerBack],
      },
      { name: "Max Effort Upper", muscleGroups: [MuscleGroup.Chest, MuscleGroup.Shoulders, MuscleGroup.Triceps] },
      {
        name: "Dynamic Effort Lower",
        muscleGroups: [MuscleGroup.Quads, MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.Calves, MuscleGroup.Core],
      },
      {
        name: "Dynamic Effort Upper",
        muscleGroups: [
          MuscleGroup.Chest,
          MuscleGroup.UpperBack,
          MuscleGroup.Lats,
          MuscleGroup.Biceps,
          MuscleGroup.Forearms,
          MuscleGroup.Traps,
        ],
      },
    ],
  ],
  [
    SplitType.Hybrid,
    [
      { name: "Full Body Strength", muscleGroups: null },
      { name: "Upper Body", muscleGroups: UPPER_BODY_MUSCLES },
      { name: "Lower Body", muscleGroups: LOWER_BODY_MUSCLES },
    ],
  ],
]);

/**
 * Default, purely deterministic template registry.
 *
 * Looks up the built-in archetype for a `SplitType` first, then falls back
 * to any `additionalTemplates` supplied at construction time — the seam
 * that lets callers register future custom split generators (new
 * `SplitType` values, or a bespoke shape for `Custom`) without modifying
 * this class (Open/Closed).
 */
export class DefaultSplitDayTemplateProvider implements SplitDayTemplateProvider {
  private readonly templatesBySplitType: ReadonlyMap<SplitType, readonly SplitDayTemplate[]>;

  constructor(additionalTemplates: ReadonlyMap<SplitType, readonly SplitDayTemplate[]> = new Map()) {
    this.templatesBySplitType = new Map([...DEFAULT_SPLIT_DAY_TEMPLATES, ...additionalTemplates]);
  }

  getDayTemplates(splitType: SplitType): readonly SplitDayTemplate[] | null {
    return this.templatesBySplitType.get(splitType) ?? null;
  }
}

/** Goals whose programming is organized around maximal-load barbell lifts rather than muscle-group balance. */
const STRENGTH_FOCUSED_GOALS: ReadonlySet<TrainingGoal> = new Set([TrainingGoal.Powerlifting, TrainingGoal.Strength]);

/** Minimum weekly sessions required before a specialized (Powerlifting) split has room to dedicate a day per lift. */
const MIN_SESSIONS_FOR_SPECIALIZED_SPLIT = 4;

/** Minimum weekly sessions required before a three-way rotation (Push/Pull/Legs) can complete without truncation. */
const MIN_SESSIONS_FOR_THREE_WAY_SPLIT = 5;

/**
 * Ceiling on weekly sessions a beginner is routed through Upper/Lower
 * rather than Full Body. Beginners are deliberately excluded from every
 * higher-complexity split regardless of goal: they get the fewest distinct
 * day archetypes their frequency plan can support, protecting technique
 * acquisition and recovery the same way `RuleBasedFrequencyPlanner` bounds
 * their session count tightly.
 */
const BEGINNER_FULL_BODY_MAX_SESSIONS = 3;

/**
 * Default, purely deterministic split-type selection.
 *
 * Resolves in priority order: experience level first (beginners are always
 * capped to Full Body or Upper/Lower), then goal (Powerlifting and Hybrid
 * route to their dedicated archetypes when frequency supports them), then
 * plain session-count thresholds for everyone else. Every threshold is a
 * named constant so the decision is auditable and easy to retune.
 */
export class DefaultSplitTypeSelector implements SplitTypeSelector {
  selectSplitType(input: SplitPlanningInput): SplitType {
    const sessionsPerWeek = input.frequencyPlan.sessionsPerWeek;

    if (sessionsPerWeek <= 0) {
      return SplitType.FullBody;
    }

    if (input.experienceLevel === ExperienceLevel.Beginner) {
      return sessionsPerWeek <= BEGINNER_FULL_BODY_MAX_SESSIONS ? SplitType.FullBody : SplitType.UpperLower;
    }

    if (input.goal === TrainingGoal.Powerlifting && sessionsPerWeek >= MIN_SESSIONS_FOR_SPECIALIZED_SPLIT) {
      return SplitType.PowerliftingSpecialized;
    }
    if (sessionsPerWeek < MIN_SESSIONS_FOR_SPECIALIZED_SPLIT) {
      return SplitType.FullBody;
    }
    if (input.goal === TrainingGoal.Hybrid) {
      return SplitType.Hybrid;
    }
    if (STRENGTH_FOCUSED_GOALS.has(input.goal) || sessionsPerWeek < MIN_SESSIONS_FOR_THREE_WAY_SPLIT) {
      return SplitType.UpperLower;
    }
    return SplitType.PushPullLegs;
  }
}

/**
 * Default, purely deterministic day-layout resolution.
 *
 * Spreads `sessionsPerWeek` training days across `cycleLengthDays` slots
 * using the same even-distribution technique as a Bresenham line: session
 * `k`'s day-slot is `floor(k * cycleLengthDays / sessionsPerWeek)`. This
 * guarantees training days are as far apart as the week's geometry allows
 * — the day-level half of "maximize recovery spacing" — before any muscle
 * is ever assigned to a specific day.
 */
export class DefaultDayLayoutStrategy implements DayLayoutStrategy {
  resolveTrainingDayFlags(sessionsPerWeek: number, cycleLengthDays: number): readonly boolean[] {
    if (cycleLengthDays <= 0) {
      return [];
    }

    const flags = new Array<boolean>(cycleLengthDays).fill(false);
    const clampedSessions = Math.max(0, Math.min(Math.round(sessionsPerWeek), cycleLengthDays));

    for (let session = 0; session < clampedSessions; session += 1) {
      const dayIndex = Math.floor((session * cycleLengthDays) / clampedSessions);
      flags[dayIndex] = true;
    }

    return flags;
  }
}

/**
 * Default, purely deterministic muscle-to-day assignment.
 *
 * Every `MuscleGroupFrequency` is processed independently, in the priority
 * order it already arrives in (mirroring the priority-by-index convention
 * used elsewhere in the engine):
 *
 * 1. Eligible days — the training days whose template either has no fixed
 *    muscle list (a wildcard day) or explicitly includes this muscle
 *    group. A muscle can never land on a day whose archetype does not
 *    call for it.
 * 2. Target count — the muscle's desired `sessionsPerWeek`, capped to
 *    however many eligible days actually exist; a muscle can never be
 *    scheduled more often than its archetype days occur.
 * 3. Placement — `selectEvenlySpaced` spreads that many hits across the
 *    eligible days using the same Bresenham-style distribution
 *    `DefaultDayLayoutStrategy` uses for training vs. rest days, so a
 *    muscle group's own repeat visits land as far apart as its eligible
 *    days allow.
 *
 * Because eligible days are already spread across the week (each
 * archetype's occurrences are themselves evenly distributed by
 * `RuleBasedSplitPlanner` before this strategy ever runs), and step 3
 * further spaces a muscle's specific hits evenly among just its eligible
 * days, two hits of the same muscle group only ever land on adjacent
 * training days when there is no alternative — e.g. a single eligible day,
 * or a target frequency that consumes nearly every eligible day. That is
 * precisely the "avoid consecutive heavy overlap" requirement expressed as
 * an emergent property of even spacing, rather than a separate ad hoc
 * adjacency check that could contradict it.
 */
export class DefaultMuscleGroupAssignmentStrategy implements MuscleGroupAssignmentStrategy {
  assignMuscleGroups(
    trainingDayIndices: readonly number[],
    templateByDayIndex: ReadonlyMap<number, SplitDayTemplate>,
    muscleGroupFrequencies: readonly MuscleGroupFrequency[],
  ): ReadonlyMap<number, readonly MuscleGroup[]> {
    const assignments = new Map<number, MuscleGroup[]>(trainingDayIndices.map((dayIndex) => [dayIndex, []]));

    for (const frequency of muscleGroupFrequencies) {
      const eligibleDays = this.resolveEligibleDays(trainingDayIndices, templateByDayIndex, frequency.muscleGroup);
      if (eligibleDays.length === 0) {
        continue;
      }

      const targetCount = Math.max(0, Math.min(Math.round(frequency.sessionsPerWeek), eligibleDays.length));
      for (const dayIndex of this.selectEvenlySpaced(eligibleDays, targetCount)) {
        assignments.get(dayIndex)?.push(frequency.muscleGroup);
      }
    }

    return assignments;
  }

  private resolveEligibleDays(
    trainingDayIndices: readonly number[],
    templateByDayIndex: ReadonlyMap<number, SplitDayTemplate>,
    muscleGroup: MuscleGroup,
  ): readonly number[] {
    return trainingDayIndices.filter((dayIndex) => {
      const muscleGroups = templateByDayIndex.get(dayIndex)?.muscleGroups ?? null;
      return muscleGroups === null || muscleGroups.includes(muscleGroup);
    });
  }

  /**
   * Chooses `count` entries out of `eligibleDays` (already ascending by
   * day index), spread as evenly as possible via the same even-index
   * technique `DefaultDayLayoutStrategy` uses: pick `floor(k * length /
   * count)` for each `k`, so the chosen positions are maximally spaced
   * within the eligible list rather than clustered at one end of the week.
   */
  private selectEvenlySpaced(eligibleDays: readonly number[], count: number): readonly number[] {
    if (count <= 0) {
      return [];
    }
    if (count >= eligibleDays.length) {
      return eligibleDays;
    }

    const chosen: number[] = [];
    for (let k = 0; k < count; k += 1) {
      const index = Math.floor((k * eligibleDays.length) / count);
      chosen.push(eligibleDays[index]);
    }
    return chosen;
  }
}

/**
 * Deterministic, rule-based implementation of `SplitPlanner`.
 *
 * Planning happens in four composed, independently swappable stages, all
 * supplied through the constructor rather than hard-coded (Open/Closed,
 * Dependency Inversion) so a new split philosophy — or a future custom
 * split generator — can be introduced without touching this class or any
 * caller that only knows about the `SplitPlanner` contract:
 *
 * 1. Split-type resolution — honors `input.preferredSplitType` verbatim
 *    when the caller supplies one; otherwise a `SplitTypeSelector` picks
 *    one of Full Body, Upper/Lower, Push/Pull/Legs, Bro Split, Powerlifting
 *    Specialized, Conjugate, or Hybrid from goal, experience, and the
 *    frequency plan's session count. `Custom` is only ever produced by an
 *    explicit `preferredSplitType`, never selected automatically.
 * 2. Day layout — a `DayLayoutStrategy` spreads the frequency plan's
 *    `sessionsPerWeek` training days evenly across the microcycle,
 *    maximizing whole-day recovery spacing before any muscle is placed.
 * 3. Template assignment — a `SplitDayTemplateProvider` resolves the split
 *    type's repeating day-archetype sequence (e.g. Push, Pull, Legs),
 *    cycling it across the training days in occurrence order. A split type
 *    with no registered archetype (any future `SplitType`, and always
 *    `Custom`) falls back to a single wildcard template, so every target
 *    muscle group is simply spread evenly across all training days.
 * 4. Muscle assignment — a `MuscleGroupAssignmentStrategy` binds each of
 *    `frequencyPlan.muscleGroupFrequencies` (already priority-ordered by
 *    list position, per engine convention) to specific training days,
 *    honoring each day's template constraints and spacing repeat hits of
 *    the same muscle group as far apart as the eligible days allow.
 *
 * `frequencyPlan` is consumed, never re-derived: this planner only decides
 * *shape* (which days train what), leaving *how much* strictly to the
 * already-computed `FrequencyPlanningResult`, so frequency and split-shape
 * decisions stay independent per the `SplitPlanner` contract. There is no
 * randomness, network access, persistence, or UI concern anywhere in this
 * pipeline: identical inputs always produce identical, fully immutable
 * output.
 */
export class RuleBasedSplitPlanner implements SplitPlanner {
  private readonly splitTypeSelector: SplitTypeSelector;
  private readonly dayTemplateProvider: SplitDayTemplateProvider;
  private readonly dayLayoutStrategy: DayLayoutStrategy;
  private readonly muscleGroupAssignmentStrategy: MuscleGroupAssignmentStrategy;

  constructor(
    splitTypeSelector: SplitTypeSelector = new DefaultSplitTypeSelector(),
    dayTemplateProvider: SplitDayTemplateProvider = new DefaultSplitDayTemplateProvider(),
    dayLayoutStrategy: DayLayoutStrategy = new DefaultDayLayoutStrategy(),
    muscleGroupAssignmentStrategy: MuscleGroupAssignmentStrategy = new DefaultMuscleGroupAssignmentStrategy(),
  ) {
    this.splitTypeSelector = splitTypeSelector;
    this.dayTemplateProvider = dayTemplateProvider;
    this.dayLayoutStrategy = dayLayoutStrategy;
    this.muscleGroupAssignmentStrategy = muscleGroupAssignmentStrategy;
  }

  planSplit(input: SplitPlanningInput): SplitPlanningResult {
    const splitType = input.preferredSplitType ?? this.splitTypeSelector.selectSplitType(input);
    const cycleLengthDays = input.frequencyPlan.microcycleLengthDays;

    if (cycleLengthDays <= 0) {
      return { splitType, cycleLengthDays: 0, days: [] };
    }

    const templates = this.dayTemplateProvider.getDayTemplates(splitType) ?? FALLBACK_TEMPLATE_SET;
    const trainingDayFlags = this.dayLayoutStrategy.resolveTrainingDayFlags(
      input.frequencyPlan.sessionsPerWeek,
      cycleLengthDays,
    );
    const trainingDayIndices = this.collectTrainingDayIndices(trainingDayFlags);
    const templateByDayIndex = this.resolveTemplateByDayIndex(trainingDayIndices, templates);

    const assignmentsByDay = this.muscleGroupAssignmentStrategy.assignMuscleGroups(
      trainingDayIndices,
      templateByDayIndex,
      input.frequencyPlan.muscleGroupFrequencies,
    );

    const allTargetMuscleGroups = input.frequencyPlan.muscleGroupFrequencies.map((frequency) => frequency.muscleGroup);
    const days = trainingDayFlags.map((isTrainingDay, dayIndex) =>
      this.buildDayBlueprint(
        dayIndex,
        isTrainingDay,
        templateByDayIndex.get(dayIndex),
        assignmentsByDay.get(dayIndex),
        allTargetMuscleGroups,
      ),
    );

    return { splitType, cycleLengthDays, days };
  }

  private collectTrainingDayIndices(trainingDayFlags: readonly boolean[]): readonly number[] {
    const indices: number[] = [];
    trainingDayFlags.forEach((isTrainingDay, dayIndex) => {
      if (isTrainingDay) {
        indices.push(dayIndex);
      }
    });
    return indices;
  }

  /** Cycles `templates` across training days in occurrence order, e.g. Push, Pull, Legs, Push, Pull, Legs, ... */
  private resolveTemplateByDayIndex(
    trainingDayIndices: readonly number[],
    templates: readonly SplitDayTemplate[],
  ): ReadonlyMap<number, SplitDayTemplate> {
    return new Map(
      trainingDayIndices.map((dayIndex, occurrence) => [dayIndex, templates[occurrence % templates.length]]),
    );
  }

  /**
   * Falls back in two tiers when the assignment strategy placed nothing on
   * a training day (only possible when there are fewer target muscles
   * than day-slots to fill): a fixed-bucket template (e.g. Bench Day)
   * falls back to its own archetype muscles, since that identity holds
   * regardless of what was explicitly requested; a wildcard template (e.g.
   * Full Body, or the generic `Custom` fallback) falls back to every
   * requested target muscle, since "wildcard" means the day is meant to
   * train whatever the plan calls for as a whole.
   */
  private buildDayBlueprint(
    dayIndex: number,
    isTrainingDay: boolean,
    template: SplitDayTemplate | undefined,
    assignedMuscles: readonly MuscleGroup[] | undefined,
    allTargetMuscleGroups: readonly MuscleGroup[],
  ): TrainingDayBlueprint {
    if (!isTrainingDay || !template) {
      return { dayIndex, name: "Rest Day", isRestDay: true, primaryFocus: [] };
    }

    const hasAssignments = assignedMuscles !== undefined && assignedMuscles.length > 0;
    const primaryFocus = hasAssignments ? assignedMuscles : template.muscleGroups ?? allTargetMuscleGroups;

    return { dayIndex, name: template.name, isRestDay: false, primaryFocus };
  }
}
