import {
  buildMockWorkoutCatalog,
  MOCK_TODAY_WORKOUT_ID,
} from "../mocks/workoutCatalog";
import type { ExerciseHistory } from "../models/ExerciseHistory";
import type { Workout } from "../models/Workout";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type {
  SaveSetRequest,
  SkipExerciseRequest,
  WorkoutService,
} from "../types/workoutService";
import { cloneWorkout, cloneWorkoutExercises } from "../utils/workoutAdapters";

const mockWorkoutCatalog = buildMockWorkoutCatalog();

const sessions = new Map<string, WorkoutSession>();
const history: ExerciseHistory[] = [];

let sessionIdCounter = 0;

function createSessionId(): string {
  sessionIdCounter += 1;
  return `session-${sessionIdCounter}`;
}

function findWorkout(workoutId: string): Workout | undefined {
  return mockWorkoutCatalog.find((workout) => workout.id === workoutId);
}

function countWorkingSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, exercise) => total + exercise.workingSets.length, 0);
}

function countCompletedWorkingSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (total, exercise) =>
      total + exercise.workingSets.filter((set) => set.completed).length,
    0,
  );
}

function getSessionOrThrow(sessionId: string): WorkoutSession {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  return session;
}

/** Default provider — returns seeded local workout data and in-memory session state. */
export const mockWorkoutService: WorkoutService = {
  providerId: "mock",

  async getTodayWorkout(): Promise<Workout> {
    const workout = findWorkout(MOCK_TODAY_WORKOUT_ID) ?? mockWorkoutCatalog[0];
    return cloneWorkout(workout);
  },

  async getWorkout(id: string): Promise<Workout | null> {
    const workout = findWorkout(id);
    return workout ? cloneWorkout(workout) : null;
  },

  async startWorkout(workoutId: string): Promise<WorkoutSession> {
    const workout = findWorkout(workoutId);
    if (!workout) {
      throw new Error(`Workout not found: ${workoutId}`);
    }

    const session: WorkoutSession = {
      id: createSessionId(),
      workoutId: workout.id,
      title: workout.title,
      subtitle: workout.subtitle,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      completedAt: null,
      exercises: cloneWorkoutExercises(workout.exercises),
    };

    sessions.set(session.id, session);
    return {
      ...session,
      exercises: cloneWorkoutExercises(session.exercises),
    };
  },

  async finishWorkout(sessionId: string): Promise<WorkoutSummary> {
    const session = getSessionOrThrow(sessionId);
    const completedAt = new Date().toISOString();
    const totalSets = countWorkingSets(session.exercises);
    const completedSets = countCompletedWorkingSets(session.exercises);
    const skippedExercises = session.exercises.filter((exercise) => exercise.skipped).length;
    const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60_000));

    session.status = "completed";
    session.completedAt = completedAt;
    sessions.set(sessionId, session);

    for (const exercise of session.exercises) {
      const completedWorkingSets = exercise.workingSets.filter((set) => set.completed);
      if (completedWorkingSets.length === 0) {
        continue;
      }

      const topSet = completedWorkingSets.reduce((best, set) => {
        const bestWeight = best.completedWeight ?? best.targetWeight ?? 0;
        const setWeight = set.completedWeight ?? set.targetWeight ?? 0;
        return setWeight > bestWeight ? set : best;
      });

      history.unshift({
        id: `${sessionId}-${exercise.id}`,
        exerciseId: exercise.exercise.id,
        exerciseName: exercise.exercise.name,
        muscleGroup: exercise.exercise.muscleGroup,
        sessionId,
        completedAt,
        topSetWeight: topSet.completedWeight ?? topSet.targetWeight,
        topSetReps: topSet.completedReps ?? topSet.targetReps,
        totalVolume: completedWorkingSets.reduce((volume, set) => {
          const weight = set.completedWeight ?? set.targetWeight ?? 0;
          const reps = set.completedReps ?? set.targetReps ?? 0;
          return volume + weight * reps;
        }, 0),
      });
    }

    return {
      sessionId,
      workoutId: session.workoutId,
      title: session.title,
      durationMinutes,
      completedSets,
      totalSets,
      skippedExercises,
      completedAt,
    };
  },

  async saveSet(request: SaveSetRequest): Promise<void> {
    const session = getSessionOrThrow(request.sessionId);
    const exercise = session.exercises.find((entry) => entry.id === request.exerciseId);

    if (!exercise) {
      throw new Error(`Exercise not found: ${request.exerciseId}`);
    }

    const set =
      exercise.workingSets.find((entry) => entry.id === request.setId) ??
      exercise.warmupSets.find((entry) => entry.id === request.setId);

    if (!set) {
      throw new Error(`Set not found: ${request.setId}`);
    }

    set.completedReps = request.completedReps;
    set.completedWeight = request.completedWeight;
    set.rpe = request.rpe;
    set.completed = request.completed;
    sessions.set(request.sessionId, session);
  },

  async skipExercise(request: SkipExerciseRequest): Promise<void> {
    const session = getSessionOrThrow(request.sessionId);
    const exercise = session.exercises.find((entry) => entry.id === request.exerciseId);

    if (!exercise) {
      throw new Error(`Exercise not found: ${request.exerciseId}`);
    }

    exercise.skipped = true;
    sessions.set(request.sessionId, session);
  },

  async getHistory(): Promise<ExerciseHistory[]> {
    return history.map((entry) => ({ ...entry }));
  },
};
