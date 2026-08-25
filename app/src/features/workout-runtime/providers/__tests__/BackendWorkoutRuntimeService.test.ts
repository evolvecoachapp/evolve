import { ApiError } from "../../../../api/client";
import { WorkoutRuntimeExperienceError } from "../../types/workoutRuntimeService";

jest.mock("../../../../api/workouts", () => ({
  getTodayPreview: jest.fn(),
  getActiveWorkoutLog: jest.fn(),
  getWorkoutLog: jest.fn(),
  finishWorkoutLog: jest.fn(),
  startWorkoutLog: jest.fn(),
  logWorkoutSet: jest.fn(),
  updateWorkoutSet: jest.fn(),
  deleteWorkoutSet: jest.fn(),
  advanceRestDay: jest.fn(),
}));

// Imported after the mocks are registered so the provider module picks up the mocked functions.
import {
  backendWorkoutRuntimeService,
  resetBackendWorkoutRuntimeServiceForTests,
} from "../BackendWorkoutRuntimeService";

const api = jest.requireMock("../../../../api/workouts") as {
  getTodayPreview: jest.Mock;
  getActiveWorkoutLog: jest.Mock;
  getWorkoutLog: jest.Mock;
  finishWorkoutLog: jest.Mock;
  startWorkoutLog: jest.Mock;
  logWorkoutSet: jest.Mock;
  updateWorkoutSet: jest.Mock;
  deleteWorkoutSet: jest.Mock;
  advanceRestDay: jest.Mock;
};

function buildExerciseCatalogRef() {
  return {
    id: "exercise-1",
    name: "Back Squat",
    slug: "back-squat",
    category: "compound" as const,
    difficulty_level: "intermediate" as const,
    video_url: null,
    image_url: null,
    primary_muscle_group: "quadriceps",
    equipment_slugs: ["barbell"],
  };
}

function buildWorkoutPublic() {
  return {
    id: "workout-1",
    name: "Leg Day",
    slug: "leg-day",
    description: null,
    estimated_duration_minutes: 60,
    is_active: true,
    exercises: [
      {
        id: "line-item-1",
        exercise_id: "exercise-1",
        exercise: buildExerciseCatalogRef(),
        order_index: 0,
        target_sets: 3,
        target_reps_min: 6,
        target_reps_max: 10,
        rest_seconds: 120,
        notes: null,
      },
    ],
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  };
}

function buildPreview(overrides: Record<string, unknown> = {}) {
  return {
    state: "training_day",
    program: {
      id: "program-1",
      name: "Beginner Foundation",
      slug: "beginner-foundation",
      description: null,
      duration_weeks: 8,
      goal: "general_fitness",
      difficulty_level: "beginner",
      status: "published",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    assignment_id: "assignment-1",
    week_number: 2,
    day_number: 3,
    day_label: "Lower A",
    workout: buildWorkoutPublic(),
    today_log_status: "none",
    active_workout_log_id: null,
    ...overrides,
  };
}

function buildWorkoutLogDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "log-1",
    user_id: "user-1",
    program_assignment_id: "assignment-1",
    workout_id: "workout-1",
    status: "in_progress",
    scheduled_date: "2026-08-12",
    started_at: "2026-08-12T10:00:00Z",
    completed_at: null,
    duration_actual_minutes: null,
    notes: null,
    exercises: [
      {
        id: "log-exercise-1",
        exercise_id: "exercise-1",
        exercise: buildExerciseCatalogRef(),
        workout_exercise_id: "line-item-1",
        order_index: 0,
        exercise_name_snapshot: "Back Squat",
        target_sets: 3,
        target_reps_min: 6,
        target_reps_max: 10,
        rest_seconds: 120,
        notes: null,
        skipped: false,
        sets: [],
        created_at: "2026-08-12T10:00:00Z",
        updated_at: "2026-08-12T10:00:00Z",
      },
    ],
    created_at: "2026-08-12T10:00:00Z",
    updated_at: "2026-08-12T10:00:00Z",
    ...overrides,
  };
}

describe("backendWorkoutRuntimeService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetBackendWorkoutRuntimeServiceForTests();
  });

  it("has the backend provider id", () => {
    expect(backendWorkoutRuntimeService.providerId).toBe("backend");
  });

  describe("authenticated Workout runtime reads", () => {
    it("maps today's preview + active log into WorkoutRuntimeDto via the authenticated API client", async () => {
      api.getTodayPreview.mockResolvedValueOnce(
        buildPreview({ today_log_status: "in_progress", active_workout_log_id: "log-1" }),
      );
      api.getActiveWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());

      const dto = await backendWorkoutRuntimeService.getRuntime();

      expect(api.getTodayPreview).toHaveBeenCalledTimes(1);
      expect(api.getActiveWorkoutLog).toHaveBeenCalledTimes(1);
      expect(api.getWorkoutLog).not.toHaveBeenCalled();
      expect(dto.id).toBe("log-1");
      expect(dto.title).toBe("Beginner Foundation");
      expect(dto.subtitle).toBe("Leg Day");
      expect(dto.exercises).toHaveLength(1);
      expect(dto.exercises[0]?.name).toBe("Back Squat");
      expect(dto.empty).toBe(false);
    });

    it("falls back to GET /workout-logs/{id} when preview lists an active log id but /active is null", async () => {
      api.getTodayPreview.mockResolvedValueOnce(
        buildPreview({ today_log_status: "in_progress", active_workout_log_id: "log-1" }),
      );
      api.getActiveWorkoutLog.mockResolvedValueOnce(null);
      api.getWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());

      const dto = await backendWorkoutRuntimeService.getRuntime();

      expect(api.getWorkoutLog).toHaveBeenCalledWith("log-1");
      expect(dto.id).toBe("log-1");
    });

    it("seeds from today's workout template when it is a training day with no active log", async () => {
      api.getTodayPreview.mockResolvedValueOnce(buildPreview());
      api.getActiveWorkoutLog.mockResolvedValueOnce(null);

      const dto = await backendWorkoutRuntimeService.getRuntime();

      expect(dto.id).toBe("workout-1");
      expect(dto.title).toBe("Beginner Foundation");
      expect(dto.subtitle).toBe("Leg Day");
      expect(dto.exercises[0]?.sets).toHaveLength(3);
      expect(dto.startedAt).toBeNull();
    });

    it("returns an empty runtime for rest days without inventing exercises", async () => {
      api.getTodayPreview.mockResolvedValueOnce(
        buildPreview({
          state: "rest_day",
          workout: null,
          day_label: "Recovery",
        }),
      );
      api.getActiveWorkoutLog.mockResolvedValueOnce(null);

      const dto = await backendWorkoutRuntimeService.getRuntime();

      expect(dto.empty).toBe(true);
      expect(dto.exercises).toHaveLength(0);
      expect(dto.title).toBe("Rest Day");
      expect(dto.id).toBe("workout-runtime-rest-day");
    });

    it("throws an actionable error when no program is assigned", async () => {
      api.getTodayPreview.mockResolvedValueOnce(
        buildPreview({
          state: "no_active_program",
          program: null,
          assignment_id: null,
          workout: null,
        }),
      );

      const failure = backendWorkoutRuntimeService.getRuntime();

      await expect(failure).rejects.toBeInstanceOf(WorkoutRuntimeExperienceError);
      await expect(failure).rejects.toThrow(/No active training program/i);
    });
  });

  describe("supported mutations", () => {
    it("finishes the workout via POST /workout-logs/{id}/finish with session notes", async () => {
      api.finishWorkoutLog.mockResolvedValueOnce(
        buildWorkoutLogDetail({ status: "completed", notes: "solid session" }),
      );

      await expect(
        backendWorkoutRuntimeService.finishRuntime({
          runtimeId: "log-1",
          sessionNotes: "solid session",
        }),
      ).resolves.toBeUndefined();

      expect(api.finishWorkoutLog).toHaveBeenCalledWith("log-1", {
        notes: "solid session",
      });
    });

    it("omits blank session notes rather than sending an empty string", async () => {
      api.finishWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail({ status: "completed" }));

      await backendWorkoutRuntimeService.finishRuntime({
        runtimeId: "log-1",
        sessionNotes: "   ",
      });

      expect(api.finishWorkoutLog).toHaveBeenCalledWith("log-1", {
        notes: undefined,
      });
    });

    it("rejects finish without a session id (validation failure)", async () => {
      const failure = backendWorkoutRuntimeService.finishRuntime({
        runtimeId: "  ",
        sessionNotes: "notes",
      });

      await expect(failure).rejects.toBeInstanceOf(WorkoutRuntimeExperienceError);
      await expect(failure).rejects.toThrow("A workout session id is required");
      expect(api.finishWorkoutLog).not.toHaveBeenCalled();
    });

    it("starts a WorkoutLog from the resolved workout and assignment ids", async () => {
      api.getTodayPreview.mockResolvedValueOnce(buildPreview());
      api.getActiveWorkoutLog.mockResolvedValueOnce(null);
      api.startWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());

      const dto = await backendWorkoutRuntimeService.startRuntime();

      expect(api.startWorkoutLog).toHaveBeenCalledWith({
        workout_id: "workout-1",
        program_assignment_id: "assignment-1",
      });
      expect(dto.id).toBe("log-1");
      expect(dto.startedAt).toBe("2026-08-12T10:00:00Z");
      expect(dto.exercises[0]?.id).toBe("log-exercise-1");
    });

    it("reuses an already in-progress log instead of starting a second session", async () => {
      api.getTodayPreview.mockResolvedValueOnce(buildPreview());
      api.getActiveWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());

      const dto = await backendWorkoutRuntimeService.startRuntime();

      expect(api.startWorkoutLog).not.toHaveBeenCalled();
      expect(dto.id).toBe("log-1");
    });

    it("refuses to start on a rest day", async () => {
      api.getTodayPreview.mockResolvedValueOnce(
        buildPreview({ state: "rest_day", workout: null, day_label: "Recovery" }),
      );

      const failure = backendWorkoutRuntimeService.startRuntime();

      await expect(failure).rejects.toBeInstanceOf(WorkoutRuntimeExperienceError);
      await expect(failure).rejects.toThrow(/rest day/i);
      expect(api.startWorkoutLog).not.toHaveBeenCalled();
    });

    it("persists weight/reps/RPE then returns the log-backed runtime", async () => {
      api.getTodayPreview.mockResolvedValue(buildPreview());
      api.getActiveWorkoutLog.mockResolvedValue(null);
      api.logWorkoutSet.mockResolvedValueOnce({
        id: "set-1",
        set_number: 1,
        weight_kg: "100.00",
        reps: 8,
        rpe: "7.5",
        duration_seconds: null,
        is_warmup: false,
        notes: null,
        created_at: "2026-08-12T10:05:00Z",
        updated_at: "2026-08-12T10:05:00Z",
      });
      api.getWorkoutLog.mockResolvedValueOnce(
        buildWorkoutLogDetail({
          exercises: [
            {
              id: "log-exercise-1",
              exercise_id: "exercise-1",
              exercise: buildExerciseCatalogRef(),
              workout_exercise_id: "line-item-1",
              order_index: 0,
              exercise_name_snapshot: "Back Squat",
              target_sets: 3,
              target_reps_min: 6,
              target_reps_max: 10,
              rest_seconds: 120,
              notes: null,
              skipped: false,
              sets: [
                {
                  id: "set-1",
                  set_number: 1,
                  weight_kg: "100.00",
                  reps: 8,
                  rpe: "7.5",
                  duration_seconds: null,
                  is_warmup: false,
                  notes: null,
                  created_at: "2026-08-12T10:05:00Z",
                  updated_at: "2026-08-12T10:05:00Z",
                },
              ],
              created_at: "2026-08-12T10:00:00Z",
              updated_at: "2026-08-12T10:05:00Z",
            },
          ],
        }),
      );

      const dto = await backendWorkoutRuntimeService.saveSet({
        runtimeId: "log-1",
        exerciseId: "log-exercise-1",
        setId: "log-exercise-1-set-1",
        weight: 100,
        repetitions: 8,
        rpe: 7.5,
      });

      expect(api.logWorkoutSet).toHaveBeenCalledWith("log-1", "log-exercise-1", {
        weight_kg: 100,
        reps: 8,
        rpe: 7.5,
      });
      expect(dto.id).toBe("log-1");
      expect(dto.exercises[0]?.sets[0]).toMatchObject({
        id: "set-1",
        completed: true,
        weight: 100,
        repetitions: 8,
        rpe: 7.5,
      });
    });
  });

  describe("error handling", () => {
    it("wraps a network/API failure on read as WorkoutRuntimeExperienceError, never the raw exception", async () => {
      api.getTodayPreview.mockRejectedValueOnce(new ApiError(500, null, "Internal Server Error"));

      const failure = backendWorkoutRuntimeService.getRuntime();

      await expect(failure).rejects.toBeInstanceOf(WorkoutRuntimeExperienceError);
      await expect(failure).rejects.toThrow("Internal Server Error");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("does not report success when finish mutation fails", async () => {
      api.finishWorkoutLog.mockRejectedValueOnce(new ApiError(409, null, "Session is not in progress"));

      const failure = backendWorkoutRuntimeService.finishRuntime({
        runtimeId: "log-1",
        sessionNotes: "done",
      });

      await expect(failure).rejects.toBeInstanceOf(WorkoutRuntimeExperienceError);
      await expect(failure).rejects.toThrow("Session is not in progress");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("wraps unknown errors with a safe feature message", async () => {
      api.getTodayPreview.mockRejectedValueOnce("boom");

      const failure = backendWorkoutRuntimeService.getRuntime();

      await expect(failure).rejects.toBeInstanceOf(WorkoutRuntimeExperienceError);
      await expect(failure).rejects.toThrow("Failed to load workout runtime.");
    });

    it("surfaces a 503 default-program failure as an actionable error", async () => {
      api.getTodayPreview.mockRejectedValueOnce(
        new ApiError(
          503,
          { detail: "Default beginner program 'beginner-foundation' is not configured." },
          "Default beginner program 'beginner-foundation' is not configured.",
        ),
      );

      const failure = backendWorkoutRuntimeService.getRuntime();

      await expect(failure).rejects.toBeInstanceOf(WorkoutRuntimeExperienceError);
      await expect(failure).rejects.toThrow(/beginner-foundation/);
    });
  });
});
