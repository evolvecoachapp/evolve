import { HYPERTROPHY_ATHLETE, POWERLIFTING_ATHLETE } from "../fixtures";
import { createWorkoutPreviewProvider, WorkoutPreviewProvider } from "../WorkoutPreviewProvider";
import { createTrainingGenerationService } from "../fixtures/createTrainingGenerationService";

describe("WorkoutPreviewProvider", () => {
  it("builds a UI-ready preview from an athlete profile", () => {
    const provider = createWorkoutPreviewProvider();
    const preview = provider.getPreview(HYPERTROPHY_ATHLETE);

    expect(preview.title).toBe(HYPERTROPHY_ATHLETE.name);
    expect(preview.goalLabel).toBe("Hypertrophy");
    expect(preview.durationWeeks).toBe(HYPERTROPHY_ATHLETE.durationWeeks);
    expect(preview.durationLabel).toBe(`${HYPERTROPHY_ATHLETE.durationWeeks} weeks`);
    expect(preview.weeklySchedule.days.length).toBeGreaterThan(0);
    expect(preview.progressionSummary.length).toBeGreaterThan(0);

    const trainingDays = preview.weeklySchedule.days.filter((day) => !day.isRestDay);
    expect(trainingDays.length).toBeGreaterThan(0);

    const exercises = trainingDays.flatMap((day) => day.exercises);
    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises.every((exercise) => exercise.name.length > 0)).toBe(true);

    // Preview surface must not expose engine aggregates.
    expect(preview).not.toHaveProperty("program");
    expect(preview).not.toHaveProperty("split");
    expect(preview).not.toHaveProperty("progressionSchemes");
  });

  it("accepts an injected TrainingGenerationService", () => {
    const provider = new WorkoutPreviewProvider(createTrainingGenerationService());
    const preview = provider.getPreview(POWERLIFTING_ATHLETE);

    expect(preview.goalLabel).toBe("Powerlifting");
    expect(preview.title).toBe(POWERLIFTING_ATHLETE.name);
  });
});
