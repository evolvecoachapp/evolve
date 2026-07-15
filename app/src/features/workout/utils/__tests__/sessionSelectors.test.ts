import type { WorkoutSession } from "../../models/WorkoutSession";
import type { WorkoutExercise } from "../../models/WorkoutExercise";
import type { ExerciseSet } from "../../models/ExerciseSet";
import {
  computeSessionVolumeKg,
  countCompletedExercises,
  countSessionCompletedWorkingSets,
  countSessionWorkingSets,
  findNextIncompleteSet,
  isSessionComplete,
  mergeSavedSetIntoSession,
} from "../sessionSelectors";

function buildSet(overrides: Partial<ExerciseSet> = {}): ExerciseSet {
  return {
    id: "set-1",
    setNumber: 1,
    targetReps: 8,
    targetWeight: null,
    completedReps: null,
    completedWeight: null,
    rpe: null,
    completed: false,
    restSeconds: 90,
    ...overrides,
  };
}

function buildExercise(overrides: Partial<WorkoutExercise> = {}): WorkoutExercise {
  return {
    id: "exercise-1",
    exercise: {
      id: "catalog-1",
      name: "Back Squat",
      muscleGroup: "quads",
      equipment: "barbell",
      instructions: null,
      videoUrl: null,
      imageUrl: null,
    },
    order: 0,
    warmupSets: [],
    workingSets: [buildSet(), buildSet({ id: "set-2", setNumber: 2 })],
    notes: null,
    ...overrides,
  };
}

function buildSession(exercises: WorkoutExercise[]): WorkoutSession {
  return {
    id: "session-1",
    workoutId: "workout-1",
    title: "Leg Day",
    subtitle: "Squat focus",
    status: "in_progress",
    startedAt: "2026-07-01T10:00:00Z",
    completedAt: null,
    exercises,
  };
}

describe("sessionSelectors", () => {
  it("finds the first incomplete working set across exercises", () => {
    const session = buildSession([
      buildExercise({
        workingSets: [buildSet({ completed: true, completedReps: 8, completedWeight: 100 })],
      }),
      buildExercise({ id: "exercise-2", workingSets: [buildSet({ id: "set-3" })] }),
    ]);

    const position = findNextIncompleteSet(session);

    expect(position?.exercise.id).toBe("exercise-2");
    expect(position?.set.id).toBe("set-3");
  });

  it("skips flagged exercises when locating the next set", () => {
    const session = buildSession([
      buildExercise({ skipped: true }),
      buildExercise({ id: "exercise-2", workingSets: [buildSet({ id: "set-3" })] }),
    ]);

    expect(findNextIncompleteSet(session)?.exercise.id).toBe("exercise-2");
  });

  it("detects when every working set is complete", () => {
    const session = buildSession([
      buildExercise({
        workingSets: [
          buildSet({ completed: true, completedReps: 8, completedWeight: 100 }),
          buildSet({ id: "set-2", setNumber: 2, completed: true, completedReps: 8, completedWeight: 100 }),
        ],
      }),
    ]);

    expect(isSessionComplete(session)).toBe(true);
    expect(findNextIncompleteSet(session)).toBeNull();
  });

  it("computes volume and completed exercise counts", () => {
    const exercises = [
      buildExercise({
        workingSets: [buildSet({ completed: true, completedReps: 10, completedWeight: 80 })],
      }),
      buildExercise({
        id: "exercise-2",
        workingSets: [buildSet({ id: "set-3", completed: true, completedReps: 5, completedWeight: 100 })],
      }),
    ];

    expect(computeSessionVolumeKg(exercises)).toBe(80 * 10 + 100 * 5);
    expect(countCompletedExercises(exercises)).toBe(2);
  });

  it("counts session-wide working sets while excluding skipped exercises", () => {
    const exercises = [
      buildExercise({
        workingSets: [buildSet({ completed: true, completedReps: 8, completedWeight: 100 }), buildSet({ id: "set-2" })],
      }),
      buildExercise({ id: "exercise-2", skipped: true, workingSets: [buildSet({ id: "set-3" })] }),
    ];

    expect(countSessionWorkingSets(exercises)).toBe(2);
    expect(countSessionCompletedWorkingSets(exercises)).toBe(1);
  });

  it("merges a saved set into the matching placeholder, swapping in the server id", () => {
    const session = buildSession([
      buildExercise({ workingSets: [buildSet({ id: "exercise-1-set-1" }), buildSet({ id: "set-2", setNumber: 2 })] }),
    ]);

    const merged = mergeSavedSetIntoSession(session, "exercise-1", "exercise-1-set-1", {
      id: "server-set-1",
      completedReps: 8,
      completedWeight: 100,
      rpe: 7.5,
    });

    expect(merged).not.toBe(session);
    expect(merged.exercises[0].workingSets[0]).toMatchObject({
      id: "server-set-1",
      completed: true,
      completedReps: 8,
      completedWeight: 100,
      rpe: 7.5,
    });
    // Untouched sets/exercises are structurally unchanged.
    expect(merged.exercises[0].workingSets[1]).toEqual(session.exercises[0].workingSets[1]);
    // Original session is left untouched (immutable update).
    expect(session.exercises[0].workingSets[0].completed).toBe(false);
  });

  it("leaves the session unchanged when the exercise or set id does not match", () => {
    const session = buildSession([buildExercise()]);

    const merged = mergeSavedSetIntoSession(session, "missing-exercise", "set-1", {
      id: "server-set-1",
      completedReps: 8,
      completedWeight: 100,
      rpe: null,
    });

    expect(merged.exercises[0].workingSets[0].completed).toBe(false);
  });
});
