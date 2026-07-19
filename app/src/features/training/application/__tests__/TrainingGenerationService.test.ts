import { TrainingGoal } from "../../enums/TrainingGoal";
import type { GeneratedTrainingProgram } from "../../engine";
import type { ProgramGenerator, ProgramGeneratorPlanners } from "../../engine";
import type { AthleteProfile } from "../AthleteProfile";
import {
  GENERAL_FITNESS_ATHLETE,
  HYPERTROPHY_ATHLETE,
  POWERLIFTING_ATHLETE,
  createTrainingGenerationService,
} from "../fixtures";
import { TrainingGenerationService } from "../TrainingGenerationService";

describe("TrainingGenerationService", () => {
  describe("contract mapping", () => {
    it("maps the athlete profile to a ProgramGenerationRequest and returns the generator result", () => {
      const profile: AthleteProfile = POWERLIFTING_ATHLETE;
      const expected: GeneratedTrainingProgram = {
        program: {
          id: "program:mapped" as GeneratedTrainingProgram["program"]["id"],
          name: profile.name,
          description: profile.description,
          goal: profile.goal,
          experienceLevel: profile.experienceLevel,
          durationWeeks: profile.durationWeeks,
          splitId: "split:mapped" as GeneratedTrainingProgram["program"]["splitId"],
          defaultProgressionSchemeId: null,
          tags: profile.tags,
        },
        split: {
          id: "split:mapped" as GeneratedTrainingProgram["split"]["id"],
          name: profile.name,
          type: profile.preferredSplitType!,
          cycleLengthDays: 7,
          days: [],
        },
        progressionSchemes: [],
      };

      let capturedRequest: unknown;
      let capturedPlanners: unknown;

      const programGenerator: ProgramGenerator = {
        generateProgram(request, planners) {
          capturedRequest = request;
          capturedPlanners = planners;
          return expected;
        },
      };

      const planners = {
        frequencyPlanner: {} as ProgramGeneratorPlanners["frequencyPlanner"],
        splitPlanner: {} as ProgramGeneratorPlanners["splitPlanner"],
        exerciseSelector: {} as ProgramGeneratorPlanners["exerciseSelector"],
        volumePlanner: {} as ProgramGeneratorPlanners["volumePlanner"],
        progressionPlanner: {} as ProgramGeneratorPlanners["progressionPlanner"],
      };

      const service = new TrainingGenerationService(programGenerator, planners);
      const result = service.generate(profile);

      expect(capturedRequest).toEqual({
        name: profile.name,
        description: profile.description,
        goal: profile.goal,
        experienceLevel: profile.experienceLevel,
        durationWeeks: profile.durationWeeks,
        availableDaysPerWeek: profile.availableDaysPerWeek,
        availableEquipment: profile.availableEquipment,
        exerciseCatalogue: profile.exerciseCatalogue,
        preferredSplitType: profile.preferredSplitType,
        tags: profile.tags,
        excludedExerciseIds: profile.excludedExerciseIds,
      });
      expect(capturedPlanners).toBe(planners);
      expect(result).toBe(expected);
    });
  });

  describe("end-to-end fixture generation", () => {
    const service = createTrainingGenerationService();

    it.each([
      ["Powerlifting", POWERLIFTING_ATHLETE, TrainingGoal.Powerlifting],
      ["Hypertrophy", HYPERTROPHY_ATHLETE, TrainingGoal.Hypertrophy],
      ["General Fitness", GENERAL_FITNESS_ATHLETE, TrainingGoal.GeneralFitness],
    ] as const)(
      "generates a complete program for the %s fixture",
      (_label, profile, expectedGoal) => {
        const result = service.generate(profile);

        expect(result.program.name).toBe(profile.name);
        expect(result.program.goal).toBe(expectedGoal);
        expect(result.program.experienceLevel).toBe(profile.experienceLevel);
        expect(result.program.durationWeeks).toBe(profile.durationWeeks);
        expect(result.program.splitId).toBe(result.split.id);
        expect(result.split.days.length).toBeGreaterThan(0);
        expect(result.split.days.some((day) => !day.isRestDay)).toBe(true);
        expect(
          result.split.days
            .filter((day) => !day.isRestDay)
            .every((day) => day.exercises.length > 0),
        ).toBe(true);
        expect(result.progressionSchemes.length).toBeGreaterThan(0);
      },
    );

    it("is deterministic for the same athlete profile", () => {
      const first = service.generate(HYPERTROPHY_ATHLETE);
      const second = service.generate(HYPERTROPHY_ATHLETE);

      expect(first).toEqual(second);
    });
  });
});
