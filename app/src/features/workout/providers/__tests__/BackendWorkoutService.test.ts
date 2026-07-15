import { ApiError } from "../../../../api/client";
import { WorkoutServiceError } from "../../types/workoutService";

jest.mock("../../../../api/workouts", () => ({
  getTodayPreview: jest.fn(),
  getWorkoutTemplate: jest.fn(),
  startWorkoutLog: jest.fn(),
  finishWorkoutLog: jest.fn(),
  logWorkoutSet: jest.fn(),
  updateWorkoutSet: jest.fn(),
  deleteWorkoutSet: jest.fn(),
  skipWorkoutLogExercise: jest.fn(),
  listWorkoutLogHistory: jest.fn(),
  getWorkoutLog: jest.fn(),
  getActiveWorkoutLog: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const api = jest.requireMock("../../../../api/workouts") as Record<string, jest.Mock>;

// Imported after the mock is registered so the provider module picks up the mocked functions.
import { backendWorkoutService } from "../BackendWorkoutService";

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

function buildWorkoutLogDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "log-1",
    user_id: "user-1",
    program_assignment_id: null,
    workout_id: "workout-1",
    status: "in_progress",
    scheduled_date: null,
    started_at: "2026-07-01T10:00:00Z",
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
        created_at: "2026-07-01T10:00:00Z",
        updated_at: "2026-07-01T10:00:00Z",
      },
    ],
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
    ...overrides,
  };
}

describe("backendWorkoutService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("has the backend provider id", () => {
    expect(backendWorkoutService.providerId).toBe("backend");
  });

  describe("getTodayWorkout", () => {
    it("maps a training_day preview into a Workout", async () => {
      api.getTodayPreview.mockResolvedValueOnce({
        state: "training_day",
        program: { name: "Powerbuilding Block 1" },
        assignment_id: "assignment-1",
        week_number: 1,
        day_number: 1,
        day_label: "Leg Day",
        workout: buildWorkoutPublic(),
        today_log_status: "none",
        active_workout_log_id: null,
      });

      const workout = await backendWorkoutService.getTodayWorkout();

      expect(workout.id).toBe("workout-1");
      expect(workout.title).toBe("Powerbuilding Block 1");
      expect(workout.subtitle).toBe("Leg Day");
      expect(workout.scheduleLabels).toEqual({ weekLabel: "Week 1", dayLabel: "Leg Day" });
      expect(workout.exercises).toHaveLength(1);
    });

    it("throws a WorkoutServiceError describing a rest day", async () => {
      const restDayPreview = {
        state: "rest_day",
        program: null,
        assignment_id: null,
        week_number: null,
        day_number: null,
        day_label: null,
        workout: null,
        today_log_status: "none",
        active_workout_log_id: null,
      };
      api.getTodayPreview.mockResolvedValue(restDayPreview);

      await expect(backendWorkoutService.getTodayWorkout()).rejects.toBeInstanceOf(WorkoutServiceError);
      await expect(backendWorkoutService.getTodayWorkout()).rejects.toThrow(/rest day/i);
    });

    it("wraps ApiError failures as WorkoutServiceError", async () => {
      api.getTodayPreview.mockRejectedValueOnce(new ApiError(500, null, "boom"));
      await expect(backendWorkoutService.getTodayWorkout()).rejects.toBeInstanceOf(WorkoutServiceError);
    });
  });

  describe("getWorkout", () => {
    it("returns a mapped Workout for a known id", async () => {
      api.getWorkoutTemplate.mockResolvedValueOnce(buildWorkoutPublic());
      const workout = await backendWorkoutService.getWorkout("workout-1");
      expect(workout?.id).toBe("workout-1");
    });

    it("returns null for a 404", async () => {
      api.getWorkoutTemplate.mockRejectedValueOnce(new ApiError(404, null, "not found"));
      const workout = await backendWorkoutService.getWorkout("missing");
      expect(workout).toBeNull();
    });
  });

  describe("getSession", () => {
    it("loads a session by id and maps it using cached display metadata", async () => {
      api.getTodayPreview.mockResolvedValueOnce({
        state: "training_day",
        program: { name: "Powerbuilding Block 1" },
        assignment_id: "assignment-1",
        week_number: 1,
        day_number: 1,
        day_label: "Leg Day",
        workout: buildWorkoutPublic(),
        today_log_status: "none",
        active_workout_log_id: null,
      });
      await backendWorkoutService.getTodayWorkout();
      api.startWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());
      const started = await backendWorkoutService.startWorkout("workout-1");

      api.getWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());
      const session = await backendWorkoutService.getSession(started.id);

      expect(api.getWorkoutLog).toHaveBeenCalledWith(started.id);
      expect(session?.id).toBe("log-1");
      expect(session?.title).toBe("Powerbuilding Block 1");
    });

    it("returns null for a missing session", async () => {
      api.getWorkoutLog.mockRejectedValueOnce(new ApiError(404, null, "not found"));
      const session = await backendWorkoutService.getSession("missing");
      expect(session).toBeNull();
    });
  });

  describe("getActiveSession", () => {
    it("returns null when there is no in-progress session", async () => {
      api.getActiveWorkoutLog.mockResolvedValueOnce(null);
      const session = await backendWorkoutService.getActiveSession();
      expect(session).toBeNull();
    });

    it("maps the active session when one exists", async () => {
      api.getActiveWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());
      const session = await backendWorkoutService.getActiveSession();
      expect(session?.id).toBe("log-1");
      expect(session?.status).toBe("in_progress");
    });
  });

  describe("startWorkout / finishWorkout", () => {
    it("starts a session and attaches the cached program_assignment_id from the last preview", async () => {
      api.getTodayPreview.mockResolvedValueOnce({
        state: "training_day",
        program: { name: "Powerbuilding Block 1" },
        assignment_id: "assignment-1",
        week_number: 1,
        day_number: 1,
        day_label: "Leg Day",
        workout: buildWorkoutPublic(),
        today_log_status: "none",
        active_workout_log_id: null,
      });
      await backendWorkoutService.getTodayWorkout();

      api.startWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());

      const session = await backendWorkoutService.startWorkout("workout-1");

      expect(api.startWorkoutLog).toHaveBeenCalledWith({
        workout_id: "workout-1",
        program_assignment_id: "assignment-1",
      });
      expect(session.id).toBe("log-1");
      expect(session.title).toBe("Powerbuilding Block 1");
      expect(session.exercises[0].workingSets).toHaveLength(3);
    });

    it("finishes a session and maps the summary using cached display metadata", async () => {
      api.getTodayPreview.mockResolvedValueOnce({
        state: "training_day",
        program: { name: "Powerbuilding Block 1" },
        assignment_id: "assignment-1",
        week_number: 1,
        day_number: 1,
        day_label: "Leg Day",
        workout: buildWorkoutPublic(),
        today_log_status: "none",
        active_workout_log_id: null,
      });
      await backendWorkoutService.getTodayWorkout();
      api.startWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());
      const session = await backendWorkoutService.startWorkout("workout-1");

      api.finishWorkoutLog.mockResolvedValueOnce(
        buildWorkoutLogDetail({
          status: "completed",
          completed_at: "2026-07-01T11:00:00Z",
          duration_actual_minutes: 60,
        }),
      );

      const summary = await backendWorkoutService.finishWorkout(session.id);

      expect(api.finishWorkoutLog).toHaveBeenCalledWith(session.id, {});
      expect(summary.title).toBe("Powerbuilding Block 1");
      expect(summary.durationMinutes).toBe(60);
    });
  });

  describe("saveSet", () => {
    it("creates a set when the local set id is a placeholder, returning the server-confirmed result", async () => {
      api.logWorkoutSet.mockResolvedValueOnce({
        id: "server-set-1",
        set_number: 1,
        weight_kg: "100.00",
        reps: 8,
        rpe: "7",
        duration_seconds: null,
        is_warmup: false,
        notes: null,
        created_at: "2026-07-01T10:05:00Z",
        updated_at: "2026-07-01T10:05:00Z",
      });

      const saved = await backendWorkoutService.saveSet({
        sessionId: "log-1",
        exerciseId: "log-exercise-1",
        setId: "log-exercise-1-set-1",
        completedReps: 8,
        completedWeight: 100,
        rpe: 7,
        completed: true,
      });

      expect(api.logWorkoutSet).toHaveBeenCalledWith("log-1", "log-exercise-1", {
        weight_kg: 100,
        reps: 8,
        rpe: 7,
      });
      expect(saved).toEqual({ id: "server-set-1", completedReps: 8, completedWeight: 100, rpe: 7 });
    });

    it("does nothing for an un-completed placeholder set", async () => {
      const saved = await backendWorkoutService.saveSet({
        sessionId: "log-1",
        exerciseId: "log-exercise-1",
        setId: "log-exercise-1-set-1",
        completedReps: null,
        completedWeight: null,
        rpe: null,
        completed: false,
      });

      expect(api.logWorkoutSet).not.toHaveBeenCalled();
      expect(saved).toBeNull();
    });

    it("updates an existing logged set by its real backend id, returning the server-confirmed result", async () => {
      api.updateWorkoutSet.mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
        set_number: 1,
        weight_kg: "105.00",
        reps: 9,
        rpe: "8",
        duration_seconds: null,
        is_warmup: false,
        notes: null,
        created_at: "2026-07-01T10:05:00Z",
        updated_at: "2026-07-01T10:05:00Z",
      });

      const saved = await backendWorkoutService.saveSet({
        sessionId: "log-1",
        exerciseId: "log-exercise-1",
        setId: "11111111-1111-1111-1111-111111111111",
        completedReps: 9,
        completedWeight: 105,
        rpe: 8,
        completed: true,
      });

      expect(api.updateWorkoutSet).toHaveBeenCalledWith(
        "log-1",
        "log-exercise-1",
        "11111111-1111-1111-1111-111111111111",
        { weight_kg: 105, reps: 9, rpe: 8 },
      );
      expect(saved).toEqual({
        id: "11111111-1111-1111-1111-111111111111",
        completedReps: 9,
        completedWeight: 105,
        rpe: 8,
      });
    });

    it("deletes a logged set when un-completing it, returning null", async () => {
      api.deleteWorkoutSet.mockResolvedValueOnce(undefined);

      const saved = await backendWorkoutService.saveSet({
        sessionId: "log-1",
        exerciseId: "log-exercise-1",
        setId: "11111111-1111-1111-1111-111111111111",
        completedReps: null,
        completedWeight: null,
        rpe: null,
        completed: false,
      });

      expect(api.deleteWorkoutSet).toHaveBeenCalledWith(
        "log-1",
        "log-exercise-1",
        "11111111-1111-1111-1111-111111111111",
      );
      expect(saved).toBeNull();
    });
  });

  describe("skipExercise", () => {
    it("delegates to the skip-exercise endpoint", async () => {
      api.skipWorkoutLogExercise.mockResolvedValueOnce({});

      await backendWorkoutService.skipExercise({ sessionId: "log-1", exerciseId: "log-exercise-1" });

      expect(api.skipWorkoutLogExercise).toHaveBeenCalledWith("log-1", "log-exercise-1");
    });
  });

  describe("getHistory", () => {
    it("fetches completed session summaries then their full details", async () => {
      api.listWorkoutLogHistory.mockResolvedValueOnce({
        items: [{ id: "log-1", exercise_count: 1 }],
        total: 1,
        limit: 20,
        offset: 0,
      });
      api.getWorkoutLog.mockResolvedValueOnce(
        buildWorkoutLogDetail({
          status: "completed",
          completed_at: "2026-07-01T11:00:00Z",
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
                  rpe: null,
                  duration_seconds: null,
                  is_warmup: false,
                  notes: null,
                  created_at: "2026-07-01T10:05:00Z",
                  updated_at: "2026-07-01T10:05:00Z",
                },
              ],
              created_at: "2026-07-01T10:00:00Z",
              updated_at: "2026-07-01T10:00:00Z",
            },
          ],
        }),
      );

      const history = await backendWorkoutService.getHistory();

      expect(api.listWorkoutLogHistory).toHaveBeenCalledWith({ status: "completed", limit: 20 });
      expect(history).toHaveLength(1);
      expect(history[0].exerciseName).toBe("Back Squat");
    });
  });
});
