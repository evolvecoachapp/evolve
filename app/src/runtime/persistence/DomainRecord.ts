import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";

/**
 * Read opaque domain payloads attached to persistence records.
 * JSON serialization remains inside repository mappers only.
 */
export function readRecordPayload<T>(record: PersistenceRecord): T | null {
  const candidate = record as PersistenceRecord & { readonly payload?: T };
  return candidate.payload ?? null;
}

export function createPayloadRecord<T>(
  id: string,
  payload: T,
): PersistenceRecord {
  return Object.freeze({ id, payload });
}
