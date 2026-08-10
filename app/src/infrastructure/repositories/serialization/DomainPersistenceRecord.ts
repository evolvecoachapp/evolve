import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";

/**
 * Opaque domain carrier passed through PersistenceRecord contracts.
 * Serialization/deserialization happens only in repository mappers.
 */
export type DomainPersistenceRecord<T> = PersistenceRecord & {
  readonly payload?: T;
};

export function getRecordPayload<T>(
  record: PersistenceRecord,
): T | null {
  const candidate = record as DomainPersistenceRecord<T>;
  return candidate.payload ?? null;
}

export function createDomainRecord<T>(
  id: string,
  payload: T,
): DomainPersistenceRecord<T> {
  return Object.freeze({ id, payload });
}

export function attachRecordPayload<T>(
  record: PersistenceRecord,
  payload: T,
): DomainPersistenceRecord<T> {
  return Object.freeze({ id: record.id, payload });
}
