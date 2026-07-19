import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { IntensityMetric } from "../../enums/IntensityMetric";
import { MuscleGroup } from "../../enums/MuscleGroup";
import { ProgressionModel } from "../../enums/ProgressionModel";
import { SetType } from "../../enums/SetType";
import { SplitType } from "../../enums/SplitType";
import { TrainingGoal } from "../../enums/TrainingGoal";
import { WeightUnit } from "../../enums/WeightUnit";
import type { GeneratedTrainingProgram } from "../../engine";
import type { ExerciseId } from "../../types/ids";
import {
  HYPERTROPHY_ATHLETE,
  POWERLIFTING_ATHLETE,
  createTrainingGenerationService,
} from "../fixtures";
import {
  WorkoutPreviewBuilder,
  createExerciseDisplayLookup,
} from "../presentation/WorkoutPreviewBuilder";

function createSampleProgram(): GeneratedTrainingProgram {
  const progressionId = "progression:linear" as GeneratedTrainingProgram["progressionSchemes"][number]["id"];
  const splitId = "split:sample" as GeneratedTrainingProgram["split"]["id"];

  return {
    program: {
      id: "program:sample" as GeneratedTrainingProgram["program"]["id"],
      name: "Sample Strength Block",
      description: "A short block for preview mapping tests.",
      goal: TrainingGoal.Strength,
      experienceLevel: ExperienceLevel.Intermediate,
      durationWeeks: 8,
      splitId,
      defaultProgressionSchemeId: progressionId,
      tags: ["test"],
    },
    split: {
      id: splitId,
      name: "Upper / Lower Sample",
      type: SplitType.UpperLower,
      cycleLengthDays: 7,
      days: [
        {
          id: "day:1" as GeneratedTrainingProgram["split"]["days"][number]["id"],
          dayIndex: 0,
          name: "Upper A",
          isRestDay: false,
          primaryFocus: [MuscleGroup.Chest, MuscleGroup.UpperBack],
          exercises: [
            {
              id: "training-exercise:1" as GeneratedTrainingProgram["split"]["days"][number]["exercises"][number]["id"],
              exerciseId: "exercise:bench-press" as ExerciseId,
              order: 0,
              progressionSchemeId: progressionId,
              supersetGroup: null,
              setPrescriptions: [
                {
                  id: "set:1" as GeneratedTrainingProgram["split"]["days"][number]["exercises"][number]["setPrescriptions"][number]["id"],
                  setType: SetType.Working,
                  targetReps: { min: 5, max: 8 },
                  intensity: { metric: IntensityMetric.Rpe, value: 8 },
                  restSeconds: 180,
                  tempo: null,
                  notes: null,
                },
                {
                  id: "set:2" as GeneratedTrainingProgram["split"]["days"][number]["exercises"][number]["setPrescriptions"][number]["id"],
                  setType: SetType.Working,
                  targetReps: 5,
                  intensity: {
                    metric: IntensityMetric.PercentageOneRepMax,
                    value: 80,
                  },
                  restSeconds: 180,
                  tempo: null,
                  notes: "Pause reps",
                },
              ],
            },
          ],
        },
        {
          id: "day:2" as GeneratedTrainingProgram["split"]["days"][number]["id"],
          dayIndex: 1,
          name: "Rest",
          isRestDay: true,
          primaryFocus: [],
          exercises: [],
        },
      ],
    },
    progressionSchemes: [
      {
        id: progressionId,
        model: ProgressionModel.Linear,
        incrementValue: 2.5,
        incrementUnit: WeightUnit.Kilograms,
        cycleLengthWeeks: 4,
        deloadFrequencyWeeks: 4,
        description: null,
      },
    ],
  };
}

describe("WorkoutPreviewBuilder", () => {
  const lookup = createExerciseDisplayLookup([
    { id: "exercise:bench-press" as ExerciseId, name: "Barbell Bench Press" },
  ]);
  const builder = new WorkoutPreviewBuilder(lookup);

  describe("sample program mapping", () => {
    it("maps title, goal, duration, weekly schedule, days, exercises, sets, reps, intensity, and progression", () => {
      const preview = builder.build(createSampleProgram());

      expect(preview.title).toBe("Sample Strength Block");
      expect(preview.goal).toBe(TrainingGoal.Strength);
      expect(preview.goalLabel).toBe("Strength");
      expect(preview.durationWeeks).toBe(8);
      expect(preview.durationLabel).toBe("8 weeks");
      expect(preview.description).toBe("A short block for preview mapping tests.");

      expect(preview.weeklySchedule.name).toBe("Upper / Lower Sample");
      expect(preview.weeklySchedule.splitType).toBe(SplitType.UpperLower);
      expect(preview.weeklySchedule.splitTypeLabel).toBe("Upper / Lower");
      expect(preview.weeklySchedule.cycleLengthDays).toBe(7);
      expect(preview.weeklySchedule.days).toHaveLength(2);

      const trainingDay = preview.weeklySchedule.days[0];
      expect(trainingDay.name).toBe("Upper A");
      expect(trainingDay.isRestDay).toBe(false);
      expect(trainingDay.primaryFocus).toEqual(["Chest", "Upper Back"]);
      expect(trainingDay.exercises).toHaveLength(1);

      const exercise = trainingDay.exercises[0];
      expect(exercise.name).toBe("Barbell Bench Press");
      expect(exercise.order).toBe(0);
      expect(exercise.sets).toHaveLength(2);
      expect(exercise.progressionSummary).toBe(
        "Linear · +2.5 kg when progressing · 4-week cycle · deload every 4 weeks",
      );

      expect(exercise.sets[0]).toMatchObject({
        setType: SetType.Working,
        setTypeLabel: "Working",
        reps: { min: 5, max: 8, label: "5–8" },
        intensity: { metric: IntensityMetric.Rpe, value: 8, label: "RPE 8" },
        restSeconds: 180,
      });
      expect(exercise.sets[1]).toMatchObject({
        reps: { min: 5, max: 5, label: "5" },
        intensity: {
          metric: IntensityMetric.PercentageOneRepMax,
          value: 80,
          label: "80% 1RM",
        },
        notes: "Pause reps",
      });

      expect(preview.weeklySchedule.days[1].isRestDay).toBe(true);
      expect(preview.weeklySchedule.days[1].exercises).toEqual([]);

      expect(preview.progressionSummary).toHaveLength(1);
      expect(preview.progressionSummary[0]).toMatchObject({
        model: ProgressionModel.Linear,
        modelLabel: "Linear",
        incrementLabel: "+2.5 kg",
        cycleLengthWeeks: 4,
        deloadFrequencyWeeks: 4,
        summary:
          "Linear · +2.5 kg when progressing · 4-week cycle · deload every 4 weeks",
      });
    });

    it("returns a frozen immutable preview tree", () => {
      const preview = builder.build(createSampleProgram());

      expect(Object.isFrozen(preview)).toBe(true);
      expect(Object.isFrozen(preview.weeklySchedule)).toBe(true);
      expect(Object.isFrozen(preview.weeklySchedule.days)).toBe(true);
      expect(Object.isFrozen(preview.weeklySchedule.days[0])).toBe(true);
      expect(Object.isFrozen(preview.weeklySchedule.days[0].exercises[0])).toBe(true);
      expect(Object.isFrozen(preview.weeklySchedule.days[0].exercises[0].sets[0])).toBe(true);
      expect(Object.isFrozen(preview.progressionSummary)).toBe(true);
    });

    it("falls back to the exercise id when the lookup has no name", () => {
      const emptyLookupBuilder = new WorkoutPreviewBuilder(createExerciseDisplayLookup([]));
      const preview = emptyLookupBuilder.build(createSampleProgram());

      expect(preview.weeklySchedule.days[0].exercises[0].name).toBe("exercise:bench-press");
    });

    it("prefers an explicit progression description when present", () => {
      const program = createSampleProgram();
      const withDescription: GeneratedTrainingProgram = {
        ...program,
        progressionSchemes: [
          {
            ...program.progressionSchemes[0],
            description: "Add load when all working sets hit the top of the range.",
          },
        ],
      };

      const preview = builder.build(withDescription);

      expect(preview.progressionSummary[0].summary).toBe(
        "Add load when all working sets hit the top of the range.",
      );
      expect(preview.weeklySchedule.days[0].exercises[0].progressionSummary).toBe(
        "Add load when all working sets hit the top of the range.",
      );
    });
  });

  describe("end-to-end generated programs", () => {
    const service = createTrainingGenerationService();

    it.each([
      ["Hypertrophy", HYPERTROPHY_ATHLETE, "Hypertrophy"],
      ["Powerlifting", POWERLIFTING_ATHLETE, "Powerlifting"],
    ] as const)(
      "builds a complete preview for the %s fixture without engine types leaking into the surface",
      (_label, profile, expectedGoalLabel) => {
        const generated = service.generate(profile);
        const previewBuilder = new WorkoutPreviewBuilder(
          createExerciseDisplayLookup(profile.exerciseCatalogue),
        );
        const preview = previewBuilder.build(generated);

        expect(preview.title).toBe(profile.name);
        expect(preview.goalLabel).toBe(expectedGoalLabel);
        expect(preview.durationWeeks).toBe(profile.durationWeeks);
        expect(preview.durationLabel).toBe(`${profile.durationWeeks} weeks`);
        expect(preview.weeklySchedule.days.length).toBeGreaterThan(0);
        expect(preview.progressionSummary.length).toBeGreaterThan(0);

        const trainingDays = preview.weeklySchedule.days.filter((day) => !day.isRestDay);
        expect(trainingDays.length).toBeGreaterThan(0);

        const prescribedExercises = trainingDays.flatMap((day) => day.exercises);
        expect(prescribedExercises.length).toBeGreaterThan(0);
        expect(prescribedExercises.every((exercise) => exercise.name.length > 0)).toBe(true);

        const prescribedSets = prescribedExercises.flatMap((exercise) => exercise.sets);
        expect(prescribedSets.length).toBeGreaterThan(0);
        for (const set of prescribedSets) {
          expect(set.reps.label.length).toBeGreaterThan(0);
          expect(set.setTypeLabel.length).toBeGreaterThan(0);
        }

        // Preview surface should not expose nested engine program/split objects.
        expect(preview).not.toHaveProperty("program");
        expect(preview).not.toHaveProperty("split");
        expect(preview).not.toHaveProperty("progressionSchemes");
      },
    );
  });
});
