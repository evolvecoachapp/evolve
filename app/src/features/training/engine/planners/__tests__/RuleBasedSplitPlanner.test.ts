import { ExperienceLevel } from "../../../enums/ExperienceLevel";
import { MuscleGroup } from "../../../enums/MuscleGroup";
import { SplitType } from "../../../enums/SplitType";
import { TrainingGoal } from "../../../enums/TrainingGoal";
import { createExerciseLookup } from "../../context/ExerciseLookup";
import type { PlanningContext } from "../../context/PlanningContext";
import type { FrequencyPlanningResult } from "../../contracts/FrequencyPlanner";
import type { SplitPlanningInput } from "../../contracts/SplitPlanner";
import { RuleBasedSplitPlanner } from "../RuleBasedSplitPlanner";

function buildPlanningContext(overrides: Partial<PlanningContext> = {}): PlanningContext {
  return {
    goal: TrainingGoal.Hypertrophy,
    experienceLevel: ExperienceLevel.Intermediate,
    durationWeeks: 12,
    availableDaysPerWeek: 5,
    availableEquipment: [],
    preferredSplitType: null,
    exerciseLookup: createExerciseLookup([]),
    excludedExerciseIds: [],
    ...overrides,
  };
}

function buildFrequencyPlan(overrides: Partial<FrequencyPlanningResult> = {}): FrequencyPlanningResult {
  return {
    sessionsPerWeek: 5,
    microcycleLengthDays: 7,
    muscleGroupFrequencies: [],
    ...overrides,
  };
}

function buildInput(overrides: Partial<SplitPlanningInput> = {}): SplitPlanningInput {
  return {
    planningContext: buildPlanningContext(),
    frequencyPlan: buildFrequencyPlan(),
    ...overrides,
  };
}

const PULL_MUSCLES = [
  MuscleGroup.UpperBack,
  MuscleGroup.Lats,
  MuscleGroup.Traps,
  MuscleGroup.Biceps,
  MuscleGroup.Forearms,
];

describe("RuleBasedSplitPlanner", () => {
  describe("determinism", () => {
    it("produces identical output for two independently constructed but equivalent inputs", () => {
      const planner = new RuleBasedSplitPlanner();
      const muscleGroupFrequencies = [
        { muscleGroup: MuscleGroup.Chest, sessionsPerWeek: 2 },
        { muscleGroup: MuscleGroup.Quads, sessionsPerWeek: 2 },
      ];

      const resultA = planner.planSplit(buildInput({ frequencyPlan: buildFrequencyPlan({ muscleGroupFrequencies }) }));
      const resultB = planner.planSplit(buildInput({ frequencyPlan: buildFrequencyPlan({ muscleGroupFrequencies }) }));

      expect(resultA).toEqual(resultB);
    });

    it("produces identical output across repeated calls with the exact same input object", () => {
      const planner = new RuleBasedSplitPlanner();
      const input = buildInput({
        frequencyPlan: buildFrequencyPlan({
          muscleGroupFrequencies: [{ muscleGroup: MuscleGroup.Chest, sessionsPerWeek: 3 }],
        }),
      });

      const first = planner.planSplit(input);
      const second = planner.planSplit(input);

      expect(first).toEqual(second);
    });

    it("produces identical output from two separate planner instances", () => {
      const input = buildInput();

      const resultA = new RuleBasedSplitPlanner().planSplit(input);
      const resultB = new RuleBasedSplitPlanner().planSplit(input);

      expect(resultA).toEqual(resultB);
    });
  });

  describe("split type selection for representative goals", () => {
    const planner = new RuleBasedSplitPlanner();

    it("routes beginners to Full Body when their sessions fit within the beginner ceiling", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({ experienceLevel: ExperienceLevel.Beginner }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 3 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.FullBody);
    });

    it("routes beginners to Upper/Lower once sessions exceed the beginner Full Body ceiling", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({ experienceLevel: ExperienceLevel.Beginner }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 4 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.UpperLower);
    });

    it("routes non-beginner Powerlifting athletes to Powerlifting Specialized once frequency supports it", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Powerlifting,
            experienceLevel: ExperienceLevel.Advanced,
          }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 4 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.PowerliftingSpecialized);
    });

    it("falls back to Full Body for any non-beginner goal when weekly sessions are too low for other archetypes", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Intermediate,
          }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 3 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.FullBody);
    });

    it("routes non-beginner Hybrid athletes to the Hybrid archetype once frequency supports it", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hybrid,
            experienceLevel: ExperienceLevel.Intermediate,
          }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 4 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.Hybrid);
    });

    it("routes strength-focused non-beginner goals to Upper/Lower rather than a three-way split", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Strength,
            experienceLevel: ExperienceLevel.Advanced,
          }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 6 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.UpperLower);
    });

    it("routes non-strength non-beginner goals to Push/Pull/Legs once frequency supports a three-way rotation", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Intermediate,
          }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 5 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.PushPullLegs);
    });

    it("honors an explicit preferredSplitType verbatim, overriding every automatic selection rule", () => {
      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Powerlifting,
            experienceLevel: ExperienceLevel.Beginner,
            preferredSplitType: SplitType.Custom,
          }),
          frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 3 }),
        }),
      );

      expect(result.splitType).toBe(SplitType.Custom);
    });
  });

  describe("day ordering and uniqueness", () => {
    const planner = new RuleBasedSplitPlanner();

    it("returns days sorted ascending by dayIndex, covering every slot of the microcycle exactly once", () => {
      const result = planner.planSplit(buildInput({ frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 4 }) }));

      const dayIndices = result.days.map((day) => day.dayIndex);
      expect(dayIndices).toEqual([...dayIndices].sort((a, b) => a - b));
      expect(dayIndices).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(new Set(dayIndices).size).toBe(dayIndices.length);
    });

    it("never produces duplicated training days for any session count from 0 to 7", () => {
      for (let sessionsPerWeek = 0; sessionsPerWeek <= 7; sessionsPerWeek += 1) {
        const result = planner.planSplit(buildInput({ frequencyPlan: buildFrequencyPlan({ sessionsPerWeek }) }));

        const dayIndices = result.days.map((day) => day.dayIndex);
        expect(new Set(dayIndices).size).toBe(dayIndices.length);

        const trainingDayCount = result.days.filter((day) => !day.isRestDay).length;
        expect(trainingDayCount).toBe(Math.max(0, Math.min(sessionsPerWeek, 7)));
      }
    });

    it("marks every rest day with no primary focus and marks every training day with at least a name", () => {
      const result = planner.planSplit(buildInput({ frequencyPlan: buildFrequencyPlan({ sessionsPerWeek: 3 }) }));

      for (const day of result.days) {
        if (day.isRestDay) {
          expect(day.primaryFocus).toEqual([]);
        } else {
          expect(day.name.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("golden output for a representative Push/Pull/Legs microcycle", () => {
    it("matches the exact hand-derived day layout, template cycling, and muscle placement", () => {
      const planner = new RuleBasedSplitPlanner();

      const result = planner.planSplit(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Intermediate,
          }),
          frequencyPlan: buildFrequencyPlan({
            sessionsPerWeek: 5,
            microcycleLengthDays: 7,
            muscleGroupFrequencies: [
              { muscleGroup: MuscleGroup.Chest, sessionsPerWeek: 2 },
              { muscleGroup: MuscleGroup.Quads, sessionsPerWeek: 2 },
            ],
          }),
        }),
      );

      expect(result.splitType).toBe(SplitType.PushPullLegs);
      expect(result.cycleLengthDays).toBe(7);
      expect(result.days).toEqual([
        { dayIndex: 0, name: "Push", isRestDay: false, primaryFocus: [MuscleGroup.Chest] },
        { dayIndex: 1, name: "Pull", isRestDay: false, primaryFocus: PULL_MUSCLES },
        { dayIndex: 2, name: "Legs", isRestDay: false, primaryFocus: [MuscleGroup.Quads] },
        { dayIndex: 3, name: "Rest Day", isRestDay: true, primaryFocus: [] },
        { dayIndex: 4, name: "Push", isRestDay: false, primaryFocus: [MuscleGroup.Chest] },
        { dayIndex: 5, name: "Pull", isRestDay: false, primaryFocus: PULL_MUSCLES },
        { dayIndex: 6, name: "Rest Day", isRestDay: true, primaryFocus: [] },
      ]);
    });
  });

  describe("degenerate inputs", () => {
    it("returns no days at all when the microcycle has zero length", () => {
      const planner = new RuleBasedSplitPlanner();

      const result = planner.planSplit(buildInput({ frequencyPlan: buildFrequencyPlan({ microcycleLengthDays: 0 }) }));

      expect(result.days).toEqual([]);
      expect(result.cycleLengthDays).toBe(0);
    });
  });
});
