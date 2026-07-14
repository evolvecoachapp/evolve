import * as fs from "node:fs";
import * as path from "node:path";

import type {
  AppVersion,
  CurrentUserService,
  FeatureFlagService,
  FeatureFlags,
  User,
  UserPreferences,
  UserProfile,
  VersionService,
} from "../index";

const SHARED_ROOT = path.resolve(__dirname, "..");

function readSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readSourceFiles(fullPath));
      continue;
    }
    if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("shared domain architecture", () => {
  it("exports all required domain models from the public barrel", () => {
    const user: User = {
      id: "user-1",
      email: "coach@evolve.app",
      username: "evolve_user",
      isActive: true,
      isVerified: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    };

    const profile: UserProfile = {
      userId: user.id,
      firstName: "Alex",
      lastName: "Rivera",
      displayName: "Alex Rivera",
      avatarUrl: null,
      birthDate: "1995-06-15",
      gender: "prefer_not_to_say",
      heightCm: 178,
      currentWeightKg: 78,
      targetWeightKg: 75,
      activityLevel: "moderately_active",
      goal: "gain_muscle",
      updatedAt: "2026-07-01T00:00:00.000Z",
    };

    const preferences: UserPreferences = {
      userId: user.id,
      units: {
        system: "metric",
        weight: "kg",
        height: "cm",
        distance: "km",
        energy: "kcal",
        volume: "ml",
      },
      theme: "system",
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        workoutReminders: true,
        nutritionReminders: true,
        hydrationReminders: true,
        coachMessages: true,
        progressUpdates: true,
        recoveryAlerts: true,
        marketing: false,
        quietHoursEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        preferredChannels: ["push", "in_app"],
      },
      coach: {
        tone: "supportive",
        responseLength: "balanced",
        enableStreaming: true,
        includeWorkoutContext: true,
        includeNutritionContext: true,
        includeRecoveryContext: true,
        includeProgressContext: true,
        proactiveCheckIns: true,
      },
      recovery: {
        trackSleep: true,
        trackHrv: false,
        trackRestingHeartRate: false,
        showRecoveryScore: true,
        minimumSleepHours: 6,
        targetSleepHours: 8,
        includeRecoveryInHome: true,
      },
      workout: {
        defaultRestTimerSeconds: 90,
        autoStartRestTimer: true,
        showRpePrompt: true,
        showWarmupSets: true,
        plateCalculatorEnabled: true,
        weightIncrement: 2.5,
        soundEnabled: true,
        hapticFeedbackEnabled: true,
        keepScreenAwake: true,
      },
      nutrition: {
        macroDisplayOrder: ["calories", "protein", "carbs", "fat"],
        showMicronutrients: false,
        waterTrackingEnabled: true,
        dailyWaterTargetMl: 2500,
        mealReminderEnabled: true,
        barcodeScannerEnabled: true,
        defaultMealCount: 4,
      },
      privacy: {
        shareAnalytics: true,
        shareCrashReports: true,
        profileVisibility: "private",
        showActivityStatus: false,
        allowCoachDataAccess: true,
        allowProgressPhotoBackup: true,
      },
      updatedAt: "2026-07-01T00:00:00.000Z",
    };

    const version: AppVersion = {
      version: "0.1.0",
      buildNumber: "1",
      releaseChannel: "development",
      minimumSupportedVersion: null,
      updateAvailable: false,
    };

    expect(user.id).toBe(profile.userId);
    expect(preferences.userId).toBe(user.id);
    expect(version.version).toBe("0.1.0");
  });

  it("defines service contracts without persistence or provider imports", () => {
    const currentUserService: CurrentUserService = {
      providerId: "mock",
      refresh: async () => undefined,
      getUser: () => null,
      getProfile: () => null,
      getPreferences: () => null,
      getSubscription: () => null,
      isAuthenticated: () => false,
      updateProfile: async () => undefined,
    };

    const featureFlags: FeatureFlags = {
      coachStreaming: true,
      barcodeScanner: true,
      progressPhotos: false,
      socialSharing: false,
      offlineMode: false,
      betaNutritionAi: false,
      advancedRecovery: true,
      workoutTemplates: true,
    };

    const featureFlagService: FeatureFlagService = {
      getFlags: () => featureFlags,
      isEnabled: (flag) => featureFlags[flag],
    };

    const versionService: VersionService = {
      getAppVersion: () => ({
        version: "0.1.0",
        buildNumber: "1",
        releaseChannel: "development",
        minimumSupportedVersion: null,
        updateAvailable: false,
      }),
      getDeviceInfo: () => ({
        platform: "ios",
        osVersion: "18.0",
        appInstallId: "install-1",
        deviceModel: "iPhone",
        locale: "en-US",
        timezone: "America/New_York",
      }),
      isUpdateRequired: () => false,
    };

    expect(currentUserService.isAuthenticated()).toBe(false);
    expect(featureFlagService.isEnabled("coachStreaming")).toBe(true);
    expect(versionService.isUpdateRequired()).toBe(false);
  });

  it("does not import from other feature modules", () => {
    const forbiddenImportPattern =
      /from\s+["'](?:\.\.\/)*(?:\.\.\/)*features\/(?!shared)[^"']+["']/;
    const sourceFiles = readSourceFiles(SHARED_ROOT);

    for (const filePath of sourceFiles) {
      const source = fs.readFileSync(filePath, "utf8");
      expect(source).not.toMatch(forbiddenImportPattern);
    }
  });
});
