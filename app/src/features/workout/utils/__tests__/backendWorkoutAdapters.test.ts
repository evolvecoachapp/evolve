import type {
  ExerciseCatalogRefDto,
  WorkoutLogDetailDto,
  WorkoutLogExerciseReadDto,
  WorkoutPreviewDto,
  WorkoutPublicDto,
} from "../../../../types/api";
import {
  mapEquipmentSlugs,
  mapExerciseCatalogRef,
  mapMuscleGroupSlug,
  mapPreviewToScheduleLabels,
  mapWorkoutLogDetailToExerciseHistory,
  mapWorkoutLogDetailToWorkoutSession,
  mapWorkoutLogDetailToWorkoutSummary,
  mapWorkoutPublicToWorkout,
  mapWorkoutSetLogToSavedSetResult,
} from "../backendWorkoutAdapters";

function buildExerciseCatalogRef(overrides: Partial<ExerciseCatalogRefDto> = {}): ExerciseCatalogRefDto {
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

describe("mapMuscleGroupSlug", () => {
  it("maps known catalog slugs to the frontend union", () => {
    expect(mapMuscleGroupSlug("quadriceps")).toBe("quads");
    expect(mapMuscleGroupSlug("abs")).toBe("core");
    expect(mapMuscleGroupSlug("chest")).toBe("chest");
  });

  it("falls back to core for unmapped or null slugs", () => {
    expect(mapMuscleGroupSlug(null)).toBe("core");
    expect(mapMuscleGroupSlug("some-new-slug")).toBe("core");
  });
});

describe("mapEquipmentSlugs", () => {
  it("prefers the primary lifting implement when multiple slugs are present", () => {
    expect(mapEquipmentSlugs(["bench", "barbell"])).toBe("barbell");
  });

  it("falls back to bodyweight for unmapped or empty slug lists", () => {
    expect(mapEquipmentSlugs([])).toBe("bodyweight");
    expect(mapEquipmentSlugs(["pull-up-bar"])).toBe("bodyweight");
  });
});

describe("mapExerciseCatalogRef", () => {
  it("maps a catalog ref into the frontend Exercise model", () => {
    const exercise = mapExerciseCatalogRef(buildExerciseCatalogRef());

    expect(exercise.id).toBe("exercise-1");
    expect(exercise.name).toBe("Back Squat");
    expect(exercise.muscleGroup).toBe("quads");
    expect(exercise.equipment).toBe("barbell");
  });

  it("honors a name override (used for historical exercise_name_snapshot)", () => {
    const exercise = mapExerciseCatalogRef(buildExerciseCatalogRef(), "Renamed Squat");
    expect(exercise.name).toBe("Renamed Squat");
  });
});

function buildWorkoutPublic(overrides: Partial<WorkoutPublicDto> = {}): WorkoutPublicDto {
  return {
    id: "workout-1",
    name: "Leg Day",
    slug: "leg-day",
    description: "Quad-focused strength session.",
    estimated_duration_minutes: 60,
    is_active: true,
    exercises: [
      {
        id: "line-item-1",
        exercise_id: "exercise-1",
        exercise: buildExerciseCatalogRef(),
        order_index: 0,
        target_sets: 4,
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

describe("mapWorkoutPublicToWorkout", () => {
  it("maps a template into the frontend Workout, padding placeholder working sets to target_sets", () => {
    const workout = mapWorkoutPublicToWorkout(
      buildWorkoutPublic(),
      { weekLabel: "Week 1", dayLabel: "Day 1" },
      "Powerbuilding Block 1",
      "Leg Day",
    );

    expect(workout.id).toBe("workout-1");
    expect(workout.title).toBe("Powerbuilding Block 1");
    expect(workout.subtitle).toBe("Leg Day");
    expect(workout.exercises).toHaveLength(1);

    const exercise = workout.exercises[0];
    expect(exercise.workingSets).toHaveLength(4);
    expect(exercise.workingSets[0].targetReps).toBe(8);
    expect(exercise.workingSets[0].completed).toBe(false);
    expect(exercise.warmupSets).toHaveLength(0);
  });

  it("orders exercises by order_index", () => {
    const dto = buildWorkoutPublic({
      exercises: [
        {
          id: "second",
          exercise_id: "exercise-2",
          exercise: buildExerciseCatalogRef({ id: "exercise-2", name: "Leg Press" }),
          order_index: 1,
          target_sets: 3,
          target_reps_min: 10,
          target_reps_max: 12,
          rest_seconds: 90,
          notes: null,
        },
        {
          id: "first",
          exercise_id: "exercise-1",
          exercise: buildExerciseCatalogRef(),
          order_index: 0,
          target_sets: 4,
          target_reps_min: 6,
          target_reps_max: 10,
          rest_seconds: 120,
          notes: null,
        },
      ],
    });

    const workout = mapWorkoutPublicToWorkout(
      dto,
      { weekLabel: "Week 1", dayLabel: "Day 1" },
      "Leg Day",
      "Leg Day",
    );
    expect(workout.exercises.map((exercise) => exercise.id)).toEqual(["first", "second"]);
  });
});

describe("mapPreviewToScheduleLabels", () => {
  it("builds labels from week/day numbers when a day_label is absent", () => {
    const preview: Pick<WorkoutPreviewDto, "week_number" | "day_number" | "day_label"> = {
      week_number: 2,
      day_number: 3,
      day_label: null,
    };
    expect(mapPreviewToScheduleLabels(preview as WorkoutPreviewDto)).toEqual({
      weekLabel: "Week 2",
      dayLabel: "Day 3",
    });
  });

  it("prefers an explicit day_label when present", () => {
    const preview: Pick<WorkoutPreviewDto, "week_number" | "day_number" | "day_label"> = {
      week_number: 2,
      day_number: 3,
      day_label: "Squat Day",
    };
    expect(mapPreviewToScheduleLabels(preview as WorkoutPreviewDto).dayLabel).toBe("Squat Day");
  });
});

function buildLogExercise(overrides: Partial<WorkoutLogExerciseReadDto> = {}): WorkoutLogExerciseReadDto {
  return {
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
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

function buildWorkoutLogDetail(overrides: Partial<WorkoutLogDetailDto> = {}): WorkoutLogDetailDto {
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
    exercises: [buildLogExercise()],
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
    ...overrides,
  };
}

describe("mapWorkoutLogDetailToWorkoutSession", () => {
  it("pads un-logged sets as placeholders and maps logged sets as completed", () => {
    const dto = buildWorkoutLogDetail({
      exercises: [
        buildLogExercise({
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
              created_at: "2026-07-01T10:05:00Z",
              updated_at: "2026-07-01T10:05:00Z",
            },
          ],
        }),
      ],
    });

    const session = mapWorkoutLogDetailToWorkoutSession(dto, "Leg Day", "Leg Day");

    expect(session.id).toBe("log-1");
    expect(session.status).toBe("in_progress");
    expect(session.exercises[0].workingSets).toHaveLength(3);
    expect(session.exercises[0].workingSets[0]).toMatchObject({
      completed: true,
      completedReps: 8,
      completedWeight: 100,
      rpe: 7.5,
    });
    expect(session.exercises[0].workingSets[1].completed).toBe(false);
  });

  it("maps skipped exercises through", () => {
    const dto = buildWorkoutLogDetail({ exercises: [buildLogExercise({ skipped: true })] });
    const session = mapWorkoutLogDetailToWorkoutSession(dto, "Leg Day", "Leg Day");
    expect(session.exercises[0].skipped).toBe(true);
  });
});

describe("mapWorkoutLogDetailToWorkoutSummary", () => {
  it("counts logged vs prescribed sets and skipped exercises", () => {
    const dto = buildWorkoutLogDetail({
      status: "completed",
      completed_at: "2026-07-01T11:00:00Z",
      duration_actual_minutes: 55,
      exercises: [
        buildLogExercise({
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
        }),
        buildLogExercise({ id: "log-exercise-2", skipped: true, target_sets: 3 }),
      ],
    });

    const summary = mapWorkoutLogDetailToWorkoutSummary(dto, "Leg Day");

    expect(summary.durationMinutes).toBe(55);
    expect(summary.totalVolumeKg).toBe(800);
    expect(summary.completedSets).toBe(1);
    expect(summary.totalSets).toBe(6);
    expect(summary.completedExercises).toBe(1);
    expect(summary.totalExercises).toBe(1);
    expect(summary.skippedExercises).toBe(1);
    expect(summary.completedAt).toBe("2026-07-01T11:00:00Z");
  });
});

describe("mapWorkoutSetLogToSavedSetResult", () => {
  it("converts decimal-as-string fields into numbers", () => {
    const result = mapWorkoutSetLogToSavedSetResult({
      id: "set-1",
      set_number: 1,
      weight_kg: "100.00",
      reps: 8,
      rpe: "7.5",
      duration_seconds: null,
      is_warmup: false,
      notes: null,
      created_at: "2026-07-01T10:05:00Z",
      updated_at: "2026-07-01T10:05:00Z",
    });

    expect(result).toEqual({
      id: "set-1",
      completedReps: 8,
      completedWeight: 100,
      rpe: 7.5,
    });
  });

  it("passes through nulls untouched", () => {
    const result = mapWorkoutSetLogToSavedSetResult({
      id: "set-1",
      set_number: 1,
      weight_kg: null,
      reps: null,
      rpe: null,
      duration_seconds: 30,
      is_warmup: false,
      notes: null,
      created_at: "2026-07-01T10:05:00Z",
      updated_at: "2026-07-01T10:05:00Z",
    });

    expect(result).toEqual({ id: "set-1", completedReps: null, completedWeight: null, rpe: null });
  });
});

describe("mapWorkoutLogDetailToExerciseHistory", () => {
  it("builds one history entry per exercise with logged working sets", () => {
    const dto = buildWorkoutLogDetail({
      status: "completed",
      completed_at: "2026-07-01T11:00:00Z",
      exercises: [
        buildLogExercise({
          sets: [
            {
              id: "set-1",
              set_number: 1,
              weight_kg: "80.00",
              reps: 10,
              rpe: null,
              duration_seconds: null,
              is_warmup: false,
              notes: null,
              created_at: "2026-07-01T10:05:00Z",
              updated_at: "2026-07-01T10:05:00Z",
            },
            {
              id: "set-2",
              set_number: 2,
              weight_kg: "100.00",
              reps: 6,
              rpe: null,
              duration_seconds: null,
              is_warmup: false,
              notes: null,
              created_at: "2026-07-01T10:10:00Z",
              updated_at: "2026-07-01T10:10:00Z",
            },
          ],
        }),
      ],
    });

    const history = mapWorkoutLogDetailToExerciseHistory(dto);

    expect(history).toHaveLength(1);
    expect(history[0].exerciseName).toBe("Back Squat");
    expect(history[0].topSetWeight).toBe(100);
    expect(history[0].topSetReps).toBe(6);
    expect(history[0].totalVolume).toBe(80 * 10 + 100 * 6);
  });

  it("skips exercises with no logged working sets", () => {
    const dto = buildWorkoutLogDetail({ exercises: [buildLogExercise({ sets: [] })] });
    expect(mapWorkoutLogDetailToExerciseHistory(dto)).toHaveLength(0);
  });
});
