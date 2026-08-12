import { act, renderHook, waitFor } from "@testing-library/react-native";
import { resetCompositionRoot, getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import { resetRuntimeBootstrap } from "../../../runtime/bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../../runtime/hydration/RepositoryHydrationPipeline";
import { resetDashboardRestore } from "../../../runtime/dashboard-restore/DashboardRestorePipeline";
import { resetRuntimeWriteThrough, getRuntimeWriteThroughPromise } from "../../../runtime/write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../../runtime/write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../../runtime/write-through/RuntimeWriteThroughStatus";
import { resetRuntimeSession } from "../../../runtime/session/RuntimeSessionOrchestrator";
import { startRuntimeSession } from "../../../runtime/session/application/startRuntimeSession";
import { resetRuntimeObserver } from "../../../runtime/runtime-observer/RuntimeObserver";
import { observeRuntime } from "../../../runtime/runtime-observer/application/observeRuntime";
import { readRecordPayload } from "../../../runtime/persistence/DomainRecord";
import type { AthleteIdentity } from "../../../features/athlete-identity/models/AthleteIdentity";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { mockProfileExperienceService } from "../providers/MockProfileExperienceService";
import { useProfile } from "../hooks/useProfile";
import { ProfileExperienceViewModel } from "../viewmodels/ProfileExperienceViewModel";
import { ProfileLoadingStatuses, ProfileSavingStatuses } from "../models";
import { updateMeasurementUnits } from "../application";
import { ProfileExperienceError } from "../services";
import { readHydratedProfile } from "../services/readHydratedProfile";
import { ApiError } from "../../../api/client";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

jest.mock("../../../api/users", () => ({
  updateCurrentUser: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;
const mockedUpdateCurrentUser = jest.requireMock("../../../api/users")
  .updateCurrentUser as jest.MockedFunction<typeof import("../../../api/users").updateCurrentUser>;

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;
const FIXED_CLOCK = () => "2026-08-10T10:00:00.000Z";

function resetRuntimePipelinesPreservingCompositionRoot(): void {
  resetRuntimeObserver();
  resetRuntimeSession();
  resetRepositoryHydration();
  resetDashboardRestore();
  resetRuntimeWriteThrough();
}

function resetAllRuntimeState(): void {
  resetRuntimePipelinesPreservingCompositionRoot();
  resetRuntimeBootstrap();
  resetCompositionRoot();
  resetNativeSQLiteTestState();
}

async function waitForWriteThrough(): Promise<void> {
  for (let index = 0; index < 50; index += 1) {
    const inFlight = getRuntimeWriteThroughPromise();
    if (inFlight) {
      await inFlight.catch(() => undefined);
    }
    if (getWriteThroughStatus() === RUNTIME_WRITE_THROUGH_STATUS.ready) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error("Write-through did not reach ready state");
}

async function flushMicrotasks(count = 5): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await Promise.resolve();
  }
}

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

describe("Profile runtime update persistence (Sprint 34.6)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockedUpdateCurrentUser.mockReset();
    resetAllRuntimeState();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetAllRuntimeState();
  });

  async function startObservedRuntime(): Promise<void> {
    await startRuntimeSession({
      athleteIds: [ATHLETE_ID],
      clock: FIXED_CLOCK,
    });
    seedHydratedIdentity();
    await flushMicrotasks();
    observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
  }

  it("persists supported measurement unit updates through identity build and write-through", async () => {
    await startObservedRuntime();

    const viewModel = new ProfileExperienceViewModel({ athleteId: ATHLETE_ID });
    viewModel.applyHydratedProfile(readHydratedProfile(ATHLETE_ID)!);

    await viewModel.updateUnits({ weight: "lb", distance: "mi", height: "ft_in" });

    expect(viewModel.saving.status).toBe(ProfileSavingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.profile?.measurementUnits.weight).toBe("lb");
    expect(viewModel.profile?.measurementUnits.distance).toBe("mi");

    const identity = getCompositionRoot()
      .resolve("AthleteIdentityService")
      .getAthleteIdentity(ATHLETE_ID);
    expect(identity?.units.mass).toBe("lb");
    expect(identity?.units.distance).toBe("mi");

    await waitForWriteThrough();

    const adapters = getCompositionRoot().resolve("RepositoryAdapters");
    expect(adapters.identity.list().length).toBeGreaterThanOrEqual(1);
    const persisted = readRecordPayload<AthleteIdentity>(adapters.identity.list()[0]);
    expect(persisted?.units.mass).toBe("lb");
    expect(persisted?.units.system).toBe("imperial");
  });

  it("surfaces domain validation failures from AthleteIdentityService.build()", async () => {
    await startObservedRuntime();

    const identityService = getCompositionRoot().resolve("AthleteIdentityService");
    const current = identityService.getAthleteIdentity(ATHLETE_ID)!;

    const invalidResult = identityService.build({
      athleteId: ATHLETE_ID,
      requestId: "profile:update:invalid:units",
      profile: current.profile,
      preferences: current.preferences,
      settings: current.settings,
      locale: current.locale,
      units: {
        system: "metric",
        mass: "lb",
        length: "cm",
        distance: "km",
        energy: "kcal",
      },
      timeZone: current.timeZone,
    });

    expect(invalidResult.success).toBe(false);

    await expect(
      updateMeasurementUnits({
        athleteId: ATHLETE_ID,
        units: { weight: "kg", distance: "mi", height: "ft_in" },
      }),
    ).rejects.toThrow(ProfileExperienceError);
  });

  it("triggers Runtime Observer write-through on successful identity mutation", async () => {
    await startObservedRuntime();

    const adapters = getCompositionRoot().resolve("RepositoryAdapters");
    expect(adapters.identity.list().length).toBeGreaterThanOrEqual(1);
    expect(
      readRecordPayload<AthleteIdentity>(adapters.identity.list()[0])?.settings
        .appearance,
    ).not.toBe("light");

    const viewModel = new ProfileExperienceViewModel({ athleteId: ATHLETE_ID });
    viewModel.applyHydratedProfile(readHydratedProfile(ATHLETE_ID)!);

    await viewModel.updateTheme({ theme: "light", accentColor: null });
    await waitForWriteThrough();

    expect(adapters.identity.list().length).toBeGreaterThanOrEqual(1);
    const persisted = readRecordPayload<AthleteIdentity>(adapters.identity.list()[0]);
    expect(persisted?.settings.appearance).toBe("light");
  });

  it("restores updated identity after restart hydration", async () => {
    await startObservedRuntime();

    const viewModel = new ProfileExperienceViewModel({ athleteId: ATHLETE_ID });
    viewModel.applyHydratedProfile(readHydratedProfile(ATHLETE_ID)!);
    await viewModel.updateTheme({ theme: "dark", accentColor: null });
    await waitForWriteThrough();

    resetRuntimePipelinesPreservingCompositionRoot();
    resetRuntimeBootstrap();
    resetCompositionRoot();

    await startRuntimeSession({
      athleteIds: [ATHLETE_ID],
      clock: FIXED_CLOCK,
    });

    const restored = readHydratedProfile(ATHLETE_ID);
    expect(restored?.appearancePreferences.theme).toBe("dark");
  });

  it("fails clearly (rather than silently pretending success) for unsupported profile fields in the runtime path", async () => {
    await startObservedRuntime();

    const viewModel = new ProfileExperienceViewModel({ athleteId: ATHLETE_ID });
    viewModel.applyHydratedProfile(readHydratedProfile(ATHLETE_ID)!);

    await viewModel.updateGoals([
      {
        id: "goal-1",
        kind: "strength",
        title: "Bench 100kg",
        description: "Target bench press.",
        targetDate: null,
        progress: 0,
        isPrimary: true,
      },
    ]);

    expect(viewModel.error).not.toBeNull();
    expect(viewModel.error?.message).toMatch(/goals/i);
    expect(viewModel.profile?.goals).toHaveLength(0);

    await viewModel.updateNotifications({
      workoutReminders: true,
      mealReminders: true,
      hydrationReminders: true,
      coachMessages: true,
      progressUpdates: true,
    });

    expect(viewModel.error).not.toBeNull();
    expect(viewModel.error?.message).toMatch(/notification/i);
    expect(viewModel.profile?.notificationPreferences.workoutReminders).toBe(false);
  });

  it("persists athlete info (height/weight) directly through the backend — there is no local identity field for it", async () => {
    await startObservedRuntime();
    mockedUpdateCurrentUser.mockResolvedValueOnce({
      id: ATHLETE_ID,
      email: "athlete@evolve.app",
      username: "athlete",
      first_name: "Alex",
      last_name: "Rivera",
      birth_date: "1990-01-01",
      gender: null,
      height_cm: 181,
      current_weight_kg: 76,
      target_weight_kg: null,
      activity_level: null,
      goal: null,
      is_active: true,
      is_verified: true,
      created_at: "2026-01-15T00:00:00.000Z",
      updated_at: "2026-08-10T00:00:00.000Z",
    });

    const viewModel = new ProfileExperienceViewModel({ athleteId: ATHLETE_ID });
    viewModel.applyHydratedProfile(readHydratedProfile(ATHLETE_ID)!);

    await viewModel.updateAthleteInfo({ heightCm: 181, weightKg: 76 });

    expect(mockedUpdateCurrentUser).toHaveBeenCalledWith({
      height_cm: 181,
      current_weight_kg: 76,
    });
    expect(viewModel.error).toBeNull();
    expect(viewModel.profile?.heightCm).toBe(181);
    expect(viewModel.profile?.weightKg).toBe(76);

    const identity = getCompositionRoot()
      .resolve("AthleteIdentityService")
      .getAthleteIdentity(ATHLETE_ID);
    expect(identity?.profile.displayName).toBe("Alex Rivera");
  });

  it("does not report success and preserves the prior profile when the backend athlete-info update fails", async () => {
    await startObservedRuntime();
    mockedUpdateCurrentUser.mockRejectedValueOnce(new ApiError(422, null, "Height must be greater than 0."));

    const viewModel = new ProfileExperienceViewModel({ athleteId: ATHLETE_ID });
    const hydrated = readHydratedProfile(ATHLETE_ID)!;
    viewModel.applyHydratedProfile(hydrated);

    await viewModel.updateAthleteInfo({ heightCm: -5 });

    expect(viewModel.error).not.toBeNull();
    expect(viewModel.error?.message).toBe("Height must be greater than 0.");
    expect(viewModel.error).not.toBeInstanceOf(Error);
    expect(viewModel.profile?.heightCm).toBe(hydrated.heightCm);
  });

  it("useProfile runtime path persists supported updates without ProfileExperienceService", async () => {
    await startObservedRuntime();

    const updateUnitsSpy = jest.spyOn(mockProfileExperienceService, "updateMeasurementUnits");
    const { result } = renderHook(() => useProfile({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateUnits({ weight: "lb", distance: "mi", height: "ft_in" });
    });

    expect(updateUnitsSpy).not.toHaveBeenCalled();
    expect(result.current.profile?.measurementUnits.weight).toBe("lb");
    expect(result.current.error).toBeNull();
  });

  it("profile update path does not import SQLite or repository adapters directly", () => {
    const updateModule = require("../application/updateAthleteIdentityFromProfile");
    const viewModelModule = require("../viewmodels/ProfileExperienceViewModel");
    const updateUnitsModule = require("../application/UpdateMeasurementUnits");

    for (const source of [
      updateModule.updateAthleteIdentityFromProfile.toString(),
      viewModelModule.ProfileExperienceViewModel.toString(),
      updateUnitsModule.updateMeasurementUnits.toString(),
    ]) {
      expect(source).not.toMatch(/sqlite/i);
      expect(source).not.toMatch(/IdentityRepository/);
      expect(source).not.toMatch(/RepositoryAdapter/);
    }
  });
});
