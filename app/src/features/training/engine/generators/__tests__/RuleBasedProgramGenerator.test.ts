import { EquipmentType } from "../../../enums/EquipmentType";
import { ExerciseCategory } from "../../../enums/ExerciseCategory";
import { ExperienceLevel } from "../../../enums/ExperienceLevel";
import { MovementPattern } from "../../../enums/MovementPattern";
import { MuscleGroup } from "../../../enums/MuscleGroup";
import { SplitType } from "../../../enums/SplitType";
import { TrainingGoal } from "../../../enums/TrainingGoal";
import type { ExerciseDefinition } from "../../../models/ExerciseDefinition";
import type { ExerciseId } from "../../../types/ids";
import { ConstraintEngine } from "../../constraints/ConstraintEngine";
import type { ProgramGenerationRequest, ProgramGeneratorPlanners } from "../../contracts/ProgramGenerator";
import { RuleBasedFrequencyPlanner } from "../../planners/RuleBasedFrequencyPlanner";
import { RuleBasedProgressionPlanner } from "../../planners/RuleBasedProgressionPlanner";
import { RuleBasedSplitPlanner } from "../../planners/RuleBasedSplitPlanner";
import { RuleBasedVolumePlanner } from "../../planners/RuleBasedVolumePlanner";
import { RuleBasedExerciseSelector } from "../../selectors/RuleBasedExerciseSelector";
import { RuleBasedProgramGenerator } from "../RuleBasedProgramGenerator";

function id(value: string): ExerciseId {
  return value as ExerciseId;
}

/** Small, fully hand-verifiable catalogue: two exercises relevant to the athlete's target
 * muscles (Chest, Quads) and one deliberately irrelevant exercise (Biceps only), used to
 * confirm irrelevant catalogue entries never surface in the generated program. */
const BENCH_PRESS: ExerciseDefinition = {
  id: id("bench-press"),
  name: "Bench Press",
  category: ExerciseCategory.Compound,
  movementPattern: MovementPattern.HorizontalPush,
  primaryMuscles: [MuscleGroup.Chest],
  secondaryMuscles: [MuscleGroup.Triceps, MuscleGroup.Shoulders],
  equipment: [EquipmentType.Barbell],
  isUnilateral: false,
  isBodyweight: false,
  notes: null,
};

const LEG_PRESS: ExerciseDefinition = {
  id: id("leg-press"),
  name: "Leg Press",
  category: ExerciseCategory.Compound,
  movementPattern: MovementPattern.Squat,
  primaryMuscles: [MuscleGroup.Quads],
  secondaryMuscles: [MuscleGroup.Glutes],
  equipment: [EquipmentType.Machine],
  isUnilateral: false,
  isBodyweight: false,
  notes: null,
};

const BICEP_CURL: ExerciseDefinition = {
  id: id("bicep-curl"),
  name: "Bicep Curl",
  category: ExerciseCategory.Isolation,
  movementPattern: MovementPattern.Isolation,
  primaryMuscles: [MuscleGroup.Biceps],
  secondaryMuscles: [],
  equipment: [EquipmentType.Dumbbell],
  isUnilateral: false,
  isBodyweight: false,
  notes: null,
};

const CATALOGUE: readonly ExerciseDefinition[] = [BENCH_PRESS, LEG_PRESS, BICEP_CURL];

function buildRequest(overrides: Partial<ProgramGenerationRequest> = {}): ProgramGenerationRequest {
  return {
    name: "Golden Profile",
    description: "Representative athlete profile for the engine's golden-output test.",
    goal: TrainingGoal.Hypertrophy,
    experienceLevel: ExperienceLevel.Intermediate,
    durationWeeks: 8,
    availableDaysPerWeek: 3,
    availableEquipment: [EquipmentType.Barbell, EquipmentType.Machine, EquipmentType.Dumbbell],
    exerciseCatalogue: CATALOGUE,
    preferredSplitType: SplitType.FullBody,
    tags: ["golden-profile"],
    excludedExerciseIds: [],
    ...overrides,
  };
}

/** Real, deterministic planners and selector — no mocks anywhere in the pipeline. */
function buildPlanners(): ProgramGeneratorPlanners {
  return {
    frequencyPlanner: new RuleBasedFrequencyPlanner(),
    splitPlanner: new RuleBasedSplitPlanner(),
    exerciseSelector: new RuleBasedExerciseSelector(),
    volumePlanner: new RuleBasedVolumePlanner(),
    progressionPlanner: new RuleBasedProgressionPlanner(),
  };
}

/** Narrows the default engine-wide muscle scope and per-day slot budget down to something
 * small enough to hand-verify exactly, without touching any planner algorithm. */
function buildGenerator(): RuleBasedProgramGenerator {
  return new RuleBasedProgramGenerator(
    new ConstraintEngine(),
    [MuscleGroup.Chest, MuscleGroup.Quads],
    { min: 1, max: 2 },
    4,
  );
}

describe("RuleBasedProgramGenerator", () => {
  describe("determinism", () => {
    it("generates an identical program for two independently constructed but equivalent requests", () => {
      const resultA = buildGenerator().generateProgram(buildRequest(), buildPlanners());
      const resultB = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      expect(resultA).toEqual(resultB);
    });

    it("generates an identical program across repeated calls with the exact same request object", () => {
      const generator = buildGenerator();
      const request = buildRequest();
      const planners = buildPlanners();

      const first = generator.generateProgram(request, planners);
      const second = generator.generateProgram(request, planners);

      expect(first).toEqual(second);
    });

    it("does not mutate the request it was given", () => {
      const generator = buildGenerator();
      const request = buildRequest();
      const before = JSON.parse(JSON.stringify(request));

      generator.generateProgram(request, buildPlanners());

      expect(JSON.parse(JSON.stringify(request))).toEqual(before);
    });
  });

  describe("golden output for a representative athlete profile", () => {
    it("matches the exact hand-derived program, split, days, exercises, and progression schemes", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      expect(result.program).toEqual({
        id: "program:golden-profile",
        name: "Golden Profile",
        description: "Representative athlete profile for the engine's golden-output test.",
        goal: TrainingGoal.Hypertrophy,
        experienceLevel: ExperienceLevel.Intermediate,
        durationWeeks: 8,
        splitId: "split:golden-profile",
        defaultProgressionSchemeId: null,
        tags: ["golden-profile"],
      });

      expect(result.split.id).toBe("split:golden-profile");
      expect(result.split.type).toBe(SplitType.FullBody);
      expect(result.split.cycleLengthDays).toBe(7);
      expect(result.split.days).toHaveLength(7);

      const restDayIndices = result.split.days.filter((day) => day.isRestDay).map((day) => day.dayIndex);
      const trainingDayIndices = result.split.days.filter((day) => !day.isRestDay).map((day) => day.dayIndex);
      expect(restDayIndices).toEqual([1, 3, 5, 6]);
      expect(trainingDayIndices).toEqual([0, 2, 4]);

      const trainingDayCombinedFocus = trainingDayIndices.map(
        (dayIndex) => result.split.days.find((day) => day.dayIndex === dayIndex)?.primaryFocus,
      );
      expect(trainingDayCombinedFocus).toEqual([
        [MuscleGroup.Chest, MuscleGroup.Quads],
        [MuscleGroup.Chest, MuscleGroup.Quads],
        [MuscleGroup.Chest],
      ]);

      for (const dayIndex of [0, 2]) {
        const day = result.split.days.find((candidate) => candidate.dayIndex === dayIndex);
        expect(day?.exercises.map((exercise) => String(exercise.exerciseId))).toEqual(["bench-press", "leg-press"]);
      }
      const day4 = result.split.days.find((candidate) => candidate.dayIndex === 4);
      expect(day4?.exercises.map((exercise) => String(exercise.exerciseId))).toEqual(["bench-press"]);

      for (const dayIndex of [1, 3, 5, 6]) {
        const day = result.split.days.find((candidate) => candidate.dayIndex === dayIndex);
        expect(day?.exercises).toEqual([]);
        expect(day?.primaryFocus).toEqual([]);
      }

      const benchOnDay0 = result.split.days.find((day) => day.dayIndex === 0)?.exercises[0];
      expect(benchOnDay0?.setPrescriptions).toHaveLength(5);
      expect(benchOnDay0?.setPrescriptions[0]?.setType).toBe("warmup");
      expect(benchOnDay0?.setPrescriptions.slice(1).every((set) => set.setType === "working")).toBe(true);
      expect(benchOnDay0?.progressionSchemeId).toBe("bench-press::progression");

      const legPressOnDay0 = result.split.days.find((day) => day.dayIndex === 0)?.exercises[1];
      expect(legPressOnDay0?.setPrescriptions).toHaveLength(5);
      expect(legPressOnDay0?.progressionSchemeId).toBe("leg-press::progression");

      expect(result.progressionSchemes).toHaveLength(2);
      const schemeIds = result.progressionSchemes.map((scheme) => String(scheme.id)).sort();
      expect(schemeIds).toEqual(["bench-press::progression", "leg-press::progression"]);
      for (const scheme of result.progressionSchemes) {
        expect(scheme.model).toBe("double_progression");
        expect(scheme.incrementValue).toBe(2.5);
        expect(scheme.incrementUnit).toBe("kg");
        expect(scheme.cycleLengthWeeks).toBe(6);
        expect(scheme.deloadFrequencyWeeks).toBe(6);
      }
    });
  });

  describe("excludedExerciseIds are honored", () => {
    it("never includes an excluded exercise anywhere in the generated program", () => {
      const withoutExclusion = buildGenerator().generateProgram(buildRequest(), buildPlanners());
      const allExerciseIdsWithoutExclusion = withoutExclusion.split.days.flatMap((day) =>
        day.exercises.map((exercise) => String(exercise.exerciseId)),
      );
      expect(allExerciseIdsWithoutExclusion).toContain("bench-press");

      const withExclusion = buildGenerator().generateProgram(
        buildRequest({ excludedExerciseIds: [id("bench-press")] }),
        buildPlanners(),
      );
      const allExerciseIdsWithExclusion = withExclusion.split.days.flatMap((day) =>
        day.exercises.map((exercise) => String(exercise.exerciseId)),
      );

      expect(allExerciseIdsWithExclusion).not.toContain("bench-press");
      expect(withExclusion.progressionSchemes.map((scheme) => String(scheme.id))).not.toContain(
        "bench-press::progression",
      );
    });

    it("leaves a day with no eligible replacement empty rather than reintroducing the excluded exercise", () => {
      const result = buildGenerator().generateProgram(
        buildRequest({ excludedExerciseIds: [id("bench-press")] }),
        buildPlanners(),
      );

      const day4 = result.split.days.find((day) => day.dayIndex === 4);
      expect(day4?.exercises).toEqual([]);
    });

    it("still selects the remaining eligible exercise on days that target more than one muscle group", () => {
      const result = buildGenerator().generateProgram(
        buildRequest({ excludedExerciseIds: [id("bench-press")] }),
        buildPlanners(),
      );

      const day0 = result.split.days.find((day) => day.dayIndex === 0);
      expect(day0?.exercises.map((exercise) => String(exercise.exerciseId))).toEqual(["leg-press"]);
    });
  });

  describe("internal consistency", () => {
    it("keeps every day's dayIndex unique and sequential across the full cycle", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      const dayIndices = result.split.days.map((day) => day.dayIndex);
      expect(dayIndices).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(new Set(dayIndices).size).toBe(dayIndices.length);
    });

    it("keeps every training exercise id unique across the whole split", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      const exerciseIds = result.split.days.flatMap((day) => day.exercises.map((exercise) => String(exercise.id)));
      expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
    });

    it("keeps exercise order sequential and zero-indexed within every day", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      for (const day of result.split.days) {
        expect(day.exercises.map((exercise) => exercise.order)).toEqual(
          day.exercises.map((_, index) => index),
        );
      }
    });

    it("only ever selects exercises that exist in the supplied catalogue", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      const catalogueIds = new Set(CATALOGUE.map((exercise) => String(exercise.id)));
      for (const day of result.split.days) {
        for (const exercise of day.exercises) {
          expect(catalogueIds.has(String(exercise.exerciseId))).toBe(true);
        }
      }
    });

    it("never surfaces an exercise that targets none of the athlete's target muscle groups", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      const usedExerciseIds = new Set(
        result.split.days.flatMap((day) => day.exercises.map((exercise) => String(exercise.exerciseId))),
      );
      expect(usedExerciseIds.has("bicep-curl")).toBe(false);
    });

    it("assigns every training exercise a progression scheme that exists in progressionSchemes", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      const schemeIds = new Set(result.progressionSchemes.map((scheme) => String(scheme.id)));
      for (const day of result.split.days) {
        for (const exercise of day.exercises) {
          expect(exercise.progressionSchemeId).not.toBeNull();
          expect(schemeIds.has(String(exercise.progressionSchemeId))).toBe(true);
        }
      }
    });

    it("computes exactly one progression scheme per distinct exercise used anywhere in the program", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      const usedExerciseIds = new Set(
        result.split.days.flatMap((day) => day.exercises.map((exercise) => String(exercise.exerciseId))),
      );
      expect(result.progressionSchemes).toHaveLength(usedExerciseIds.size);
    });

    it("gives every rest day an empty exercise list and empty primary focus", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      for (const day of result.split.days.filter((candidate) => candidate.isRestDay)) {
        expect(day.exercises).toEqual([]);
        expect(day.primaryFocus).toEqual([]);
      }
    });

    it("links the program to its split by id", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      expect(result.program.splitId).toBe(result.split.id);
    });

    it("never produces a negative or non-finite value anywhere in a set prescription", () => {
      const result = buildGenerator().generateProgram(buildRequest(), buildPlanners());

      for (const day of result.split.days) {
        for (const exercise of day.exercises) {
          for (const prescription of exercise.setPrescriptions) {
            if (typeof prescription.targetReps === "number") {
              expect(prescription.targetReps).toBeGreaterThan(0);
            } else {
              expect(prescription.targetReps.min).toBeGreaterThan(0);
              expect(prescription.targetReps.max).toBeGreaterThanOrEqual(prescription.targetReps.min);
            }
            if (prescription.restSeconds !== null) {
              expect(prescription.restSeconds).toBeGreaterThanOrEqual(0);
            }
            if (prescription.intensity !== null) {
              expect(Number.isFinite(prescription.intensity.value)).toBe(true);
            }
          }
        }
      }
    });
  });
});
