import { IntensityMetric } from "../../enums/IntensityMetric";
import { ProgressionModel } from "../../enums/ProgressionModel";
import { SetType } from "../../enums/SetType";
import {
  HYPERTROPHY_ATHLETE,
  POWERLIFTING_ATHLETE,
  createTrainingGenerationService,
} from "../fixtures";
import {
  WorkoutPreviewBuilder,
  createExerciseDisplayLookup,
  type WorkoutPreviewDay,
  type WorkoutProgramPreview,
} from "../presentation";
import { WorkoutSessionBuilder } from "../session/WorkoutSessionBuilder";

function createSamplePreview(): WorkoutProgramPreview {
  const linearSummary =
    "Linear · +2.5 kg when progressing · 4-week cycle · deload every 4 weeks";

  return Object.freeze({
    title: "Sample Strength Block",
    goal: "strength",
    goalLabel: "Strength",
    durationWeeks: 8,
    durationLabel: "8 weeks",
    description: "A short block for session mapping tests.",
    weeklySchedule: Object.freeze({
      name: "Upper / Lower Sample",
      splitType: "upper_lower",
      splitTypeLabel: "Upper / Lower",
      cycleLengthDays: 7,
      days: Object.freeze([
        Object.freeze({
          id: "day:1",
          dayIndex: 0,
          name: "Upper A",
          isRestDay: false,
          primaryFocus: Object.freeze(["Chest", "Upper Back"]),
          exercises: Object.freeze([
            Object.freeze({
              id: "training-exercise:2",
              name: "Barbell Row",
              order: 1,
              sets: Object.freeze([
                Object.freeze({
                  id: "set:row-1",
                  setType: SetType.Working,
                  setTypeLabel: "Working",
                  reps: Object.freeze({ min: 8, max: 10, label: "8–10" }),
                  intensity: Object.freeze({
                    metric: IntensityMetric.Rir,
                    value: 2,
                    label: "RIR 2",
                  }),
                  restSeconds: 120,
                  notes: null,
                }),
              ]),
              progressionSummary: linearSummary,
              supersetGroup: null,
            }),
            Object.freeze({
              id: "training-exercise:1",
              name: "Barbell Bench Press",
              order: 0,
              sets: Object.freeze([
                Object.freeze({
                  id: "set:1",
                  setType: SetType.Warmup,
                  setTypeLabel: "Warm-up",
                  reps: Object.freeze({ min: 8, max: 8, label: "8" }),
                  intensity: null,
                  restSeconds: 60,
                  notes: "Empty bar",
                }),
                Object.freeze({
                  id: "set:2",
                  setType: SetType.Working,
                  setTypeLabel: "Working",
                  reps: Object.freeze({ min: 5, max: 8, label: "5–8" }),
                  intensity: Object.freeze({
                    metric: IntensityMetric.Rpe,
                    value: 8,
                    label: "RPE 8",
                  }),
                  restSeconds: 180,
                  notes: null,
                }),
                Object.freeze({
                  id: "set:3",
                  setType: SetType.Working,
                  setTypeLabel: "Working",
                  reps: Object.freeze({ min: 5, max: 5, label: "5" }),
                  intensity: Object.freeze({
                    metric: IntensityMetric.PercentageOneRepMax,
                    value: 80,
                    label: "80% 1RM",
                  }),
                  restSeconds: 180,
                  notes: "Pause reps",
                }),
              ]),
              progressionSummary: linearSummary,
              supersetGroup: null,
            }),
          ]),
        }),
        Object.freeze({
          id: "day:2",
          dayIndex: 1,
          name: "Rest",
          isRestDay: true,
          primaryFocus: Object.freeze([]),
          exercises: Object.freeze([]),
        }),
      ]),
    }),
    progressionSummary: Object.freeze([
      Object.freeze({
        id: "progression:linear",
        model: ProgressionModel.Linear,
        modelLabel: "Linear",
        summary: linearSummary,
        incrementLabel: "+2.5 kg",
        cycleLengthWeeks: 4,
        deloadFrequencyWeeks: 4,
        description: null,
      }),
    ]),
  });
}

describe("WorkoutSessionBuilder", () => {
  const builder = new WorkoutSessionBuilder();

  describe("sample preview day mapping", () => {
    it("maps title, ordered exercises/sets, status, completion flags, notes, rest timers, and progression", () => {
      const preview = createSamplePreview();
      const day = preview.weeklySchedule.days[0];
      const session = builder.build(preview, day);

      expect(session.id).toBe("session:day:1");
      expect(session.title).toBe("Upper A");
      expect(session.subtitle).toBe("Sample Strength Block · Chest, Upper Back");
      expect(session.status).toBe("ready");
      expect(session.dayId).toBe("day:1");
      expect(session.dayIndex).toBe(0);
      expect(session.programTitle).toBe("Sample Strength Block");
      expect(session.goalLabel).toBe("Strength");
      expect(session.primaryFocus).toEqual(["Chest", "Upper Back"]);
      expect(session.notes).toBeNull();
      expect(session.startedAt).toBeNull();
      expect(session.completedAt).toBeNull();

      // Exercises are ordered by `order`, not preview array order.
      expect(session.exercises).toHaveLength(2);
      expect(session.exercises.map((exercise) => exercise.name)).toEqual([
        "Barbell Bench Press",
        "Barbell Row",
      ]);

      const bench = session.exercises[0];
      expect(bench).toMatchObject({
        id: "training-exercise:1",
        order: 0,
        notes: null,
        completed: false,
        skipped: false,
        progressionReference:
          "Linear · +2.5 kg when progressing · 4-week cycle · deload every 4 weeks",
        supersetGroup: null,
      });
      expect(bench.sets).toHaveLength(3);

      expect(bench.sets[0]).toMatchObject({
        id: "set:1",
        order: 0,
        setType: SetType.Warmup,
        setTypeLabel: "Warm-up",
        targetReps: { min: 8, max: 8, label: "8" },
        intensity: null,
        restSeconds: 60,
        prescriptionNotes: "Empty bar",
        notes: null,
        completed: false,
        completedReps: null,
        completedLoad: null,
      });

      expect(bench.sets[1]).toMatchObject({
        order: 1,
        setType: SetType.Working,
        targetReps: { min: 5, max: 8, label: "5–8" },
        intensity: { metric: IntensityMetric.Rpe, value: 8, label: "RPE 8" },
        restSeconds: 180,
        prescriptionNotes: null,
        completed: false,
      });

      expect(bench.sets[2]).toMatchObject({
        order: 2,
        intensity: {
          metric: IntensityMetric.PercentageOneRepMax,
          value: 80,
          label: "80% 1RM",
        },
        prescriptionNotes: "Pause reps",
        restSeconds: 180,
      });

      expect(session.exercises[1].sets[0]).toMatchObject({
        restSeconds: 120,
        intensity: { metric: IntensityMetric.Rir, value: 2, label: "RIR 2" },
        completed: false,
        notes: null,
      });

      expect(session.progressionReferences).toHaveLength(1);
      expect(session.progressionReferences[0]).toMatchObject({
        id: "progression:linear",
        model: ProgressionModel.Linear,
        modelLabel: "Linear",
        incrementLabel: "+2.5 kg",
        cycleLengthWeeks: 4,
        deloadFrequencyWeeks: 4,
        summary:
          "Linear · +2.5 kg when progressing · 4-week cycle · deload every 4 weeks",
      });
    });

    it("returns a frozen immutable session tree", () => {
      const preview = createSamplePreview();
      const session = builder.build(preview, preview.weeklySchedule.days[0]);

      expect(Object.isFrozen(session)).toBe(true);
      expect(Object.isFrozen(session.primaryFocus)).toBe(true);
      expect(Object.isFrozen(session.exercises)).toBe(true);
      expect(Object.isFrozen(session.exercises[0])).toBe(true);
      expect(Object.isFrozen(session.exercises[0].sets)).toBe(true);
      expect(Object.isFrozen(session.exercises[0].sets[0])).toBe(true);
      expect(Object.isFrozen(session.exercises[0].sets[0].targetReps)).toBe(true);
      expect(Object.isFrozen(session.progressionReferences)).toBe(true);
      expect(Object.isFrozen(session.progressionReferences[0])).toBe(true);
    });

    it("rejects rest days", () => {
      const preview = createSamplePreview();
      const restDay = preview.weeklySchedule.days[1];

      expect(() => builder.build(preview, restDay)).toThrow(
        /Cannot build a workout session from rest day "Rest"/,
      );
    });

    it("rejects a day that does not belong to the preview", () => {
      const preview = createSamplePreview();
      const foreignDay: WorkoutPreviewDay = Object.freeze({
        id: "day:foreign",
        dayIndex: 99,
        name: "Foreign Day",
        isRestDay: false,
        primaryFocus: Object.freeze(["Quads"]),
        exercises: Object.freeze([]),
      });

      expect(() => builder.build(preview, foreignDay)).toThrow(
        /Selected day "day:foreign" is not part of preview/,
      );
    });

    it("falls back to goal label in the subtitle when the day has no primary focus", () => {
      const preview = createSamplePreview();
      const dayWithoutFocus: WorkoutPreviewDay = Object.freeze({
        ...preview.weeklySchedule.days[0],
        primaryFocus: Object.freeze([]),
      });
      const previewWithDay: WorkoutProgramPreview = Object.freeze({
        ...preview,
        weeklySchedule: Object.freeze({
          ...preview.weeklySchedule,
          days: Object.freeze([dayWithoutFocus, preview.weeklySchedule.days[1]]),
        }),
      });

      const session = builder.build(previewWithDay, dayWithoutFocus);

      expect(session.subtitle).toBe("Sample Strength Block · Strength");
    });
  });

  describe("end-to-end generated previews", () => {
    const service = createTrainingGenerationService();

    it.each([
      ["Hypertrophy", HYPERTROPHY_ATHLETE],
      ["Powerlifting", POWERLIFTING_ATHLETE],
    ] as const)(
      "builds an executable session from the first training day of the %s fixture",
      (_label, profile) => {
        const generated = service.generate(profile);
        const previewBuilder = new WorkoutPreviewBuilder(
          createExerciseDisplayLookup(profile.exerciseCatalogue),
        );
        const preview = previewBuilder.build(generated);
        const trainingDay = preview.weeklySchedule.days.find((day) => !day.isRestDay);
        expect(trainingDay).toBeDefined();

        const session = builder.build(preview, trainingDay!);

        expect(session.status).toBe("ready");
        expect(session.title).toBe(trainingDay!.name);
        expect(session.programTitle).toBe(preview.title);
        expect(session.exercises.length).toBeGreaterThan(0);
        expect(session.exercises.every((exercise) => exercise.completed === false)).toBe(
          true,
        );
        expect(session.exercises.every((exercise) => exercise.notes === null)).toBe(true);

        const sets = session.exercises.flatMap((exercise) => exercise.sets);
        expect(sets.length).toBeGreaterThan(0);
        expect(sets.every((set) => set.completed === false)).toBe(true);
        expect(sets.every((set) => set.notes === null)).toBe(true);
        expect(sets.every((set) => set.targetReps.label.length > 0)).toBe(true);

        // Session surface should not expose preview/engine aggregates.
        expect(session).not.toHaveProperty("weeklySchedule");
        expect(session).not.toHaveProperty("program");
        expect(session).not.toHaveProperty("split");
        expect(session).not.toHaveProperty("progressionSchemes");
      },
    );
  });
});
