import type { PersistenceRecord } from "../contracts/PersistenceRecord";

/**
 * Persistence contract for recovery records.
 * No implementation in this sprint.
 */
export interface RecoveryRepository {
  readonly repositoryId: "recovery";
  findById(
    id: string,
  ): Promise<PersistenceRecord | null> | PersistenceRecord | null;
  save(record: PersistenceRecord): Promise<void> | void;
  delete(id: string): Promise<void> | void;
  list(): Promise<readonly PersistenceRecord[]> | readonly PersistenceRecord[];
  exists(id: string): Promise<boolean> | boolean;
}
