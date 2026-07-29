import {
  loadProfile,
  refreshProfile,
  updateAppearancePreferences,
  updateCoachPreferences,
  updateGoals,
  updateMeasurementUnits,
  updateNotificationPreferences,
  updateNutritionPreferences,
  updateTrainingPreferences,
} from "../application";
import {
  emptyMockProfileExperienceService,
  mockProfileExperienceService,
} from "../providers/MockProfileExperienceService";
import type { ProfileExperienceService } from "../services";
import { ProfileExperienceError } from "../services";

function createFailingService(): ProfileExperienceService {
  return {
    providerId: "mock",
    async getProfile() { throw new ProfileExperienceError("profile failed", "mock"); },
    async updateTrainingPreferences() { throw new ProfileExperienceError("training failed", "mock"); },
    async updateNutritionPreferences() { throw new ProfileExperienceError("nutrition failed", "mock"); },
    async updateCoachPreferences() { throw new ProfileExperienceError("coach failed", "mock"); },
    async updateNotificationPreferences() { throw new ProfileExperienceError("notification failed", "mock"); },
    async updateAppearancePreferences() { throw new ProfileExperienceError("appearance failed", "mock"); },
    async updateMeasurementUnits() { throw new ProfileExperienceError("units failed", "mock"); },
    async updateGoals() { throw new ProfileExperienceError("goals failed", "mock"); },
  };
}

describe("profile-experience application APIs", () => {
  it("loads a full immutable profile", async () => {
    const profile = await loadProfile({ service: mockProfileExperienceService });
    expect(Object.isFrozen(profile)).toBe(true);
    expect(profile.goals.length).toBeGreaterThan(0);
    expect(profile.displayName).toBe("Alex Rivera");
  });

  it("refresh returns a fresh mapped profile", async () => {
    const first = await loadProfile({ service: mockProfileExperienceService });
    const second = await refreshProfile({ service: mockProfileExperienceService });
    expect(second).not.toBe(first);
    expect(second.displayName).toBe(first.displayName);
  });

  it("updates training preferences", async () => {
    const profile = await updateTrainingPreferences({
      service: mockProfileExperienceService,
      prefs: {
        level: "intermediate",
        sessionsPerWeek: 4,
        preferredDuration: 60,
        preferredTime: "Evening",
        focusAreas: ["Core"],
        equipmentAvailable: ["Barbell"],
      },
    });
    expect(profile.trainingPreferences.level).toBe("intermediate");
  });

  it("updates nutrition preferences", async () => {
    const profile = await updateNutritionPreferences({
      service: mockProfileExperienceService,
      prefs: {
        dietaryApproach: "balanced",
        calorieTarget: 2500,
        mealsPerDay: 4,
        allergies: [],
        supplements: [],
      },
    });
    expect(profile.nutritionPreferences.calorieTarget).toBe(2500);
  });

  it("updates coach preferences", async () => {
    const profile = await updateCoachPreferences({
      service: mockProfileExperienceService,
      prefs: {
        coachingStyle: "supportive",
        motivationLevel: "moderate",
        feedbackFrequency: "frequent",
        explanationDepth: "comprehensive",
      },
    });
    expect(profile.coachPreferences.coachingStyle).toBe("supportive");
  });

  it("updates notification preferences", async () => {
    const profile = await updateNotificationPreferences({
      service: mockProfileExperienceService,
      prefs: {
        workoutReminders: false,
        mealReminders: false,
        hydrationReminders: true,
        coachMessages: false,
        progressUpdates: false,
      },
    });
    expect(profile.notificationPreferences.hydrationReminders).toBe(true);
  });

  it("updates appearance preferences", async () => {
    const profile = await updateAppearancePreferences({
      service: mockProfileExperienceService,
      prefs: { theme: "light", accentColor: null },
    });
    expect(profile.appearancePreferences.theme).toBe("light");
  });

  it("updates measurement units", async () => {
    const profile = await updateMeasurementUnits({
      service: mockProfileExperienceService,
      units: { weight: "lb", distance: "mi", height: "ft_in" },
    });
    expect(profile.measurementUnits.weight).toBe("lb");
  });

  it("updates goals", async () => {
    const profile = await updateGoals({
      service: mockProfileExperienceService,
      goals: [{ id: "new", kind: "flexibility", title: "Splits", description: "Full splits by December.", targetDate: null, progress: 10, isPrimary: true }],
    });
    expect(profile.goals.length).toBe(1);
    expect(profile.goals[0].title).toBe("Splits");
  });

  it("supports empty profile state", async () => {
    const profile = await loadProfile({ service: emptyMockProfileExperienceService });
    expect(profile.goals.length).toBe(0);
  });

  it("propagates provider failures", async () => {
    await expect(loadProfile({ service: createFailingService() })).rejects.toThrow("profile failed");
  });
});
