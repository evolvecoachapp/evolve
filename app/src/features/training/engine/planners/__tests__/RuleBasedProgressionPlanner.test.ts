import { EquipmentType } from "../../../enums/EquipmentType";
import { ExerciseCategory } from "../../../enums/ExerciseCategory";
import { ExperienceLevel } from "../../../enums/ExperienceLevel";
import { MovementPattern } from "../../../enums/MovementPattern";
import { ProgressionModel } from "../../../enums/ProgressionModel";
import { TrainingGoal } from "../../../enums/TrainingGoal";
import { WeightUnit } from "../../../enums/WeightUnit";
import type { ExerciseDefinition } from "../../../models/ExerciseDefinition";
import type { ExerciseId } from "../../../types/ids";
import { createExerciseLookup } from "../../context/ExerciseLookup";
import type { PlanningContext } from "../../context/PlanningContext";
import type { ProgressionPlanningInput } from "../../contracts/ProgressionPlanner";
import { RuleBasedProgressionPlanner } from "../RuleBasedProgressionPlanner";

function id(value: string): ExerciseId {
  return value as ExerciseId;
}

function buildExercise(overrides: Partial<ExerciseDefinition> = {}): ExerciseDefinition {
  return {
    id: id("ex-generic"),
    name: "Generic Exercise",
    category: ExerciseCategory.Compound,
    movementPattern: MovementPattern.HorizontalPush,
    primaryMuscles: [],
    secondaryMuscles: [],
    equipment: [EquipmentType.Barbell],
    isUnilateral: false,
    isBodyweight: false,
    notes: null,
    ...overrides,
  };
}

function buildPlanningContext(
  catalogue: readonly ExerciseDefinition[],
  overrides: Partial<PlanningContext> = {},
): PlanningContext {
  return {
    goal: TrainingGoal.Hypertrophy,
    experienceLevel: ExperienceLevel.Intermediate,
    durationWeeks: 12,
    availableDaysPerWeek: 4,
    availableEquipment: [],
    preferredSplitType: null,
    exerciseLookup: createExerciseLookup(catalogue),
    excludedExerciseIds: [],
    ...overrides,
  };
}

function buildInput(
  exercise: ExerciseDefinition,
  planningContextOverrides: Partial<PlanningContext> = {},
): ProgressionPlanningInput {
  return {
    planningContext: buildPlanningContext([exercise], planningContextOverrides),
    exerciseId: exercise.id,
    exerciseCategory: exercise.category,
  };
}

describe("RuleBasedProgressionPlanner", () => {
  describe("determinism", () => {
    it("produces identical output for two independently constructed but equivalent inputs", () => {
      const planner = new RuleBasedProgressionPlanner();
      const exercise = buildExercise({ id: id("squat"), movementPattern: MovementPattern.Squat });

      const resultA = planner.planProgression(buildInput(exercise));
      const resultB = planner.planProgression(buildInput(exercise));

      expect(resultA).toEqual(resultB);
    });

    it("produces identical output across repeated calls with the exact same input object", () => {
      const planner = new RuleBasedProgressionPlanner();
      const input = buildInput(buildExercise({ id: id("row"), movementPattern: MovementPattern.HorizontalPull }));

      const first = planner.planProgression(input);
      const second = planner.planProgression(input);

      expect(first).toEqual(second);
    });

    it("is deterministic across every goal/experience/category/movement-pattern combination", () => {
      const planner = new RuleBasedProgressionPlanner();

      for (const goal of Object.values(TrainingGoal)) {
        for (const experienceLevel of Object.values(ExperienceLevel)) {
          for (const category of Object.values(ExerciseCategory)) {
            for (const movementPattern of Object.values(MovementPattern)) {
              const exercise = buildExercise({ id: id("x"), category, movementPattern });
              const input = buildInput(exercise, { goal, experienceLevel });

              const resultA = planner.planProgression(input);
              const resultB = planner.planProgression(input);

              expect(resultA).toEqual(resultB);
            }
          }
        }
      }
    });
  });

  describe("progression model selection for representative scenarios", () => {
    const planner = new RuleBasedProgressionPlanner();

    it("always selects Static for cardio work, regardless of goal or experience", () => {
      const exercise = buildExercise({ id: id("run"), category: ExerciseCategory.Cardio });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Endurance, experienceLevel: ExperienceLevel.Elite }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.Static);
    });

    it("always selects Static for mobility work, regardless of goal or experience", () => {
      const exercise = buildExercise({ id: id("stretch"), category: ExerciseCategory.Mobility });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Powerlifting, experienceLevel: ExperienceLevel.Beginner }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.Static);
    });

    it("always selects Linear for beginners, regardless of goal or movement pattern", () => {
      const exercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.Carry,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Powerlifting, experienceLevel: ExperienceLevel.Beginner }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.Linear);
    });

    it("selects Double Progression for skill/stability movement patterns past the beginner stage", () => {
      const exercise = buildExercise({
        id: id("carry"),
        category: ExerciseCategory.Accessory,
        movementPattern: MovementPattern.Carry,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Powerlifting, experienceLevel: ExperienceLevel.Intermediate }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.DoubleProgression);
    });

    it("selects Autoregulated RPE for hybrid/powerbuilding goals once experience is trusted to self-assess", () => {
      const exercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.HorizontalPush,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Powerbuilding, experienceLevel: ExperienceLevel.Advanced }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.AutoregulatedRpe);
    });

    it("does not apply the RPE override for hybrid/powerbuilding goals below the trusted experience threshold", () => {
      const exercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.HorizontalPush,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Powerbuilding, experienceLevel: ExperienceLevel.Intermediate }),
      );

      expect(result.progressionScheme.model).not.toBe(ProgressionModel.AutoregulatedRpe);
    });

    it("selects Block periodization for heavy-strength goals past the beginner stage", () => {
      const exercise = buildExercise({
        id: id("deadlift"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.Hinge,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Strength, experienceLevel: ExperienceLevel.Advanced }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.Block);
    });

    it("selects Double Progression for hypertrophy/bodybuilding goals past the beginner stage", () => {
      const exercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.HorizontalPush,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Bodybuilding, experienceLevel: ExperienceLevel.Intermediate }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.DoubleProgression);
    });

    it("falls back to the experience-level baseline model when no override applies", () => {
      const exercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.HorizontalPush,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.GeneralFitness, experienceLevel: ExperienceLevel.Advanced }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.Undulating);
    });
  });

  describe("increment strategy", () => {
    const planner = new RuleBasedProgressionPlanner();

    it("assigns a non-null increment for increment-eligible models (Linear, Double Progression)", () => {
      const exercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.HorizontalPush,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Bodybuilding, experienceLevel: ExperienceLevel.Intermediate }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.DoubleProgression);
      expect(result.progressionScheme.incrementValue).toBe(2.5);
      expect(result.progressionScheme.incrementUnit).toBe(WeightUnit.Kilograms);
    });

    it("assigns no increment for models that do not progress via a flat load jump", () => {
      const exercise = buildExercise({
        id: id("deadlift"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.Hinge,
      });
      const result = planner.planProgression(
        buildInput(exercise, { goal: TrainingGoal.Strength, experienceLevel: ExperienceLevel.Advanced }),
      );

      expect(result.progressionScheme.model).toBe(ProgressionModel.Block);
      expect(result.progressionScheme.incrementValue).toBeNull();
      expect(result.progressionScheme.incrementUnit).toBeNull();
    });

    it("halves the increment for advanced/elite athletes relative to beginners/intermediates", () => {
      const noviceExercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.HorizontalPush,
      });
      const noviceResult = planner.planProgression(
        buildInput(noviceExercise, { goal: TrainingGoal.Bodybuilding, experienceLevel: ExperienceLevel.Intermediate }),
      );
      const eliteExercise = buildExercise({
        id: id("bench"),
        category: ExerciseCategory.Compound,
        movementPattern: MovementPattern.HorizontalPush,
      });
      const eliteResult = planner.planProgression(
        buildInput(eliteExercise, { goal: TrainingGoal.Bodybuilding, experienceLevel: ExperienceLevel.Elite }),
      );

      expect(noviceResult.progressionScheme.incrementValue).toBe(2.5);
      expect(eliteResult.progressionScheme.incrementValue).toBe(1.25);
    });

    it("falls back to the category's base increment when the exercise is absent from the catalogue lookup", () => {
      const planningContext = buildPlanningContext([], { experienceLevel: ExperienceLevel.Beginner });
      const result = planner.planProgression({
        planningContext,
        exerciseId: id("unknown-exercise"),
        exerciseCategory: ExerciseCategory.Accessory,
      });

      expect(result.progressionScheme.model).toBe(ProgressionModel.Linear);
      expect(result.progressionScheme.incrementValue).toBe(1.25);
      expect(result.progressionScheme.incrementUnit).toBe(WeightUnit.Kilograms);
    });

    it("never produces a negative increment value across the full goal/experience/pattern matrix", () => {
      for (const goal of Object.values(TrainingGoal)) {
        for (const experienceLevel of Object.values(ExperienceLevel)) {
          for (const movementPattern of Object.values(MovementPattern)) {
            const exercise = buildExercise({ id: id("x"), category: ExerciseCategory.Compound, movementPattern });
            const result = planner.planProgression(buildInput(exercise, { goal, experienceLevel }));

            if (result.progressionScheme.incrementValue !== null) {
              expect(result.progressionScheme.incrementValue).toBeGreaterThan(0);
            }
          }
        }
      }
    });
  });

  describe("deload cadence", () => {
    const planner = new RuleBasedProgressionPlanner();

    it("never schedules a deload for beginners", () => {
      const exercise = buildExercise({ id: id("bench"), category: ExerciseCategory.Compound });
      const result = planner.planProgression(
        buildInput(exercise, {
          experienceLevel: ExperienceLevel.Beginner,
          goal: TrainingGoal.Hypertrophy,
          durationWeeks: 52,
        }),
      );

      expect(result.progressionScheme.deloadFrequencyWeeks).toBeNull();
    });

    it("never schedules a deload for cardio or mobility work, regardless of experience", () => {
      const exercise = buildExercise({ id: id("run"), category: ExerciseCategory.Cardio });
      const result = planner.planProgression(
        buildInput(exercise, { experienceLevel: ExperienceLevel.Elite, durationWeeks: 52 }),
      );

      expect(result.progressionScheme.deloadFrequencyWeeks).toBeNull();
    });

    it("uses the experience baseline cadence, adjusted by the goal's fatigue profile, for a long enough program", () => {
      const exercise = buildExercise({ id: id("bench"), category: ExerciseCategory.Compound });
      const result = planner.planProgression(
        buildInput(exercise, {
          experienceLevel: ExperienceLevel.Intermediate,
          goal: TrainingGoal.Hypertrophy,
          durationWeeks: 12,
        }),
      );

      expect(result.progressionScheme.deloadFrequencyWeeks).toBe(6);
    });

    it("shortens the cadence for heavy-strength goals", () => {
      const exercise = buildExercise({ id: id("squat"), category: ExerciseCategory.Compound });
      const result = planner.planProgression(
        buildInput(exercise, {
          experienceLevel: ExperienceLevel.Intermediate,
          goal: TrainingGoal.Powerlifting,
          durationWeeks: 12,
        }),
      );

      expect(result.progressionScheme.deloadFrequencyWeeks).toBe(5);
    });

    it("lengthens the cadence for endurance goals", () => {
      const exercise = buildExercise({ id: id("row-machine"), category: ExerciseCategory.Compound });
      const result = planner.planProgression(
        buildInput(exercise, {
          experienceLevel: ExperienceLevel.Intermediate,
          goal: TrainingGoal.Endurance,
          durationWeeks: 12,
        }),
      );

      expect(result.progressionScheme.deloadFrequencyWeeks).toBe(7);
    });

    it("suppresses the deload entirely when the program is too short to ever reach the computed cadence", () => {
      const exercise = buildExercise({ id: id("bench"), category: ExerciseCategory.Compound });
      const result = planner.planProgression(
        buildInput(exercise, {
          experienceLevel: ExperienceLevel.Intermediate,
          goal: TrainingGoal.Hypertrophy,
          durationWeeks: 4,
        }),
      );

      expect(result.progressionScheme.deloadFrequencyWeeks).toBeNull();
    });

    it("never produces a deload cadence below the minimum floor", () => {
      for (const goal of Object.values(TrainingGoal)) {
        for (const experienceLevel of Object.values(ExperienceLevel)) {
          const exercise = buildExercise({ id: id("x"), category: ExerciseCategory.Compound });
          const result = planner.planProgression(buildInput(exercise, { goal, experienceLevel, durationWeeks: 52 }));

          if (result.progressionScheme.deloadFrequencyWeeks !== null) {
            expect(result.progressionScheme.deloadFrequencyWeeks).toBeGreaterThanOrEqual(3);
          }
        }
      }
    });
  });

  describe("scheme identity and description", () => {
    it("derives the progression scheme id deterministically from the exercise id", () => {
      const planner = new RuleBasedProgressionPlanner();
      const exercise = buildExercise({ id: id("barbell-row") });

      const result = planner.planProgression(buildInput(exercise));

      expect(result.progressionScheme.id).toBe("barbell-row::progression");
      expect(result.exerciseId).toBe(exercise.id);
    });
  });
});
