import type {
  ExerciseCatalogRefDto,
  WorkoutLogDetailDto,
  WorkoutPreviewDto,
  WorkoutPublicDto,
} from "../../../../types/api";
import {
  mapBackendWorkoutToExperienceDto,
  mapEmptyWorkoutRuntimeDto,
  mapWorkoutLogDetailToRuntimeDto,
  mapWorkoutPublicToRuntimeDto,
} from "../mapBackendWorkoutToExperienceDto";

function buildExerciseCatalogRef(
  overrides: Partial<ExerciseCatalogRefDto> = {},
): ExerciseCatalogRefDto {
  return {
    id: "exercise-1",
    name: "Back Squat",
    slug: "back-squat",
    category: "compound",
    difficulty_level: "intermediate",
    video_url: null,
    image_url: null,
    primary_muscle_group: "quadriceps",
    equipment_slugs: ["barbell"],
    ...overrides,
  };
}

function buildWorkoutPublic(overrides: Partial<WorkoutPublicDto> = {}): WorkoutPublicDto {
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
    ...overrides,
  };
}

function buildWorkoutLogDetail(
  overrides: Partial<WorkoutLogDetailDto> = {},
): WorkoutLogDetailDto {
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
    notes: "felt strong",
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
    created_at: "2026-08-12T10:00:00Z",
    updated_at: "2026-08-12T10:05:00Z",
    ...overrides,
  };
}

function buildPreview(overrides: Partial<WorkoutPreviewDto> = {}): WorkoutPreviewDto {
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

describe("mapBackendWorkoutToExperienceDto", () => {
  it("maps a WorkoutLogDetail into the Workout Runtime Experience DTO", () => {
    const dto = mapWorkoutLogDetailToRuntimeDto(
      buildWorkoutLogDetail(),
      "Beginner Foundation",
      "Leg Day",
    );

    expect(dto.id).toBe("log-1");
    expect(dto.title).toBe("Beginner Foundation");
    expect(dto.subtitle).toBe("Leg Day");
    expect(dto.sessionNotes).toBe("felt strong");
    expect(dto.startedAt).toBe("2026-08-12T10:00:00Z");
    expect(dto.finishedAt).toBeNull();
    expect(dto.empty).toBe(false);
    expect(dto.exercises).toHaveLength(1);
    expect(dto.exercises[0]?.id).toBe("log-exercise-1");
    expect(dto.exercises[0]?.name).toBe("Back Squat");
    expect(dto.exercises[0]?.muscleGroup).toBe("Quadriceps");
    expect(dto.exercises[0]?.equipment).toBe("Barbell");
    expect(dto.exercises[0]?.sets).toHaveLength(3);
    expect(dto.exercises[0]?.sets[0]).toMatchObject({
      id: "set-1",
      completed: true,
      weight: 100,
      repetitions: 8,
      rpe: 7.5,
      targetReps: 8,
      restSeconds: 120,
    });
    expect(dto.exercises[0]?.sets[1]?.completed).toBe(false);
    expect(dto.exercises[0]?.sets[1]?.id).toBe("log-exercise-1-set-2");
  });

  it("maps a WorkoutPublic template into prescribed runtime sets", () => {
    const dto = mapWorkoutPublicToRuntimeDto(buildWorkoutPublic(), "Beginner Foundation", "Lower A");

    expect(dto.id).toBe("workout-1");
    expect(dto.title).toBe("Beginner Foundation");
    expect(dto.subtitle).toBe("Lower A");
    expect(dto.startedAt).toBeNull();
    expect(dto.finishedAt).toBeNull();
    expect(dto.exercises[0]?.sets).toHaveLength(3);
    expect(dto.exercises[0]?.sets.every((set) => set.completed !== true)).toBe(true);
    expect(dto.exercises[0]?.sets[0]).toMatchObject({
      targetReps: 8,
      targetRepsMax: 10,
      restSeconds: 120,
    });
  });

  it("prefers the active log over the template when composing today's runtime", () => {
    const dto = mapBackendWorkoutToExperienceDto({
      preview: buildPreview({ today_log_status: "in_progress", active_workout_log_id: "log-1" }),
      activeLog: buildWorkoutLogDetail(),
    });

    expect(dto.id).toBe("log-1");
    expect(dto.exercises[0]?.sets[0]?.completed).toBe(true);
  });

  it("falls back to today's template on a training day with no active log", () => {
    const dto = mapBackendWorkoutToExperienceDto({
      preview: buildPreview(),
      activeLog: null,
    });

    expect(dto.id).toBe("workout-1");
    expect(dto.title).toBe("Beginner Foundation");
    expect(dto.subtitle).toBe("Leg Day");
    expect(dto.exercises[0]?.sets).toHaveLength(3);
  });

  it("returns an explicit empty runtime for rest day / no program (never invents sets)", () => {
    const rest = mapBackendWorkoutToExperienceDto({
      preview: buildPreview({
        state: "rest_day",
        workout: null,
        day_label: "Recovery",
      }),
      activeLog: null,
    });
    expect(rest.empty).toBe(true);
    expect(rest.exercises).toHaveLength(0);
    expect(rest.title).toBe("Rest Day");
    expect(rest.id).toBe("workout-runtime-rest-day");

    const none = mapBackendWorkoutToExperienceDto({
      preview: buildPreview({
        state: "no_active_program",
        program: null,
        workout: null,
        assignment_id: null,
      }),
      activeLog: null,
    });
    expect(none.empty).toBe(true);
    expect(none.title).toBe("No Workout");
  });

  it("maps a completed WorkoutLogDetail with finishedAt so it cannot stay editable", () => {
    const dto = mapWorkoutLogDetailToRuntimeDto(
      buildWorkoutLogDetail({
        status: "completed",
        completed_at: "2026-08-12T11:00:00Z",
      }),
      "Beginner Foundation",
      "Leg Day",
    );

    expect(dto.id).toBe("log-1");
    expect(dto.finishedAt).toBe("2026-08-12T11:00:00Z");
    expect(dto.startedAt).toBe("2026-08-12T10:00:00Z");
  });

  it("does not keep a completed log as today's editable session when the cursor advanced", () => {
    const nextDay = buildWorkoutPublic({
      id: "workout-2",
      name: "Upper A",
      slug: "upper-a",
    });
    const dto = mapBackendWorkoutToExperienceDto({
      preview: buildPreview({
        day_number: 4,
        day_label: "Upper A",
        workout: nextDay,
        today_log_status: "completed",
        active_workout_log_id: "log-1",
      }),
      activeLog: buildWorkoutLogDetail({
        status: "completed",
        completed_at: "2026-08-12T11:00:00Z",
      }),
    });

    expect(dto.id).toBe("workout-2");
    expect(dto.subtitle).toBe("Upper A");
    expect(dto.startedAt).toBeNull();
    expect(dto.finishedAt).toBeNull();
  });

  it("maps rest day after a completed log instead of reusing that log", () => {
    const dto = mapBackendWorkoutToExperienceDto({
      preview: buildPreview({
        state: "rest_day",
        workout: null,
        day_label: "Recovery",
        today_log_status: "none",
        active_workout_log_id: null,
      }),
      activeLog: buildWorkoutLogDetail({
        status: "completed",
        completed_at: "2026-08-12T11:00:00Z",
      }),
    });

    expect(dto.empty).toBe(true);
    expect(dto.id).toBe("workout-runtime-rest-day");
    expect(dto.title).toBe("Rest Day");
  });

  it("mapEmptyWorkoutRuntimeDto marks empty and clears exercises", () => {
    const dto = mapEmptyWorkoutRuntimeDto({ title: "Custom Empty" });
    expect(dto.empty).toBe(true);
    expect(dto.title).toBe("Custom Empty");
    expect(dto.exercises).toEqual([]);
  });
});
