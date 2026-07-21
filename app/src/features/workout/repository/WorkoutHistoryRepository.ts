import type { CompletedWorkout } from "../models/CompletedWorkout";

/**
 * Storage-agnostic access to completed workout history.
 *
 * Persists finished interactive sessions on-device. Implementations may use
 * AsyncStorage (via `StorageAdapter`), an in-memory map, or a future sync store.
 */
export interface WorkoutHistoryRepository {
  /** Upserts a completed session by `id` (session id). */
  saveCompletedSession(session: CompletedWorkout): Promise<void>;

  /** All completed sessions, newest `completedAt` first. */
  getCompletedSessions(): Promise<readonly CompletedWorkout[]>;

  /** Single session by id, or `null` when missing. */
  getCompletedSession(id: string): Promise<CompletedWorkout | null>;

  /** Newest `limit` sessions by `completedAt` (descending). */
  getRecentSessions(limit: number): Promise<readonly CompletedWorkout[]>;

  /**
   * Removes every stored session.
   * Intended for tests only — not exposed in product UI.
   */
  clearHistory(): Promise<void>;
}
