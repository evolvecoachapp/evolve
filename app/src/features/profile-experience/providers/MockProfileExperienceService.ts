import type {
  AppearancePreferencesDto,
  AthleteGoalDto,
  AthleteProfileDto,
  CoachPreferencesDto,
  MeasurementUnitsDto,
  NotificationPreferencesDto,
  NutritionPreferencesDto,
  ProfileExperienceService,
  TrainingPreferencesDto,
} from "../services";

function buildDefaultProfile(): AthleteProfileDto {
  return {
    id: "athlete-001",
    displayName: "Alex Rivera",
    email: "alex.rivera@evolve.app",
    avatarUrl: null,
    joinDate: "2026-01-15",
    bio: "Strength athlete focused on progressive overload and recovery optimization.",
    age: 28,
    heightCm: 180,
    weightKg: 82,
    goals: [
      {
        id: "goal-strength",
        kind: "strength",
        title: "Increase Squat 1RM",
        description: "Reach 180 kg squat by end of Q3.",
        targetDate: "2026-09-30",
        progress: 72,
        isPrimary: true,
        destination: "/(app)/profile/goal/goal-strength",
      },
      {
        id: "goal-muscle",
        kind: "muscle_gain",
        title: "Lean Mass Gain",
        description: "Add 3 kg lean mass while maintaining body fat below 14%.",
        targetDate: "2026-12-31",
        progress: 40,
        isPrimary: false,
        destination: "/(app)/profile/goal/goal-muscle",
      },
      {
        id: "goal-endurance",
        kind: "endurance",
        title: "5K Under 22 Minutes",
        description: "Improve cardiovascular base for recovery between sets.",
        targetDate: null,
        progress: 55,
        isPrimary: false,
        destination: "/(app)/profile/goal/goal-endurance",
      },
    ],
    trainingPreferences: {
      level: "advanced",
      sessionsPerWeek: 5,
      preferredDuration: 75,
      preferredTime: "Morning",
      focusAreas: ["Upper Body", "Lower Body", "Core"],
      equipmentAvailable: ["Barbell", "Dumbbells", "Cable Machine", "Pull-up Bar"],
      destination: "/(app)/profile/training-preferences",
    },
    nutritionPreferences: {
      dietaryApproach: "high_protein",
      calorieTarget: 2800,
      mealsPerDay: 5,
      allergies: ["Shellfish"],
      supplements: ["Creatine", "Whey Protein", "Vitamin D"],
      destination: "/(app)/profile/nutrition-preferences",
    },
    coachPreferences: {
      coachingStyle: "analytical",
      motivationLevel: "high",
      feedbackFrequency: "regular",
      explanationDepth: "detailed",
      destination: "/(app)/profile/coach-preferences",
    },
    notificationPreferences: {
      workoutReminders: true,
      mealReminders: true,
      hydrationReminders: false,
      coachMessages: true,
      progressUpdates: true,
      destination: "/(app)/profile/notification-preferences",
    },
    appearancePreferences: {
      theme: "dark",
      accentColor: null,
      destination: "/(app)/profile/appearance",
    },
    measurementUnits: {
      weight: "kg",
      distance: "km",
      height: "cm",
    },
    connectedServices: [
      { kind: "apple_health", label: "Apple Health", isConnected: false, lastSyncLabel: null, destination: "/(app)/profile/service/apple_health" },
      { kind: "google_fit", label: "Google Fit", isConnected: false, lastSyncLabel: null, destination: "/(app)/profile/service/google_fit" },
      { kind: "garmin", label: "Garmin", isConnected: false, lastSyncLabel: null, destination: "/(app)/profile/service/garmin" },
      { kind: "whoop", label: "WHOOP", isConnected: false, lastSyncLabel: null, destination: "/(app)/profile/service/whoop" },
      { kind: "oura", label: "Oura", isConnected: false, lastSyncLabel: null, destination: "/(app)/profile/service/oura" },
    ],
    sections: [
      { kind: "athlete", title: "Athlete Profile", subtitle: "Personal information and identity", icon: "person-outline", destination: "/(app)/profile/edit" },
      { kind: "goals", title: "Goals", subtitle: "Current training and body composition goals", icon: "flag-outline", destination: "/(app)/profile/goals" },
      { kind: "training", title: "Training", subtitle: "Session frequency, duration, and focus", icon: "barbell-outline", destination: "/(app)/profile/training-preferences" },
      { kind: "nutrition", title: "Nutrition", subtitle: "Dietary approach and calorie targets", icon: "restaurant-outline", destination: "/(app)/profile/nutrition-preferences" },
      { kind: "coach", title: "Coach", subtitle: "Coaching style and feedback preferences", icon: "school-outline", destination: "/(app)/profile/coach-preferences" },
      { kind: "notifications", title: "Notifications", subtitle: "Reminders and update preferences", icon: "notifications-outline", destination: "/(app)/profile/notification-preferences" },
      { kind: "appearance", title: "Appearance", subtitle: "Theme and visual preferences", icon: "color-palette-outline", destination: "/(app)/profile/appearance" },
      { kind: "units", title: "Units", subtitle: "Weight, distance, and height units", icon: "speedometer-outline", destination: "/(app)/profile/units" },
      { kind: "connected_services", title: "Connected Services", subtitle: "Health and fitness integrations", icon: "link-outline", destination: "/(app)/profile/connected-services" },
      { kind: "about", title: "About EVOLVE", subtitle: "Version, privacy, and legal", icon: "information-circle-outline", destination: "/(app)/profile/about" },
    ],
    accountStatus: "Active",
    appVersion: "0.31.6",
    editProfileDestination: "/(app)/profile/edit",
    privacyDestination: "/(app)/profile/privacy",
    aboutDestination: "/(app)/profile/about",
  };
}

let currentProfile: AthleteProfileDto = buildDefaultProfile();

export const mockProfileExperienceService: ProfileExperienceService = {
  providerId: "mock",

  async getProfile() {
    return currentProfile;
  },

  async updateTrainingPreferences(prefs: TrainingPreferencesDto) {
    currentProfile = { ...currentProfile, trainingPreferences: prefs };
    return currentProfile;
  },

  async updateNutritionPreferences(prefs: NutritionPreferencesDto) {
    currentProfile = { ...currentProfile, nutritionPreferences: prefs };
    return currentProfile;
  },

  async updateCoachPreferences(prefs: CoachPreferencesDto) {
    currentProfile = { ...currentProfile, coachPreferences: prefs };
    return currentProfile;
  },

  async updateNotificationPreferences(prefs: NotificationPreferencesDto) {
    currentProfile = { ...currentProfile, notificationPreferences: prefs };
    return currentProfile;
  },

  async updateAppearancePreferences(prefs: AppearancePreferencesDto) {
    currentProfile = { ...currentProfile, appearancePreferences: prefs };
    return currentProfile;
  },

  async updateMeasurementUnits(units: MeasurementUnitsDto) {
    currentProfile = { ...currentProfile, measurementUnits: units };
    return currentProfile;
  },

  async updateGoals(goals: readonly AthleteGoalDto[]) {
    currentProfile = { ...currentProfile, goals };
    return currentProfile;
  },
};

export const emptyMockProfileExperienceService: ProfileExperienceService = {
  ...mockProfileExperienceService,
  async getProfile() {
    return {
      ...buildDefaultProfile(),
      displayName: "New Athlete",
      email: null,
      bio: "",
      age: null,
      heightCm: null,
      weightKg: null,
      goals: [],
      connectedServices: [],
      accountStatus: "Onboarding",
    };
  },
};
