import { act, renderHook, waitFor } from "@testing-library/react-native";
import { ApiError } from "../../../api/client";
import { WorkoutRuntimeViewModel } from "../viewmodels/WorkoutRuntimeViewModel";
import {
  backendWorkoutRuntimeService,
  resetBackendWorkoutRuntimeServiceForTests,
} from "../providers/BackendWorkoutRuntimeService";
import { useWorkoutRuntime } from "../hooks/useWorkoutRuntime";
import { createWorkoutRuntimeExperienceService } from "../services/experience/workoutRuntimeExperienceFactory";
import { WorkoutRuntimeStatuses } from "../models/experience/WorkoutRuntimeState";
import { WorkoutSetStatuses } from "../models/experience/WorkoutSet";
import { WORKOUT_RUNTIME_REST_DAY_ID } from "../mappers/mapBackendWorkoutToExperienceDto";

jest.mock("../../../api/workouts", () => ({
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

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(() => ({
    isStarting: false,
    status: "ready",
    retrySession: jest.fn(),
  })),
}));

const api = jest.requireMock("../../../api/workouts") as {
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
    name: "Goblet Squat",
    slug: "goblet-squat",
    category: "compound" as const,
    difficulty_level: "beginner" as const,
    video_url: null,
    image_url: null,
    primary_muscle_group: "quadriceps",
    equipment_slugs: ["dumbbell"],
  };
}

function buildWorkoutPublic() {
  return {
    id: "workout-template-1",
    name: "Beginner Full Body A",
    slug: "beginner-full-body-a",
    description: null,
    estimated_duration_minutes: 45,
    is_active: true,
    exercises: [
      {
        id: "line-item-1",
        exercise_id: "exercise-1",
        exercise: buildExerciseCatalogRef(),
        order_index: 0,
        target_sets: 3,
        target_reps_min: 8,
        target_reps_max: 12,
        rest_seconds: 90,
        notes: null,
      },
    ],
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  };
}

function buildProgram() {
  return {
    id: "program-1",
    name: "EVOLVE Beginner Foundation",
    slug: "beginner-foundation",
    description: null,
    duration_weeks: 4,
    goal: "general_fitness" as const,
    difficulty_level: "beginner" as const,
    status: "published" as const,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  };
}

function buildPreview(overrides: Record<string, unknown> = {}) {
  return {
    state: "training_day",
    program: buildProgram(),
    assignment_id: "assignment-1",
    week_number: 1,
    day_number: 1,
    day_label: "Full Body A",
    workout: buildWorkoutPublic(),
    today_log_status: "none",
    active_workout_log_id: null,
    ...overrides,
  };
}

function buildLoggedExercise(sets: unknown[] = []) {
  return {
    id: "log-exercise-1",
    exercise_id: "exercise-1",
    exercise: buildExerciseCatalogRef(),
    workout_exercise_id: "line-item-1",
    order_index: 0,
    exercise_name_snapshot: "Goblet Squat",
    target_sets: 3,
    target_reps_min: 8,
    target_reps_max: 10,
    rest_seconds: 90,
    notes: null,
    skipped: false,
    sets,
    created_at: "2026-08-25T10:00:00Z",
    updated_at: "2026-08-25T10:00:00Z",
  };
}

function buildWorkoutLogDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "log-1",
    user_id: "user-1",
    program_assignment_id: "assignment-1",
    workout_id: "workout-template-1",
    status: "in_progress",
    scheduled_date: "2026-08-25",
    started_at: "2026-08-25T10:00:00Z",
    completed_at: null,
    duration_actual_minutes: null,
    notes: null,
    exercises: [buildLoggedExercise()],
    created_at: "2026-08-25T10:00:00Z",
    updated_at: "2026-08-25T10:00:00Z",
    ...overrides,
  };
}

function stubToday(preview: ReturnType<typeof buildPreview>, activeLog: unknown = null) {
  api.getTodayPreview.mockResolvedValue(preview);
  api.getActiveWorkoutLog.mockResolvedValue(activeLog);
}

describe("Workout vertical slice — backend production path", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetBackendWorkoutRuntimeServiceForTests();
  });

  it("defaults the experience factory to the backend provider", () => {
    expect(createWorkoutRuntimeExperienceService().providerId).toBe("backend");
  });

  it("production Workout tab load calls GET /workout-resolution/today", async () => {
    stubToday(buildPreview());

    const { result } = renderHook(() => useWorkoutRuntime({ athleteId: "user-1" }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(api.getTodayPreview).toHaveBeenCalled();
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.runtime?.exercises.length).toBeGreaterThan(0);
  });

  it("loads GET /workout-resolution/today into a non-empty training-day runtime", async () => {
    stubToday(buildPreview());

    const { result } = renderHook(() =>
      useWorkoutRuntime({ service: backendWorkoutRuntimeService, athleteId: "user-1" }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(api.getTodayPreview).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.runtime?.title).toBe("EVOLVE Beginner Foundation");
    expect(result.current.runtime?.subtitle).toBe("Beginner Full Body A");
    expect(result.current.runtime?.exercises).toHaveLength(1);
    expect(result.current.runtime?.exercises[0]?.sets).toHaveLength(3);
    expect(result.current.runtime?.id).toBe("workout-template-1");
    expect(result.current.runtime?.startedAt).toBeNull();
    expect(result.current.canStart).toBe(true);
    expect(result.current.canFinishSession).toBe(false);
  });

  it("maps rest_day into a Rest Day empty state, not a generic missing workout", async () => {
    stubToday(
      buildPreview({
        state: "rest_day",
        workout: null,
        day_label: "Rest",
      }),
    );

    const viewModel = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await viewModel.loadWorkout();

    expect(viewModel.isEmpty).toBe(true);
    expect(viewModel.isRestDay).toBe(true);
    expect(viewModel.runtime?.id).toBe(WORKOUT_RUNTIME_REST_DAY_ID);
    expect(viewModel.runtime?.title).toBe("Rest Day");
    expect(viewModel.canStart).toBe(false);
    expect(viewModel.runtime?.state.status).toBe(WorkoutRuntimeStatuses.EMPTY);
  });

  it("start creates a WorkoutLog and switches runtime id to the log id", async () => {
    stubToday(buildPreview());
    api.startWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());

    const viewModel = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await viewModel.loadWorkout();
    expect(viewModel.runtime?.id).toBe("workout-template-1");

    await viewModel.startWorkout();

    expect(api.startWorkoutLog).toHaveBeenCalledWith({
      workout_id: "workout-template-1",
      program_assignment_id: "assignment-1",
    });
    expect(viewModel.runtime?.id).toBe("log-1");
    expect(viewModel.runtime?.startedAt).toBe("2026-08-25T10:00:00Z");
    expect(viewModel.canStart).toBe(false);
    expect(viewModel.canFinishSession).toBe(true);
    expect(viewModel.currentSet()?.status).toBe(WorkoutSetStatuses.CURRENT);
  });

  it("saveSet persists weight/reps/RPE against the WorkoutLog id", async () => {
    stubToday(buildPreview());
    api.startWorkoutLog.mockResolvedValueOnce(buildWorkoutLogDetail());
    api.logWorkoutSet.mockResolvedValueOnce({
      id: "set-1",
      set_number: 1,
      weight_kg: "24.00",
      reps: 10,
      rpe: "7.0",
      duration_seconds: null,
      is_warmup: false,
      notes: null,
      created_at: "2026-08-25T10:05:00Z",
      updated_at: "2026-08-25T10:05:00Z",
    });
    api.getWorkoutLog.mockResolvedValueOnce(
      buildWorkoutLogDetail({
        exercises: [
          buildLoggedExercise([
            {
              id: "set-1",
              set_number: 1,
              weight_kg: "24.00",
              reps: 10,
              rpe: "7.0",
              duration_seconds: null,
              is_warmup: false,
              notes: null,
              created_at: "2026-08-25T10:05:00Z",
              updated_at: "2026-08-25T10:05:00Z",
            },
          ]),
        ],
      }),
    );

    const viewModel = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await viewModel.loadWorkout();
    await viewModel.startWorkout();
    viewModel.updateWeight(24);
    viewModel.updateRepetitions(10);
    viewModel.updateRPE(7);

    await viewModel.completeSetAsync();

    expect(api.logWorkoutSet).toHaveBeenCalledWith("log-1", "log-exercise-1", {
      weight_kg: 24,
      reps: 10,
      rpe: 7,
    });
    expect(viewModel.runtime?.id).toBe("log-1");
    expect(viewModel.runtime?.exercises[0]?.sets[0]).toMatchObject({
      id: "set-1",
      completed: true,
      weight: 24,
      repetitions: 10,
      rpe: 7,
    });
  });

  function buildNextTrainingDayPreview() {
    return buildPreview({
      day_number: 2,
      day_label: "Full Body B",
      workout: {
        ...buildWorkoutPublic(),
        id: "workout-template-2",
        name: "Beginner Full Body B",
      },
      today_log_status: "completed",
      active_workout_log_id: "log-1",
    });
  }

  function buildRestDayPreview() {
    return buildPreview({
      state: "rest_day",
      workout: null,
      day_label: "Rest",
      day_number: 2,
      today_log_status: "none",
      active_workout_log_id: null,
    });
  }

  async function loadInProgressSession() {
    stubToday(
      buildPreview({ today_log_status: "in_progress", active_workout_log_id: "log-1" }),
      buildWorkoutLogDetail(),
    );
    const viewModel = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await viewModel.loadWorkout();
    expect(viewModel.runtime?.id).toBe("log-1");
    expect(viewModel.canFinishSession).toBe(true);
    return viewModel;
  }

  it("useWorkoutRuntime finish clears the completed log from the active session", async () => {
    stubToday(
      buildPreview({ today_log_status: "in_progress", active_workout_log_id: "log-1" }),
      buildWorkoutLogDetail(),
    );

    const { result } = renderHook(() =>
      useWorkoutRuntime({ service: backendWorkoutRuntimeService, athleteId: "user-1" }),
    );

    await waitFor(() => {
      expect(result.current.runtime?.id).toBe("log-1");
      expect(result.current.canFinishSession).toBe(true);
    });

    api.finishWorkoutLog.mockResolvedValueOnce(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );
    api.getTodayPreview.mockResolvedValue(buildNextTrainingDayPreview());
    api.getActiveWorkoutLog.mockResolvedValue(null);

    await act(async () => {
      await result.current.finishWorkout();
    });

    expect(result.current.runtime?.id).toBe("workout-template-2");
    expect(result.current.canFinishSession).toBe(false);
    expect(result.current.canStart).toBe(true);
  });

  it("successful finish clears the active runtime/log id", async () => {
    const viewModel = await loadInProgressSession();
    api.finishWorkoutLog.mockResolvedValueOnce(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );
    api.getTodayPreview.mockResolvedValue(buildNextTrainingDayPreview());
    api.getActiveWorkoutLog.mockResolvedValue(null);

    await viewModel.finishWorkout();

    expect(viewModel.runtime?.id).not.toBe("log-1");
    expect(viewModel.canFinishSession).toBe(false);
  });

  it("finish refreshes today's resolution and the active log", async () => {
    const viewModel = await loadInProgressSession();
    const todayCallsBefore = api.getTodayPreview.mock.calls.length;
    const activeCallsBefore = api.getActiveWorkoutLog.mock.calls.length;

    api.finishWorkoutLog.mockResolvedValueOnce(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );
    api.getTodayPreview.mockResolvedValue(buildRestDayPreview());
    api.getActiveWorkoutLog.mockResolvedValue(null);

    await viewModel.finishWorkout();

    expect(api.finishWorkoutLog).toHaveBeenCalledWith("log-1", { notes: undefined });
    expect(api.getTodayPreview.mock.calls.length).toBeGreaterThan(todayCallsBefore);
    expect(api.getActiveWorkoutLog.mock.calls.length).toBeGreaterThan(activeCallsBefore);
  });

  it("completed log cannot receive another set after finish", async () => {
    const viewModel = await loadInProgressSession();
    api.finishWorkoutLog.mockResolvedValueOnce(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );
    api.getTodayPreview.mockResolvedValue(buildNextTrainingDayPreview());
    api.getActiveWorkoutLog.mockResolvedValue(null);

    await viewModel.finishWorkout();
    api.logWorkoutSet.mockClear();

    viewModel.updateWeight(24);
    viewModel.updateRepetitions(10);
    await viewModel.completeSetAsync();

    expect(api.logWorkoutSet).not.toHaveBeenCalled();
    expect(viewModel.runtime?.id).not.toBe("log-1");
  });

  it("repeated finish cannot be sent", async () => {
    const viewModel = await loadInProgressSession();
    let releaseFinish: ((value: unknown) => void) | undefined;
    api.finishWorkoutLog.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          releaseFinish = resolve;
        }),
    );
    api.getTodayPreview.mockResolvedValue(buildRestDayPreview());
    api.getActiveWorkoutLog.mockResolvedValue(null);

    const first = viewModel.finishWorkout();
    const second = viewModel.finishWorkout();
    releaseFinish?.(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );
    await Promise.all([first, second]);
    await viewModel.finishWorkout();

    expect(api.finishWorkoutLog).toHaveBeenCalledTimes(1);
    expect(viewModel.canFinishSession).toBe(false);
  });

  it("renders Rest Day after finish when the cursor advanced to a rest day", async () => {
    const viewModel = await loadInProgressSession();
    api.finishWorkoutLog.mockResolvedValueOnce(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );
    api.getTodayPreview.mockResolvedValue(buildRestDayPreview());
    api.getActiveWorkoutLog.mockResolvedValue(null);

    await viewModel.finishWorkout();

    expect(viewModel.isRestDay).toBe(true);
    expect(viewModel.runtime?.id).toBe(WORKOUT_RUNTIME_REST_DAY_ID);
    expect(viewModel.runtime?.title).toBe("Rest Day");
    expect(viewModel.canFinishSession).toBe(false);
    expect(viewModel.canStart).toBe(false);
  });

  it("renders the next training day after finish even if preview still lists the completed log", async () => {
    const viewModel = await loadInProgressSession();
    api.finishWorkoutLog.mockResolvedValueOnce(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );
    api.getTodayPreview.mockResolvedValue(buildNextTrainingDayPreview());
    api.getActiveWorkoutLog.mockResolvedValue(null);
    api.getWorkoutLog.mockResolvedValue(
      buildWorkoutLogDetail({ status: "completed", completed_at: "2026-08-25T11:00:00Z" }),
    );

    await viewModel.finishWorkout();

    expect(viewModel.runtime?.id).toBe("workout-template-2");
    expect(viewModel.runtime?.subtitle).toBe("Beginner Full Body B");
    expect(viewModel.runtime?.startedAt).toBeNull();
    expect(viewModel.canStart).toBe(true);
    expect(viewModel.canFinishSession).toBe(false);
    expect(api.getWorkoutLog).not.toHaveBeenCalled();
  });

  it("reload after completion reconstructs backend state and does not reopen the completed log", async () => {
    stubToday(buildNextTrainingDayPreview(), null);

    const reloaded = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await reloaded.loadWorkout();

    expect(reloaded.runtime?.id).toBe("workout-template-2");
    expect(reloaded.runtime?.startedAt).toBeNull();
    expect(reloaded.canStart).toBe(true);
    expect(reloaded.canFinishSession).toBe(false);
    expect(api.getWorkoutLog).not.toHaveBeenCalled();
  });

  it("reload reconstructs an in-progress session from the backend log", async () => {
    stubToday(
      buildPreview({ today_log_status: "in_progress", active_workout_log_id: "log-1" }),
      buildWorkoutLogDetail({
        exercises: [
          buildLoggedExercise([
            {
              id: "set-1",
              set_number: 1,
              weight_kg: "20.00",
              reps: 8,
              rpe: "6.0",
              duration_seconds: null,
              is_warmup: false,
              notes: null,
              created_at: "2026-08-25T10:05:00Z",
              updated_at: "2026-08-25T10:05:00Z",
            },
          ]),
        ],
      }),
    );

    const first = new WorkoutRuntimeViewModel({ service: backendWorkoutRuntimeService });
    await first.loadWorkout();
    expect(first.runtime?.id).toBe("log-1");
    expect(first.runtime?.exercises[0]?.sets[0]?.completed).toBe(true);

    const reloaded = new WorkoutRuntimeViewModel({ service: backendWorkoutRuntimeService });
    await reloaded.loadWorkout();

    expect(reloaded.runtime?.id).toBe("log-1");
    expect(reloaded.runtime?.startedAt).toBe("2026-08-25T10:00:00Z");
    expect(reloaded.runtime?.exercises[0]?.sets[0]?.weight).toBe(20);
    expect(reloaded.canStart).toBe(false);
  });

  it("surfaces 503 default-program failure as a retryable error", async () => {
    api.getTodayPreview.mockRejectedValueOnce(
      new ApiError(
        503,
        { detail: "Default beginner program 'beginner-foundation' is not configured." },
        "Default beginner program 'beginner-foundation' is not configured.",
      ),
    );

    const viewModel = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await viewModel.loadWorkout();

    expect(viewModel.runtime).toBeNull();
    expect(viewModel.error?.retryable).toBe(true);
    expect(viewModel.error?.message).toMatch(/beginner-foundation/);
  });

  it("surfaces no_active_program as an actionable retryable error, not an empty workout", async () => {
    stubToday(
      buildPreview({
        state: "no_active_program",
        program: null,
        assignment_id: null,
        workout: null,
      }),
    );

    const viewModel = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await viewModel.loadWorkout();

    expect(viewModel.runtime).toBeNull();
    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.error?.retryable).toBe(true);
    expect(viewModel.error?.message).toMatch(/No active training program/i);
  });

  it("advances a rest day and loads the next training day", async () => {
    stubToday(
      buildPreview({
        state: "rest_day",
        workout: null,
        day_label: "Rest",
        day_number: 2,
      }),
    );

    const viewModel = new WorkoutRuntimeViewModel({
      service: backendWorkoutRuntimeService,
    });
    await viewModel.loadWorkout();
    expect(viewModel.isRestDay).toBe(true);

    api.advanceRestDay.mockResolvedValueOnce(
      buildPreview({
        day_number: 3,
        day_label: "Full Body B",
        workout: {
          ...buildWorkoutPublic(),
          id: "workout-template-2",
          name: "Beginner Full Body B",
        },
      }),
    );
    api.getActiveWorkoutLog.mockResolvedValueOnce(null);

    await viewModel.advanceRestDay();

    expect(api.advanceRestDay).toHaveBeenCalled();
    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.runtime?.id).toBe("workout-template-2");
    expect(viewModel.canStart).toBe(true);
  });
});
