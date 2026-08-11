import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";

/**
 * Persistence Consistency Guard — Athlete Record Ownership (Sprint 36.5).
 *
 * `filterRecordsForAthleteScope` (Sprint 36.1) restricts hydration to
 * records whose *key* (`record.id`) belongs to the current authenticated
 * athlete. It does not — and structurally cannot — verify that the domain
 * payload *inside* the record actually belongs to that same athlete. Every
 * write-through/hydration path in this codebase keys athlete-scoped records
 * by a payload-internal field (`identity.athleteId`, `workspace.athleteId`,
 * `state.athleteId`, ...); if that internal field ever drifted from the
 * record key — a future bug, a hand-edited row, a migration artifact — the
 * existing scope filter would be silently defeated: a record that legally
 * passes the scope check could restore a *different* athlete's payload
 * under the current session's identity, or a write-through call could
 * persist a payload under the wrong authenticated athlete's key.
 *
 * This module is the single, explicit chokepoint both directions (observe
 * for write-through, restore for hydration) use to verify the payload's own
 * `athleteId` field matches the id it is being persisted/restored against
 * before ever touching a repository or a composition service. Pure
 * structural comparison only — no I/O, no new repositories, no event log.
 */

export interface AthleteOwnedPayload {
  readonly athleteId: string;
}

/**
 * True when `payload.athleteId` matches the athlete id this payload is
 * being persisted or restored for. Used symmetrically by:
 *  - write-through observation: `expectedAthleteId` is the authenticated
 *    athlete id currently being persisted (the loop variable over
 *    `athleteIds`, never a value read back from the payload itself).
 *  - hydration restoration: `expectedAthleteId` is `record.id` — the key
 *    that already passed the Authenticated Athlete Persistence Boundary
 *    (Sprint 36.1) scope filter.
 */
export function isOwnedByAthlete(
  payload: AthleteOwnedPayload,
  expectedAthleteId: string,
): boolean {
  return payload.athleteId === expectedAthleteId;
}

/**
 * Convenience wrapper for the hydration direction, where the expected
 * athlete id is always the record's own key.
 */
export function isRecordOwnedByAthlete(
  record: PersistenceRecord,
  payload: AthleteOwnedPayload,
): boolean {
  return isOwnedByAthlete(payload, record.id);
}
