import type { PersistenceRecord } from "../contracts/PersistenceRecord";

/**
 * Persistence contract for timeline records.
 * No implementation in this sprint.
 */
export interface TimelineRepository {
  readonly repositoryId: "timeline";
  findById(
    id: string,
  ): Promise<PersistenceRecord | null> | PersistenceRecord | null;
  save(record: PersistenceRecord): Promise<void> | void;
  delete(id: string): Promise<void> | void;
  list(): Promise<readonly PersistenceRecord[]> | readonly PersistenceRecord[];
  exists(id: string): Promise<boolean> | boolean;
}
