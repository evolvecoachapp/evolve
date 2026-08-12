import { ApiError } from "../../../../api/client";
import { RecoveryExperienceError } from "../../services";
import type { RecoveryDay } from "../../models";
import { createRecoveryDay } from "../../models";

jest.mock("../../../../api/recovery", () => ({
  listRecoveryCheckIns: jest.fn(),
  createRecoveryCheckIn: jest.fn(),
  updateRecoveryCheckIn: jest.fn(),
  getDailyReadiness: jest.fn(),
}));

// Imported after the mocks are registered so the provider module picks up the mocked functions.
import { backendRecoveryExperienceService } from "../BackendRecoveryExperienceService";

const mockedListRecoveryCheckIns = jest.requireMock("../../../../api/recovery")
  .listRecoveryCheckIns as jest.MockedFunction<
  typeof import("../../../../api/recovery").listRecoveryCheckIns
>;
const mockedCreateRecoveryCheckIn = jest.requireMock("../../../../api/recovery")
  .createRecoveryCheckIn as jest.MockedFunction<
  typeof import("../../../../api/recovery").createRecoveryCheckIn
>;
const mockedUpdateRecoveryCheckIn = jest.requireMock("../../../../api/recovery")
  .updateRecoveryCheckIn as jest.MockedFunction<
  typeof import("../../../../api/recovery").updateRecoveryCheckIn
>;
const mockedGetDailyReadiness = jest.requireMock("../../../../api/recovery")
  .getDailyReadiness as jest.MockedFunction<
  typeof import("../../../../api/recovery").getDailyReadiness
>;

const TODAY: RecoveryDay = createRecoveryDay({
  id: "today",
  isoDate: "2026-08-12",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

function buildCheckIn(overrides: Record<string, unknown> = {}) {
  return {
    id: "check-in-1",
    user_id: "user-1",
    checkin_date: "2026-08-12",
    sleep_hours: "7.50",
    sleep_quality: 4,
    soreness: 2,
    fatigue: 3,
    resting_heart_rate: null,
    hrv_ms: null,
    notes: null,
    created_at: "2026-08-12T07:00:00.000Z",
    updated_at: "2026-08-12T07:00:00.000Z",
    ...overrides,
  };
}

function buildReadiness(overrides: Record<string, unknown> = {}) {
  return {
    readiness_score: "74.00",
    readiness_level: "moderate" as const,
    recommendation_text: "Moderate readiness — keep intensity controlled today.",
    protocols: ["Prioritize hydration", "Keep sessions under 60 minutes"],
    for_date: "2026-08-12",
    ...overrides,
  };
}

function mockDayReads(options?: {
  checkIn?: ReturnType<typeof buildCheckIn> | null;
  readiness?: ReturnType<typeof buildReadiness> | null;
  readinessError?: unknown;
}) {
  const checkIn = options && "checkIn" in options ? options.checkIn : buildCheckIn();
  mockedListRecoveryCheckIns.mockResolvedValue({
    items: checkIn ? [checkIn] : [],
    total: checkIn ? 1 : 0,
    limit: 1,
    offset: 0,
  });

  if (options?.readinessError) {
    mockedGetDailyReadiness.mockRejectedValue(options.readinessError);
  } else if (options && "readiness" in options && options.readiness === null) {
    mockedGetDailyReadiness.mockRejectedValue(
      new ApiError(404, null, "No check-in found for 2026-08-12. Log a check-in for that date first."),
    );
  } else {
    mockedGetDailyReadiness.mockResolvedValue(
      options?.readiness ?? buildReadiness(),
    );
  }
}

describe("backendRecoveryExperienceService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("has the backend provider id", () => {
    expect(backendRecoveryExperienceService.providerId).toBe("backend");
  });

  describe("authenticated Recovery reads", () => {
    it("maps GET /check-ins + GET /readiness into the Recovery Experience dashboard via the authenticated API client", async () => {
      mockDayReads();

      const dto = await backendRecoveryExperienceService.getDashboard(TODAY);

      expect(mockedListRecoveryCheckIns).toHaveBeenCalledWith({
        date_from: "2026-08-12",
        date_to: "2026-08-12",
        limit: 1,
        offset: 0,
      });
      expect(mockedGetDailyReadiness).toHaveBeenCalledWith({ for_date: "2026-08-12" });
      expect(dto.day.isoDate).toBe("2026-08-12");
      expect(dto.summary).toContain("Moderate readiness");
      expect(dto.recoveryScore).toBe(74);
      expect(dto.status).toBe("moderate");
      expect(dto.sleep.hours).toBe(7.5);
      expect(dto.sleep.quality).toBe(80);
      expect(dto.sleep.logged).toBe(true);
      expect(dto.readiness.score).toBe(74);
      expect(dto.readiness.label).toBe("good");
      expect(dto.signals.some((s) => s.summary.includes("Fatigue"))).toBe(true);
      expect(dto.signals.some((s) => s.summary.includes("Prioritize hydration"))).toBe(true);
      expect(dto.assessmentAvailable).toBe(true);
      expect(dto.availableDays).toHaveLength(3);
      expect(dto.availableDays[0]?.isoDate).toBe("2026-08-11");
      expect(dto.availableDays[2]?.isoDate).toBe("2026-08-13");
    });

    it("returns an empty dashboard when neither check-in nor readiness exists for the day", async () => {
      mockDayReads({ checkIn: null, readiness: null });

      const dto = await backendRecoveryExperienceService.getDashboard(TODAY);

      expect(dto.recoveryScore).toBe(0);
      expect(dto.sleep.logged).toBe(false);
      expect(dto.assessmentAvailable).toBe(false);
      expect(dto.headline).toBe("No recovery data yet");
    });

    it("requests the selected day's backend data when navigating days", async () => {
      const yesterday = createRecoveryDay({
        id: "yesterday",
        isoDate: "2026-08-11",
        label: "Yesterday",
        shortLabel: "Yday",
        relativeLabel: "Yesterday",
        isToday: false,
      });
      mockedListRecoveryCheckIns.mockResolvedValueOnce({
        items: [buildCheckIn({ checkin_date: "2026-08-11", sleep_hours: "6.00" })],
        total: 1,
        limit: 1,
        offset: 0,
      });
      mockedGetDailyReadiness.mockResolvedValueOnce(
        buildReadiness({ for_date: "2026-08-11", readiness_score: "58.00" }),
      );

      const dto = await backendRecoveryExperienceService.getDashboard(yesterday);

      expect(mockedListRecoveryCheckIns).toHaveBeenCalledWith({
        date_from: "2026-08-11",
        date_to: "2026-08-11",
        limit: 1,
        offset: 0,
      });
      expect(mockedGetDailyReadiness).toHaveBeenCalledWith({ for_date: "2026-08-11" });
      expect(dto.day.isoDate).toBe("2026-08-11");
      expect(dto.recoveryScore).toBe(58);
      expect(dto.availableDays[0]?.isoDate).toBe("2026-08-10");
      expect(dto.availableDays[2]?.isoDate).toBe("2026-08-12");
    });
  });

  describe("supported mutations", () => {
    it("creates a check-in when logging sleep for a day without one, then returns the refreshed dashboard", async () => {
      mockedListRecoveryCheckIns
        .mockResolvedValueOnce({ items: [], total: 0, limit: 1, offset: 0 })
        .mockResolvedValueOnce({
          items: [buildCheckIn({ sleep_hours: "8.00", sleep_quality: 4 })],
          total: 1,
          limit: 1,
          offset: 0,
        });
      mockedCreateRecoveryCheckIn.mockResolvedValueOnce(
        buildCheckIn({ sleep_hours: "8.00", sleep_quality: 4 }),
      );
      mockedGetDailyReadiness.mockResolvedValue(buildReadiness({ readiness_score: "80.00" }));

      const dto = await backendRecoveryExperienceService.logSleep(TODAY, 8);

      expect(mockedCreateRecoveryCheckIn).toHaveBeenCalledWith({
        checkin_date: "2026-08-12",
        sleep_hours: 8,
        sleep_quality: 4,
        soreness: 3,
        fatigue: 3,
      });
      expect(mockedUpdateRecoveryCheckIn).not.toHaveBeenCalled();
      expect(dto.sleep.hours).toBe(8);
      expect(dto.sleep.logged).toBe(true);
      expect(dto.recoveryScore).toBe(80);
    });

    it("updates an existing check-in when logging sleep for a day that already has one", async () => {
      const existing = buildCheckIn();
      mockedListRecoveryCheckIns
        .mockResolvedValueOnce({ items: [existing], total: 1, limit: 1, offset: 0 })
        .mockResolvedValueOnce({
          items: [buildCheckIn({ sleep_hours: "6.50", sleep_quality: 3 })],
          total: 1,
          limit: 1,
          offset: 0,
        });
      mockedUpdateRecoveryCheckIn.mockResolvedValueOnce(
        buildCheckIn({ sleep_hours: "6.50", sleep_quality: 3 }),
      );
      mockedGetDailyReadiness.mockResolvedValue(buildReadiness());

      const dto = await backendRecoveryExperienceService.logSleep(TODAY, 6.5);

      expect(mockedUpdateRecoveryCheckIn).toHaveBeenCalledWith("check-in-1", {
        sleep_hours: 6.5,
        sleep_quality: 3,
      });
      expect(mockedCreateRecoveryCheckIn).not.toHaveBeenCalled();
      expect(dto.sleep.hours).toBe(6.5);
    });

    it("assesses recovery via GET /readiness and returns the refreshed dashboard", async () => {
      mockedGetDailyReadiness.mockResolvedValue(buildReadiness({ readiness_score: "81.00" }));
      mockedListRecoveryCheckIns.mockResolvedValue({
        items: [buildCheckIn()],
        total: 1,
        limit: 1,
        offset: 0,
      });

      const dto = await backendRecoveryExperienceService.assessRecovery(TODAY);

      expect(mockedGetDailyReadiness).toHaveBeenCalledWith({ for_date: "2026-08-12" });
      expect(dto.recoveryScore).toBe(81);
      expect(dto.assessmentAvailable).toBe(true);
    });
  });

  describe("error handling", () => {
    it("wraps a network/API failure as a RecoveryExperienceError, never the raw exception", async () => {
      mockedListRecoveryCheckIns.mockRejectedValueOnce(
        new ApiError(500, null, "Internal Server Error"),
      );
      mockedGetDailyReadiness.mockRejectedValueOnce(
        new ApiError(500, null, "Internal Server Error"),
      );

      const failure = backendRecoveryExperienceService.getDashboard(TODAY);

      await expect(failure).rejects.toBeInstanceOf(RecoveryExperienceError);
      await expect(failure).rejects.toThrow("Internal Server Error");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("surfaces a backend validation failure as a RecoveryExperienceError", async () => {
      mockedListRecoveryCheckIns.mockResolvedValueOnce({
        items: [],
        total: 0,
        limit: 1,
        offset: 0,
      });
      mockedCreateRecoveryCheckIn.mockRejectedValueOnce(
        new ApiError(
          422,
          { detail: [{ loc: ["body", "sleep_hours"], msg: "Input should be less than or equal to 24" }] },
          "Request failed with status 422.",
        ),
      );

      const failure = backendRecoveryExperienceService.logSleep(TODAY, 30);

      await expect(failure).rejects.toBeInstanceOf(RecoveryExperienceError);
      await expect(failure).rejects.toThrow(/422/);
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
      // Failed mutation must not pretend success — no second read after create failure.
      expect(mockedListRecoveryCheckIns).toHaveBeenCalledTimes(1);
    });

    it("does not report a successful dashboard when a backend read fails", async () => {
      mockedListRecoveryCheckIns.mockResolvedValueOnce({
        items: [buildCheckIn()],
        total: 1,
        limit: 1,
        offset: 0,
      });
      mockedGetDailyReadiness.mockRejectedValueOnce(new ApiError(503, null, "Service Unavailable"));

      await expect(backendRecoveryExperienceService.getDashboard(TODAY)).rejects.toThrow(
        "Service Unavailable",
      );
    });

    it("does not mutate as success when assessRecovery fails", async () => {
      mockedGetDailyReadiness.mockRejectedValueOnce(
        new ApiError(
          404,
          null,
          "No check-in found for 2026-08-12. Log a check-in for that date first.",
        ),
      );

      await expect(backendRecoveryExperienceService.assessRecovery(TODAY)).rejects.toBeInstanceOf(
        RecoveryExperienceError,
      );
      expect(mockedListRecoveryCheckIns).not.toHaveBeenCalled();
    });

    it("does not mutate as success when logSleep update fails", async () => {
      mockedListRecoveryCheckIns.mockResolvedValueOnce({
        items: [buildCheckIn()],
        total: 1,
        limit: 1,
        offset: 0,
      });
      mockedUpdateRecoveryCheckIn.mockRejectedValueOnce(
        new ApiError(409, null, "Conflict"),
      );

      await expect(backendRecoveryExperienceService.logSleep(TODAY, 7)).rejects.toThrow("Conflict");
      expect(mockedListRecoveryCheckIns).toHaveBeenCalledTimes(1);
    });
  });

  describe("unsupported Recovery operations", () => {
    it("updateReadiness stays explicitly unsupported by the backend", async () => {
      await expect(backendRecoveryExperienceService.updateReadiness(TODAY, 80)).rejects.toBeInstanceOf(
        RecoveryExperienceError,
      );
      await expect(backendRecoveryExperienceService.updateReadiness(TODAY, 80)).rejects.toThrow(
        /not supported by the backend/i,
      );
      expect(mockedListRecoveryCheckIns).not.toHaveBeenCalled();
      expect(mockedGetDailyReadiness).not.toHaveBeenCalled();
      expect(mockedCreateRecoveryCheckIn).not.toHaveBeenCalled();
      expect(mockedUpdateRecoveryCheckIn).not.toHaveBeenCalled();
    });

    it("rejects non-positive sleep hours without calling the API", async () => {
      await expect(backendRecoveryExperienceService.logSleep(TODAY, 0)).rejects.toThrow(
        /greater than zero/i,
      );
      expect(mockedListRecoveryCheckIns).not.toHaveBeenCalled();
      expect(mockedCreateRecoveryCheckIn).not.toHaveBeenCalled();
    });
  });
});
