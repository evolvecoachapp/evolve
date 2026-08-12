import { ProfileLoadingStatuses, ProfileSavingStatuses } from "../models";
import {
  emptyMockProfileExperienceService,
  mockProfileExperienceService,
} from "../providers/MockProfileExperienceService";
import type { ProfileExperienceService } from "../services";
import { ProfileExperienceError } from "../services";
import { ProfileExperienceViewModel } from "../viewmodels";

describe("ProfileExperienceViewModel", () => {
  it("loads the athlete profile", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    expect(viewModel.loading.status).toBe(ProfileLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.profile?.displayName).toBe("Alex Rivera");
  });

  it("exposes error state when provider fails", async () => {
    const failing: ProfileExperienceService = {
      providerId: "mock",
      async getProfile() { throw new ProfileExperienceError("load failed", "mock"); },
      async updateTrainingPreferences() { throw new ProfileExperienceError("fail", "mock"); },
      async updateNutritionPreferences() { throw new ProfileExperienceError("fail", "mock"); },
      async updateCoachPreferences() { throw new ProfileExperienceError("fail", "mock"); },
      async updateNotificationPreferences() { throw new ProfileExperienceError("fail", "mock"); },
      async updateAppearancePreferences() { throw new ProfileExperienceError("fail", "mock"); },
      async updateMeasurementUnits() { throw new ProfileExperienceError("fail", "mock"); },
      async updateGoals() { throw new ProfileExperienceError("fail", "mock"); },
      async updateAthleteInfo() { throw new ProfileExperienceError("fail", "mock"); },
    };
    const viewModel = new ProfileExperienceViewModel({ service: failing });
    await viewModel.loadProfile();
    expect(viewModel.profile).toBeNull();
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores profile after a transient error", async () => {
    let calls = 0;
    const service: ProfileExperienceService = {
      providerId: "mock",
      async getProfile() {
        calls += 1;
        if (calls === 1) throw new ProfileExperienceError("transient", "mock");
        return mockProfileExperienceService.getProfile();
      },
      updateTrainingPreferences: mockProfileExperienceService.updateTrainingPreferences,
      updateNutritionPreferences: mockProfileExperienceService.updateNutritionPreferences,
      updateCoachPreferences: mockProfileExperienceService.updateCoachPreferences,
      updateNotificationPreferences: mockProfileExperienceService.updateNotificationPreferences,
      updateAppearancePreferences: mockProfileExperienceService.updateAppearancePreferences,
      updateMeasurementUnits: mockProfileExperienceService.updateMeasurementUnits,
      updateGoals: mockProfileExperienceService.updateGoals,
      updateAthleteInfo: mockProfileExperienceService.updateAthleteInfo,
    };
    const viewModel = new ProfileExperienceViewModel({ service });
    await viewModel.loadProfile();
    expect(viewModel.error).not.toBeNull();
    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.profile).not.toBeNull();
  });

  it("saves training preferences", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    await viewModel.updateTrainingPreferences({
      level: "beginner",
      sessionsPerWeek: 3,
      preferredDuration: 45,
      preferredTime: "Afternoon",
      focusAreas: ["Legs"],
      equipmentAvailable: ["Bodyweight"],
    });
    expect(viewModel.saving.status).toBe(ProfileSavingStatuses.IDLE);
    expect(viewModel.profile?.trainingPreferences.level).toBe("beginner");
  });

  it("saves coach preferences", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    await viewModel.updateCoachPreferences({
      coachingStyle: "motivational",
      motivationLevel: "intense",
      feedbackFrequency: "constant",
      explanationDepth: "brief",
    });
    expect(viewModel.profile?.coachPreferences.coachingStyle).toBe("motivational");
  });

  it("saves measurement units", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    await viewModel.updateUnits({ weight: "lb", distance: "mi", height: "ft_in" });
    expect(viewModel.profile?.measurementUnits.weight).toBe("lb");
  });

  it("marks empty profile states", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: emptyMockProfileExperienceService });
    await viewModel.loadProfile();
    expect(viewModel.isEmpty).toBe(true);
  });

  it("notifies subscribers on load", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    const listener = jest.fn();
    viewModel.subscribe(listener);
    await viewModel.loadProfile();
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("applyHydratedProfile is the runtime production entry point", () => {
    const viewModel = new ProfileExperienceViewModel();
    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.loading.isLoading).toBe(true);

    viewModel.applyHydratedProfile({
      id: "athlete-001",
      displayName: "Alex Rivera",
      email: null,
      avatarUrl: null,
      joinDate: "2026-01-01",
      bio: "",
      age: 28,
      heightCm: null,
      weightKg: null,
      goals: Object.freeze([]),
      trainingPreferences: {
        level: "intermediate",
        sessionsPerWeek: 0,
        preferredDuration: 0,
        preferredTime: "",
        focusAreas: Object.freeze([]),
        equipmentAvailable: Object.freeze([]),
        destination: null,
      },
      nutritionPreferences: {
        dietaryApproach: "balanced",
        calorieTarget: 0,
        mealsPerDay: 0,
        allergies: Object.freeze([]),
        supplements: Object.freeze([]),
        destination: null,
      },
      coachPreferences: {
        coachingStyle: "supportive",
        motivationLevel: "moderate",
        feedbackFrequency: "regular",
        explanationDepth: "moderate",
        destination: null,
      },
      notificationPreferences: {
        workoutReminders: false,
        mealReminders: false,
        hydrationReminders: false,
        coachMessages: false,
        progressUpdates: false,
        destination: null,
      },
      appearancePreferences: {
        theme: "system",
        accentColor: null,
        destination: null,
      },
      measurementUnits: {
        weight: "kg",
        distance: "km",
        height: "cm",
      },
      connectedServices: { services: Object.freeze([]) },
      sections: Object.freeze([]),
      accountStatus: "Active",
      appVersion: "0.6.0",
      editProfileDestination: null,
      privacyDestination: null,
      aboutDestination: null,
    });

    expect(viewModel.profile?.displayName).toBe("Alex Rivera");
    expect(viewModel.loading.status).toBe(ProfileLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
  });

  it("does not call ProfileExperienceService when runtime-driven", async () => {
    const viewModel = new ProfileExperienceViewModel();
    await viewModel.loadProfile();
    expect(viewModel.profile).toBeNull();
  });

  it("persists measurement units through runtime identity path", async () => {
    const { getCompositionRoot, resetCompositionRoot } = require("../../../core/composition/createCompositionRoot");
    resetCompositionRoot();
    const root = getCompositionRoot();
    root.resolve("AthleteIdentityService").build({
      athleteId: "athlete-001",
      requestId: "vm:identity:1",
      profile: {
        displayName: "Alex Rivera",
        givenName: "Alex",
        familyName: "Rivera",
        sex: "unspecified",
        birthYear: 1990,
        experienceLevel: "intermediate",
      },
      preferences: {
        preferredTrainingTimes: Object.freeze(["Morning"]),
        preferredModalities: Object.freeze(["Strength"]),
        dietaryPreferences: Object.freeze(["balanced"]),
        communicationTone: "analytical",
        notes: Object.freeze([]),
      },
      settings: {
        weekStartsOn: 1,
        use24HourClock: true,
        appearance: "dark",
      },
      locale: { languageTag: "en-US" },
      units: { system: "metric" },
      timeZone: { iana: "Etc/UTC", displayName: "UTC" },
    });

    const viewModel = new ProfileExperienceViewModel({ athleteId: "athlete-001" });
    viewModel.applyHydratedProfile({
      id: "athlete-001",
      displayName: "Alex Rivera",
      email: null,
      avatarUrl: null,
      joinDate: "2026-01-01",
      bio: "",
      age: 28,
      heightCm: null,
      weightKg: null,
      goals: Object.freeze([]),
      trainingPreferences: {
        level: "intermediate",
        sessionsPerWeek: 0,
        preferredDuration: 0,
        preferredTime: "",
        focusAreas: Object.freeze([]),
        equipmentAvailable: Object.freeze([]),
        destination: null,
      },
      nutritionPreferences: {
        dietaryApproach: "balanced",
        calorieTarget: 0,
        mealsPerDay: 0,
        allergies: Object.freeze([]),
        supplements: Object.freeze([]),
        destination: null,
      },
      coachPreferences: {
        coachingStyle: "supportive",
        motivationLevel: "moderate",
        feedbackFrequency: "regular",
        explanationDepth: "moderate",
        destination: null,
      },
      notificationPreferences: {
        workoutReminders: false,
        mealReminders: false,
        hydrationReminders: false,
        coachMessages: false,
        progressUpdates: false,
        destination: null,
      },
      appearancePreferences: {
        theme: "dark",
        accentColor: null,
        destination: null,
      },
      measurementUnits: {
        weight: "kg",
        distance: "km",
        height: "cm",
      },
      connectedServices: { services: Object.freeze([]) },
      sections: Object.freeze([]),
      accountStatus: "Active",
      appVersion: "0.6.0",
      editProfileDestination: null,
      privacyDestination: null,
      aboutDestination: null,
    });

    await viewModel.updateUnits({ weight: "lb", distance: "mi", height: "ft_in" });

    expect(viewModel.error).toBeNull();
    expect(viewModel.profile?.measurementUnits.weight).toBe("lb");
    expect(
      root.resolve("AthleteIdentityService").getAthleteIdentity("athlete-001")?.units.mass,
    ).toBe("lb");
  });
});
