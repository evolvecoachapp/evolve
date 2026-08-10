import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { FIXED_DASHBOARD_ATHLETE_ID } from "../../../integrations/dashboard-projection/testSupport/fixtures";
import {
  emptyMockProgressAnalyticsService,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { publishWorkoutCompletion } from "../../../integrations/workout-progress/application";
import { createWorkoutProgressIntegration } from "../../../integrations/workout-progress/composition";
import { createTestWorkoutSessionSummary } from "../../../integrations/workout-progress/testSupport/fixtures";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { projectAnalyticsEventToTimeline } from "../../../integrations/analytics-timeline/application";
import { createTestWorkoutAnalyticsTimelineEvent } from "../../../integrations/analytics-timeline/testSupport/fixtures";
import { loadHydratedProgressExperience } from "../application/loadHydratedProgressExperience";
import { mapProgressAnalyticsToExperienceDto } from "../mappers/mapProgressAnalyticsToExperienceDto";
import { mapProgressDashboard } from "../mappers";
import { useProgressDashboard } from "../hooks/useProgressDashboard";
import { TimeRanges } from "../models";
import {
  emptyMockProgressExperienceService,
  mockProgressExperienceService,
} from "../providers/MockProgressExperienceService";
import { ProgressExperienceViewModel } from "../viewmodels/ProgressExperienceViewModel";
import { ProgressLoadingStatuses } from "../models/ProgressLoadingState";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;
const FIXED_PUBLISHED_AT = "2026-08-02T20:00:00.000Z";

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

describe("Progress runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetCompositionRoot();
    resetMockProgressAnalyticsData();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
    resetMockProgressAnalyticsData();
  });

  it("useProgressDashboard applies Progress Analytics read models after runtime session is ready", async () => {
    const getDashboardSpy = jest.spyOn(mockProgressExperienceService, "getDashboard");

    const { result } = renderHook(() =>
      useProgressDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(result.current.dashboard?.strength.estimatedOneRepMaxKg).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
    expect(result.current.viewModel.isRuntimeDriven).toBe(true);
  });

  it("useProgressDashboard waits for runtime session before applying hydrated progress", async () => {
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() =>
      useProgressDashboard({ athleteId: ATHLETE_ID }),
    );

    expect(result.current.dashboard).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.dashboard?.volume.totalVolumeKg).toBeGreaterThan(0);
    });
  });

  it("loadHydratedProgressExperience returns empty analytics state", async () => {
    const analytics = await emptyMockProgressAnalyticsService.getAnalytics();
    const dashboard = mapProgressDashboard(
      mapProgressAnalyticsToExperienceDto({
        analytics,
        timeRange: TimeRanges.LAST_30_DAYS,
        athleteId: ATHLETE_ID,
      }),
    );

    expect(dashboard.volume.totalVolumeKg).toBe(0);
    expect(dashboard.headline).toContain("No progress");
  });

  it("loadHydratedProgressExperience reflects workout analytics after integration ingest", async () => {
    resetMockProgressAnalyticsData();
    const root = getCompositionRoot();
    const { publisher } = createWorkoutProgressIntegration({
      progressAnalyticsService: root.resolve("AnalyticsTimelineProjector").progressAnalyticsService,
    });

    await publishWorkoutCompletion({
      publisher,
      summary: createTestWorkoutSessionSummary({
        sessionId: "session-progress-runtime",
        estimatedVolumeKg: 5100,
      }),
      correlationId: "corr-progress-runtime",
      eventId: "evt-progress-runtime-complete",
      publishedAt: FIXED_PUBLISHED_AT,
      athleteId: ATHLETE_ID,
    });

    const dashboard = await loadHydratedProgressExperience({ athleteId: ATHLETE_ID });

    expect(dashboard?.volume.totalVolumeKg).toBeGreaterThan(0);
    expect(dashboard?.strength.estimatedOneRepMaxKg).toBeGreaterThan(0);
  });

  it("refresh reprojects analytics timeline entries where supported", async () => {
    resetMockProgressAnalyticsData();
    const root = getCompositionRoot();
    const projector = root.resolve("AnalyticsTimelineProjector");
    const analyticsService = projector.progressAnalyticsService;
    const { publisher } = createWorkoutProgressIntegration({ progressAnalyticsService: analyticsService });

    await publishWorkoutCompletion({
      publisher,
      summary: createTestWorkoutSessionSummary({ sessionId: "session-timeline-runtime" }),
      correlationId: "corr-timeline-runtime",
      eventId: "evt-timeline-runtime-complete",
      publishedAt: FIXED_PUBLISHED_AT,
      athleteId: ATHLETE_ID,
    });

    await loadHydratedProgressExperience({ athleteId: ATHLETE_ID });

    const timeline = projector.coachTimelineService.getTimeline(ATHLETE_ID);
    expect(
      timeline?.entries.some(
        (entry) => entry.id === "tl:analytics:workout:evt-timeline-runtime-complete",
      ),
    ).toBe(true);
  });

  it("explicit ProgressExperienceService injection keeps mock path for tests", async () => {
    const getAnalyticsSpy = jest.spyOn(mockProgressAnalyticsService, "getAnalytics");

    const { result } = renderHook(() =>
      useProgressDashboard({ service: mockProgressExperienceService, athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getAnalyticsSpy).not.toHaveBeenCalled();
    expect(result.current.viewModel.isRuntimeDriven).toBe(false);
    expect(result.current.dashboard?.headline).toContain("1RM");
  });

  it("runtime refresh reloads Progress Analytics read models", async () => {
    const viewModel = new ProgressExperienceViewModel({ athleteId: ATHLETE_ID });
    viewModel.applyHydratedProgress(
      (await loadHydratedProgressExperience({ athleteId: ATHLETE_ID }))!,
    );

    const baselineVolume = viewModel.dashboard?.volume.totalVolumeKg ?? 0;

    const root = getCompositionRoot();
    const { publisher } = createWorkoutProgressIntegration({
      progressAnalyticsService: root.resolve("AnalyticsTimelineProjector").progressAnalyticsService,
    });

    await publishWorkoutCompletion({
      publisher,
      summary: createTestWorkoutSessionSummary({ sessionId: "session-progress-refresh" }),
      correlationId: "corr-progress-refresh",
      eventId: "evt-progress-refresh-complete",
      publishedAt: FIXED_PUBLISHED_AT,
      athleteId: ATHLETE_ID,
    });

    await act(async () => {
      await viewModel.refresh();
    });

    expect(viewModel.loading.status).toBe(ProgressLoadingStatuses.IDLE);
    expect(viewModel.dashboard?.volume.totalVolumeKg).toBeGreaterThanOrEqual(baselineVolume);
  });

  it("ProgressExperienceViewModel.applyProgressFailure surfaces provider errors", () => {
    const viewModel = new ProgressExperienceViewModel({ athleteId: ATHLETE_ID });
    viewModel.applyProgressFailure("Progress analytics runtime unavailable.");

    expect(viewModel.dashboard).toBeNull();
    expect(viewModel.error?.code).toBe("progress_runtime_unavailable");
  });

  it("hydrated progress path does not import SQLite or repository adapters directly", () => {
    const loadModule = require("../application/loadHydratedProgressExperience");
    const viewModelModule = require("../viewmodels/ProgressExperienceViewModel");

    for (const source of [
      loadModule.loadHydratedProgressExperience.toString(),
      viewModelModule.ProgressExperienceViewModel.toString(),
    ]) {
      expect(source).not.toMatch(/sqlite/i);
      expect(source).not.toMatch(/RepositoryAdapter/);
    }
  });
});

describe("Progress analytics timeline projection regression", () => {
  beforeEach(() => {
    resetCompositionRoot();
    resetMockProgressAnalyticsData();
  });

  afterEach(() => {
    resetCompositionRoot();
    resetMockProgressAnalyticsData();
  });

  it("existing analytics timeline projector remains compatible with workout ingest events", () => {
    const root = getCompositionRoot();
    const projector = root.resolve("AnalyticsTimelineProjector");
    const event = createTestWorkoutAnalyticsTimelineEvent({
      eventId: "evt-regression-workout",
      metadata: Object.freeze({
        source: "workout",
        correlationId: "corr-regression",
        sessionId: "session-regression",
        workoutId: "workout-regression",
        athleteId: ATHLETE_ID,
        publishedAt: FIXED_PUBLISHED_AT,
      }),
    });

    const result = projectAnalyticsEventToTimeline({ projector, event });

    expect(result.accepted).toBe(true);
  });
});
