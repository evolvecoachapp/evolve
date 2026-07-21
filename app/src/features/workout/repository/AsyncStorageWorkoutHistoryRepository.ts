import type { StorageAdapter } from "../../../core/storage";
import type { CompletedWorkout } from "../models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "./WorkoutHistoryRepository";

/** AsyncStorage key for the serialized completed-session list. */
export const WORKOUT_HISTORY_STORAGE_KEY = "evolve.workout.history";

/**
 * `WorkoutHistoryRepository` that stores a JSON array via a `StorageAdapter`.
 * Newest sessions sort first; duplicate `id` values are upserted in place.
 */
export class AsyncStorageWorkoutHistoryRepository implements WorkoutHistoryRepository {
  constructor(private readonly storage: StorageAdapter) {}

  async saveCompletedSession(session: CompletedWorkout): Promise<void> {
    const frozen = freezeSession(session);
    const existing = await this.readAll();
    const without = existing.filter((entry) => entry.id !== frozen.id);
    const next = sortByCompletedAtDesc([frozen, ...without]);
    await this.writeAll(next);
  }

  async getCompletedSessions(): Promise<readonly CompletedWorkout[]> {
    return this.readAll();
  }

  async getCompletedSession(id: string): Promise<CompletedWorkout | null> {
    const sessions = await this.readAll();
    return sessions.find((entry) => entry.id === id) ?? null;
  }

  async getRecentSessions(limit: number): Promise<readonly CompletedWorkout[]> {
    if (!Number.isFinite(limit) || limit <= 0) {
      return Object.freeze([]);
    }
    const sessions = await this.readAll();
    return Object.freeze(sessions.slice(0, Math.floor(limit)));
  }

  async clearHistory(): Promise<void> {
    await this.storage.removeItem(WORKOUT_HISTORY_STORAGE_KEY);
  }

  private async readAll(): Promise<CompletedWorkout[]> {
    const raw = await this.storage.getItem(WORKOUT_HISTORY_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const sessions = parsed
        .map(parseCompletedWorkout)
        .filter((entry): entry is CompletedWorkout => entry !== null);
      return sortByCompletedAtDesc(sessions);
    } catch {
      return [];
    }
  }

  private async writeAll(sessions: readonly CompletedWorkout[]): Promise<void> {
    await this.storage.setItem(
      WORKOUT_HISTORY_STORAGE_KEY,
      JSON.stringify(sessions),
    );
  }
}

function freezeSession(session: CompletedWorkout): CompletedWorkout {
  return Object.freeze({ ...session });
}

function sortByCompletedAtDesc(
  sessions: readonly CompletedWorkout[],
): CompletedWorkout[] {
  return [...sessions].sort((a, b) => {
    const aMs = Date.parse(a.completedAt);
    const bMs = Date.parse(b.completedAt);
    const safeA = Number.isFinite(aMs) ? aMs : 0;
    const safeB = Number.isFinite(bMs) ? bMs : 0;
    return safeB - safeA;
  });
}

function parseCompletedWorkout(value: unknown): CompletedWorkout | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = asString(record.id);
  const sessionId = asString(record.sessionId);
  const title = asString(record.title);
  const completedAt = asString(record.completedAt);

  if (!id || !sessionId || !title || !completedAt) {
    return null;
  }

  const durationSeconds = asFiniteNumber(record.durationSeconds);
  const completedExercises = asFiniteNumber(record.completedExercises);
  const totalExercises = asFiniteNumber(record.totalExercises);
  const completedSets = asFiniteNumber(record.completedSets);
  const skippedSets = asFiniteNumber(record.skippedSets);
  const totalSets = asFiniteNumber(record.totalSets);
  const completionPercent = asFiniteNumber(record.completionPercent);
  const estimatedVolumeKg = asFiniteNumber(record.estimatedVolumeKg);

  if (
    durationSeconds === null ||
    completedExercises === null ||
    totalExercises === null ||
    completedSets === null ||
    skippedSets === null ||
    totalSets === null ||
    completionPercent === null ||
    estimatedVolumeKg === null
  ) {
    return null;
  }

  const averageCompletedReps =
    record.averageCompletedReps === null
      ? null
      : asFiniteNumber(record.averageCompletedReps);

  if (record.averageCompletedReps !== null && averageCompletedReps === null) {
    return null;
  }

  return Object.freeze({
    id,
    sessionId,
    title,
    durationSeconds,
    completedExercises,
    totalExercises,
    completedSets,
    skippedSets,
    totalSets,
    completionPercent,
    estimatedVolumeKg,
    averageCompletedReps,
    completedAt,
  });
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
