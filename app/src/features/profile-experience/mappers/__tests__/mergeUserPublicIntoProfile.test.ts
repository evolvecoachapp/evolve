import type { UserPublic } from "../../../../types/api";
import { createAthleteProfile } from "../../models";
import { mergeUserPublicIntoProfile } from "../mergeUserPublicIntoProfile";

function identityProfile() {
  return createAthleteProfile({
    id: "athlete-001",
    displayName: "Athlete",
    email: null,
    avatarUrl: null,
    joinDate: "2026-01-01",
    bio: "",
    age: null,
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
}

const completeUser = {
  id: "athlete-001",
  email: "jordan@evolve.app",
  username: "jordan",
  first_name: "Jordan",
  last_name: "Lee",
  birth_date: "1994-02-10",
  gender: "female",
  height_cm: "170.00",
  current_weight_kg: "62.50",
  target_weight_kg: "58.00",
  activity_level: "moderately_active",
  goal: "lose_weight",
  is_active: true,
  is_verified: true,
  created_at: "2026-01-15T00:00:00.000Z",
  updated_at: "2026-08-21T00:00:00.000Z",
} as unknown as UserPublic;

describe("mergeUserPublicIntoProfile", () => {
  it("overlays backend UserPublic onto identity without inventing tracked goals", () => {
    const merged = mergeUserPublicIntoProfile(
      identityProfile(),
      completeUser,
      new Date("2026-08-21T00:00:00.000Z"),
    );

    expect(merged.displayName).toBe("Jordan Lee");
    expect(merged.email).toBe("jordan@evolve.app");
    expect(merged.firstName).toBe("Jordan");
    expect(merged.lastName).toBe("Lee");
    expect(merged.gender).toBe("female");
    expect(merged.heightCm).toBe(170);
    expect(merged.weightKg).toBe(62.5);
    expect(merged.targetWeightKg).toBe(58);
    expect(merged.primaryGoal).toBe("lose_weight");
    expect(merged.activityLevel).toBe("moderately_active");
    expect(merged.age).toBe(32);
    expect(merged.goals).toEqual([]);
  });

  it("leaves the identity projection unchanged when no backend user is present", () => {
    const identity = identityProfile();
    expect(mergeUserPublicIntoProfile(identity, null)).toBe(identity);
  });
});
