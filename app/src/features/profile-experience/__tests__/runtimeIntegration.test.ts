import { act, renderHook, waitFor } from "@testing-library/react-native";
import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { mockProfileExperienceService } from "../providers/MockProfileExperienceService";
import { useProfile } from "../hooks/useProfile";
import { ProfileExperienceViewModel } from "../viewmodels/ProfileExperienceViewModel";
import { ProfileLoadingStatuses } from "../models";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;

function mockRuntimeReady(): void {
  mockedUseRuntimeSession.mockReturnValue({
    isStarting: false,
    status: RUNTIME_SESSION_STATUS.ready,
    retrySession: jest.fn(),
  });
}

function mockRuntimeStarting(): void {
  mockedUseRuntimeSession.mockReturnValue({
    isStarting: true,
    status: RUNTIME_SESSION_STATUS.starting,
    retrySession: jest.fn(),
  });
}

function seedHydratedIdentity(
  athleteId: string = ATHLETE_ID,
  overrides: {
    readonly displayName?: string;
    readonly birthYear?: number | null;
  } = {},
): void {
  const { getCompositionRoot } = require("../../../core/composition/createCompositionRoot");
  const root = getCompositionRoot();
  const birthYear =
    "birthYear" in overrides ? overrides.birthYear ?? null : 1990;

  root.resolve("AthleteIdentityService").build({
    athleteId,
    requestId: `profile:identity:${athleteId}`,
    profile: {
      displayName: overrides.displayName ?? "Alex Rivera",
      givenName: "Alex",
      familyName: "Rivera",
      sex: "unspecified",
      birthYear,
      experienceLevel: "intermediate",
    },
    preferences: {
      preferredTrainingTimes: Object.freeze(["Morning"]),
      preferredModalities: Object.freeze(["Strength"]),
      dietaryPreferences: Object.freeze(["balanced"]),
      communicationTone: "analytical",
      notes: Object.freeze(["Focused on progressive overload."]),
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

  root.resolve("RuntimeEnvironmentService").build({
    requestId: "profile:runtime:1",
    device: {
      deviceId: "profile:device:1",
      model: "Profile Device",
      manufacturer: "EVOLVE",
      osVersion: "0.0.0",
      formFactor: "phone",
    },
    platform: { kind: "ios", version: "0.0.0" },
    application: {
      appId: "com.evolve.app",
      name: "EVOLVE",
      version: "0.6.0",
      buildNumber: "0",
      channel: "test",
    },
    locale: { languageTag: "en-US" },
  });
}

describe("Profile runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("useProfile applies hydrated identity after runtime session is ready", async () => {
    seedHydratedIdentity();
    const getProfileSpy = jest.spyOn(mockProfileExperienceService, "getProfile");

    const { result } = renderHook(() => useProfile({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getProfileSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.profile?.displayName).toBe("Alex Rivera");
    expect(result.current.isEmpty).toBe(false);
  });

  it("useProfile renders empty identity state when profile has no measurable fields", async () => {
    seedHydratedIdentity(ATHLETE_ID, { birthYear: null });

    const { result } = renderHook(() => useProfile({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.profile?.displayName).toBe("Alex Rivera");
    expect(result.current.isEmpty).toBe(true);
  });

  it("useProfile waits for runtime session before applying hydrated identity", async () => {
    seedHydratedIdentity();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() => useProfile({ athleteId: ATHLETE_ID }));

    expect(result.current.profile).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.profile?.displayName).toBe("Alex Rivera");
    });
  });

  it("useProfile.refresh re-applies hydrated identity on restart rendering", async () => {
    seedHydratedIdentity();

    const { result } = renderHook(() => useProfile({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.profile?.displayName).toBe("Alex Rivera");
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.profile?.displayName).toBe("Alex Rivera");
    expect(result.current.error).toBeNull();
  });

  it("useProfile surfaces unavailable identity when hydration produced no record", async () => {
    const { result } = renderHook(() => useProfile({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.error?.code).toBe("athlete_identity_unavailable");
  });

  it("ProfileExperienceViewModel.applyHydratedProfile is the production data entry point", () => {
    const viewModel = new ProfileExperienceViewModel();
    const profile = {
      id: ATHLETE_ID,
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
        level: "intermediate" as const,
        sessionsPerWeek: 0,
        preferredDuration: 0,
        preferredTime: "",
        focusAreas: Object.freeze([]),
        equipmentAvailable: Object.freeze([]),
        destination: null,
      },
      nutritionPreferences: {
        dietaryApproach: "balanced" as const,
        calorieTarget: 0,
        mealsPerDay: 0,
        allergies: Object.freeze([]),
        supplements: Object.freeze([]),
        destination: null,
      },
      coachPreferences: {
        coachingStyle: "supportive" as const,
        motivationLevel: "moderate" as const,
        feedbackFrequency: "regular" as const,
        explanationDepth: "moderate" as const,
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
        theme: "system" as const,
        accentColor: null,
        destination: null,
      },
      measurementUnits: {
        weight: "kg" as const,
        distance: "km" as const,
        height: "cm" as const,
      },
      connectedServices: { services: Object.freeze([]) },
      sections: Object.freeze([]),
      accountStatus: "Active",
      appVersion: "0.6.0",
      editProfileDestination: null,
      privacyDestination: null,
      aboutDestination: null,
    };

    viewModel.applyHydratedProfile(profile);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.profile).toBe(profile);
    expect(viewModel.loading.status).toBe(ProfileLoadingStatuses.IDLE);
  });

  it("ProfileExperienceViewModel does not call ProfileExperienceService when runtime-driven", async () => {
    const viewModel = new ProfileExperienceViewModel();
    const getProfileSpy = jest.spyOn(mockProfileExperienceService, "getProfile");

    await viewModel.loadProfile();
    await viewModel.refresh();

    expect(getProfileSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });
});
