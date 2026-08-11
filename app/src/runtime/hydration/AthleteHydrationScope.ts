import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";

/**
 * Authenticated Athlete Persistence Boundary (Sprint 36.1).
 *
 * Athlete-scoped persistence records are stored with `record.id` equal to the
 * owning athlete's id (identity / workspace / snapshot / timeline / workout /
 * nutrition / recovery). This module is the single, explicit chokepoint that
 * enforces that Repository Hydration only ever restores records belonging to
 * the athlete id(s) of the *current* authenticated session into runtime
 * memory — closing the gap where a subsequent login could rehydrate a
 * previous athlete's persisted SQLite rows.
 *
 * Pure and structural only — no SQLite, no I/O, no business logic.
 */

/**
 * Filters athlete-scoped persistence records down to only the ids present in
 * `athleteIds`.
 *
 * `athleteIds === undefined` preserves the previous unrestricted behavior for
 * callers that intentionally bypass session scoping (e.g. low-level pipeline
 * unit tests). Every production entry point (`hydrateRuntime` via
 * `RuntimeSessionOrchestrator`) always supplies the current authenticated
 * session's athlete id(s), so this boundary is always enforced in the real
 * application lifecycle. Passing an empty array is fail-safe: it restores
 * nothing.
 */
export function filterRecordsForAthleteScope(
  records: readonly PersistenceRecord[],
  athleteIds: readonly string[] | undefined,
): readonly PersistenceRecord[] {
  if (athleteIds === undefined) {
    return records;
  }

  const allowed = new Set(athleteIds);
  return Object.freeze(records.filter((record) => allowed.has(record.id)));
}
