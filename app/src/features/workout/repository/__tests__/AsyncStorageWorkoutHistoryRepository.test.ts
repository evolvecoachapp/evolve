import { InMemoryStorageAdapter } from "../../../../core/storage";
import type { CompletedWorkout } from "../../models/CompletedWorkout";
import {
  AsyncStorageWorkoutHistoryRepository,
  WORKOUT_HISTORY_STORAGE_KEY,
} from "../AsyncStorageWorkoutHistoryRepository";

function createWorkout(
  overrides: Partial<CompletedWorkout> & Pick<CompletedWorkout, "id" | "completedAt">,
): CompletedWorkout {
  return Object.freeze({
    sessionId: overrides.sessionId ?? overrides.id,
    title: overrides.title ?? "Upper A",
    programName: overrides.programName ?? null,
    durationSeconds: overrides.durationSeconds ?? 3600,
    completedExercises: overrides.completedExercises ?? 2,
    totalExercises: overrides.totalExercises ?? 3,
    completedSets: overrides.completedSets ?? 8,
    skippedSets: overrides.skippedSets ?? 1,
    totalSets: overrides.totalSets ?? 10,
    completionPercent: overrides.completionPercent ?? 90,
    estimatedVolumeKg: overrides.estimatedVolumeKg ?? 1200,
    averageCompletedReps: overrides.averageCompletedReps ?? 9.5,
    exercises: overrides.exercises ?? Object.freeze([]),
    ...overrides,
  });
}

describe("AsyncStorageWorkoutHistoryRepository", () => {
  let storage: InMemoryStorageAdapter;
  let repository: AsyncStorageWorkoutHistoryRepository;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
    repository = new AsyncStorageWorkoutHistoryRepository(storage);
  });

  it("starts empty", async () => {
    await expect(repository.getCompletedSessions()).resolves.toEqual([]);
    await expect(repository.getCompletedSession("missing")).resolves.toBeNull();
    await expect(repository.getRecentSessions(5)).resolves.toEqual([]);
  });

  it("saves and retrieves a completed session", async () => {
    const workout = createWorkout({
      id: "session:1",
      completedAt: "2026-07-21T10:00:00.000Z",
    });

    await repository.saveCompletedSession(workout);

    await expect(repository.getCompletedSession("session:1")).resolves.toEqual(workout);
    await expect(repository.getCompletedSessions()).resolves.toEqual([workout]);
  });

  it("upserts by id and keeps newest completedAt first", async () => {
    const older = createWorkout({
      id: "session:a",
      title: "A",
      completedAt: "2026-07-20T10:00:00.000Z",
    });
    const newer = createWorkout({
      id: "session:b",
      title: "B",
      completedAt: "2026-07-21T10:00:00.000Z",
    });
    const updatedA = createWorkout({
      id: "session:a",
      title: "A updated",
      completedAt: "2026-07-22T10:00:00.000Z",
    });

    await repository.saveCompletedSession(older);
    await repository.saveCompletedSession(newer);
    await repository.saveCompletedSession(updatedA);

    const all = await repository.getCompletedSessions();
    expect(all.map((s) => s.id)).toEqual(["session:a", "session:b"]);
    expect(all[0]?.title).toBe("A updated");
  });

  it("returns recent sessions limited and ordered", async () => {
    await repository.saveCompletedSession(
      createWorkout({ id: "1", completedAt: "2026-07-19T00:00:00.000Z" }),
    );
    await repository.saveCompletedSession(
      createWorkout({ id: "2", completedAt: "2026-07-21T00:00:00.000Z" }),
    );
    await repository.saveCompletedSession(
      createWorkout({ id: "3", completedAt: "2026-07-20T00:00:00.000Z" }),
    );

    const recent = await repository.getRecentSessions(2);
    expect(recent.map((s) => s.id)).toEqual(["2", "3"]);
  });

  it("returns an empty list for non-positive recent limits", async () => {
    await repository.saveCompletedSession(
      createWorkout({ id: "1", completedAt: "2026-07-21T00:00:00.000Z" }),
    );

    await expect(repository.getRecentSessions(0)).resolves.toEqual([]);
    await expect(repository.getRecentSessions(-1)).resolves.toEqual([]);
  });

  it("clearHistory removes the storage key", async () => {
    await repository.saveCompletedSession(
      createWorkout({ id: "1", completedAt: "2026-07-21T00:00:00.000Z" }),
    );

    await repository.clearHistory();

    await expect(repository.getCompletedSessions()).resolves.toEqual([]);
    await expect(storage.getItem(WORKOUT_HISTORY_STORAGE_KEY)).resolves.toBeNull();
  });

  it("ignores corrupt JSON and non-array payloads", async () => {
    await storage.setItem(WORKOUT_HISTORY_STORAGE_KEY, "{not-json");
    await expect(repository.getCompletedSessions()).resolves.toEqual([]);

    await storage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify({ nope: true }));
    await expect(repository.getCompletedSessions()).resolves.toEqual([]);
  });

  it("skips invalid entries while keeping valid ones", async () => {
    const valid = createWorkout({
      id: "ok",
      completedAt: "2026-07-21T00:00:00.000Z",
    });
    await storage.setItem(
      WORKOUT_HISTORY_STORAGE_KEY,
      JSON.stringify([valid, { id: "bad" }, null, "x"]),
    );

    await expect(repository.getCompletedSessions()).resolves.toEqual([valid]);
  });

  it("persists null averageCompletedReps", async () => {
    const workout = createWorkout({
      id: "session:null-avg",
      completedAt: "2026-07-21T00:00:00.000Z",
      averageCompletedReps: null,
    });

    await repository.saveCompletedSession(workout);

    await expect(repository.getCompletedSession("session:null-avg")).resolves.toEqual(
      workout,
    );
  });

  it("treats missing programName as null for legacy entries", async () => {
    const legacy = {
      id: "legacy",
      sessionId: "legacy",
      title: "Upper A",
      durationSeconds: 1800,
      completedExercises: 1,
      totalExercises: 2,
      completedSets: 3,
      skippedSets: 0,
      totalSets: 3,
      completionPercent: 100,
      estimatedVolumeKg: 500,
      averageCompletedReps: 8,
      completedAt: "2026-07-20T00:00:00.000Z",
    };
    await storage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify([legacy]));

    const sessions = await repository.getCompletedSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.programName).toBeNull();
    expect(sessions[0]?.exercises).toEqual([]);
  });

  it("persists and restores exercise set details", async () => {
    const workout = createWorkout({
      id: "session:detail",
      completedAt: "2026-07-21T12:00:00.000Z",
      exercises: Object.freeze([
        Object.freeze({
          id: "ex:1",
          name: "Bench Press",
          order: 0,
          sets: Object.freeze([
            Object.freeze({
              id: "set:1",
              setNumber: 1,
              weightKg: 60,
              reps: 10,
            }),
          ]),
        }),
      ]),
    });

    await repository.saveCompletedSession(workout);

    await expect(repository.getCompletedSession("session:detail")).resolves.toEqual(
      workout,
    );
  });
});
