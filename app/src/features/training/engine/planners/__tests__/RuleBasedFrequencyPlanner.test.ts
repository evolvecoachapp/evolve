import { ExperienceLevel } from "../../../enums/ExperienceLevel";
import { MuscleGroup } from "../../../enums/MuscleGroup";
import { TrainingGoal } from "../../../enums/TrainingGoal";
import { createExerciseLookup } from "../../context/ExerciseLookup";
import type { PlanningContext } from "../../context/PlanningContext";
import type { FrequencyPlanningInput } from "../../contracts/FrequencyPlanner";
import { RuleBasedFrequencyPlanner } from "../RuleBasedFrequencyPlanner";

function buildPlanningContext(overrides: Partial<PlanningContext> = {}): PlanningContext {
  return {
    goal: TrainingGoal.Hypertrophy,
    experienceLevel: ExperienceLevel.Intermediate,
    durationWeeks: 12,
    availableDaysPerWeek: 4,
    availableEquipment: [],
    preferredSplitType: null,
    exerciseLookup: createExerciseLookup([]),
    excludedExerciseIds: [],
    ...overrides,
  };
}

function buildInput(overrides: Partial<FrequencyPlanningInput> = {}): FrequencyPlanningInput {
  return {
    planningContext: buildPlanningContext(),
    targetMuscleGroups: [MuscleGroup.Chest, MuscleGroup.UpperBack, MuscleGroup.Quads],
    ...overrides,
  };
}

const ALL_GOALS = Object.values(TrainingGoal);
const ALL_EXPERIENCE_LEVELS = Object.values(ExperienceLevel);

describe("RuleBasedFrequencyPlanner", () => {
  describe("determinism", () => {
    it("produces identical output for two independently constructed but equivalent inputs", () => {
      const planner = new RuleBasedFrequencyPlanner();

      const resultA = planner.planFrequency(buildInput());
      const resultB = planner.planFrequency(buildInput());

      expect(resultA).toEqual(resultB);
    });

    it("produces identical output across repeated calls with the exact same input object", () => {
      const planner = new RuleBasedFrequencyPlanner();
      const input = buildInput();

      const first = planner.planFrequency(input);
      const second = planner.planFrequency(input);
      const third = planner.planFrequency(input);

      expect(first).toEqual(second);
      expect(second).toEqual(third);
    });

    it("produces identical output from two separate planner instances", () => {
      const input = buildInput();

      const resultA = new RuleBasedFrequencyPlanner().planFrequency(input);
      const resultB = new RuleBasedFrequencyPlanner().planFrequency(input);

      expect(resultA).toEqual(resultB);
    });

    it("does not mutate its input", () => {
      const planner = new RuleBasedFrequencyPlanner();
      const input = buildInput();
      const snapshotBefore = JSON.parse(JSON.stringify({ ...input, exerciseLookup: undefined }));

      planner.planFrequency(input);

      const snapshotAfter = JSON.parse(JSON.stringify({ ...input, exerciseLookup: undefined }));
      expect(snapshotAfter).toEqual(snapshotBefore);
    });
  });

  describe("availability constraint", () => {
    it("never schedules more sessions per week than the athlete has available days for", () => {
      const planner = new RuleBasedFrequencyPlanner();

      for (const goal of ALL_GOALS) {
        for (const experienceLevel of ALL_EXPERIENCE_LEVELS) {
          for (let availableDaysPerWeek = 0; availableDaysPerWeek <= 7; availableDaysPerWeek += 1) {
            const result = planner.planFrequency(
              buildInput({
                planningContext: buildPlanningContext({ goal, experienceLevel, availableDaysPerWeek }),
              }),
            );

            expect(result.sessionsPerWeek).toBeLessThanOrEqual(availableDaysPerWeek);
            expect(result.sessionsPerWeek).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    it("schedules zero sessions when the athlete has zero available days", () => {
      const planner = new RuleBasedFrequencyPlanner();

      const result = planner.planFrequency(
        buildInput({ planningContext: buildPlanningContext({ availableDaysPerWeek: 0 }) }),
      );

      expect(result.sessionsPerWeek).toBe(0);
      expect(result.muscleGroupFrequencies).toEqual([]);
    });

    it("clamps availability above the 7-day microcycle rather than overflowing it", () => {
      const planner = new RuleBasedFrequencyPlanner();

      const result = planner.planFrequency(
        buildInput({
          planningContext: buildPlanningContext({
            availableDaysPerWeek: 14,
            experienceLevel: ExperienceLevel.Elite,
          }),
        }),
      );

      expect(result.sessionsPerWeek).toBeLessThanOrEqual(7);
      expect(result.microcycleLengthDays).toBe(7);
    });
  });

  describe("muscle group frequency output", () => {
    it("never produces a per-muscle frequency below zero or above sessionsPerWeek", () => {
      const planner = new RuleBasedFrequencyPlanner();

      for (const goal of ALL_GOALS) {
        for (const experienceLevel of ALL_EXPERIENCE_LEVELS) {
          const result = planner.planFrequency(
            buildInput({ planningContext: buildPlanningContext({ goal, experienceLevel, availableDaysPerWeek: 6 }) }),
          );

          for (const frequency of result.muscleGroupFrequencies) {
            expect(frequency.sessionsPerWeek).toBeGreaterThanOrEqual(0);
            expect(frequency.sessionsPerWeek).toBeLessThanOrEqual(result.sessionsPerWeek);
            expect(Number.isInteger(frequency.sessionsPerWeek)).toBe(true);
          }
        }
      }
    });

    it("returns one frequency entry per requested target muscle group, in the same order", () => {
      const planner = new RuleBasedFrequencyPlanner();
      const targetMuscleGroups = [MuscleGroup.Chest, MuscleGroup.Lats, MuscleGroup.Hamstrings, MuscleGroup.Calves];

      const result = planner.planFrequency(buildInput({ targetMuscleGroups }));

      expect(result.muscleGroupFrequencies.map((frequency) => frequency.muscleGroup)).toEqual(targetMuscleGroups);
    });

    it("returns an empty frequency list when no target muscle groups are requested", () => {
      const planner = new RuleBasedFrequencyPlanner();

      const result = planner.planFrequency(buildInput({ targetMuscleGroups: [] }));

      expect(result.muscleGroupFrequencies).toEqual([]);
    });
  });

  describe("golden output for a representative intermediate hypertrophy athlete", () => {
    it("matches the exact hand-derived session structure and per-muscle distribution", () => {
      const planner = new RuleBasedFrequencyPlanner();

      const result = planner.planFrequency(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Intermediate,
            availableDaysPerWeek: 5,
          }),
          targetMuscleGroups: [MuscleGroup.Chest, MuscleGroup.UpperBack, MuscleGroup.Quads],
        }),
      );

      expect(result).toEqual({
        sessionsPerWeek: 5,
        microcycleLengthDays: 7,
        muscleGroupFrequencies: [
          { muscleGroup: MuscleGroup.Chest, sessionsPerWeek: 3 },
          { muscleGroup: MuscleGroup.UpperBack, sessionsPerWeek: 3 },
          { muscleGroup: MuscleGroup.Quads, sessionsPerWeek: 2 },
        ],
      });
    });
  });

  describe("goal- and experience-driven session counts", () => {
    it("caps beginners to their experience bounds regardless of a high-frequency goal", () => {
      const planner = new RuleBasedFrequencyPlanner();

      const result = planner.planFrequency(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Beginner,
            availableDaysPerWeek: 7,
          }),
        }),
      );

      expect(result.sessionsPerWeek).toBe(4);
    });

    it("allows elite athletes a wider session ceiling than beginners for the same goal", () => {
      const planner = new RuleBasedFrequencyPlanner();

      const eliteResult = planner.planFrequency(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Elite,
            availableDaysPerWeek: 7,
          }),
        }),
      );
      const beginnerResult = planner.planFrequency(
        buildInput({
          planningContext: buildPlanningContext({
            goal: TrainingGoal.Hypertrophy,
            experienceLevel: ExperienceLevel.Beginner,
            availableDaysPerWeek: 7,
          }),
        }),
      );

      expect(eliteResult.sessionsPerWeek).toBeGreaterThan(beginnerResult.sessionsPerWeek);
    });
  });
});
