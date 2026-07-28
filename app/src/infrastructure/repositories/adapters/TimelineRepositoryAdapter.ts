import type { TimelineRepository } from "../../../core/persistence/repositories/TimelineRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteTimelineRepository } from "../../sqlite/repositories/SQLiteTimelineRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteTimelineRepository.
 */
export class TimelineRepositoryAdapter implements TimelineRepository {
  readonly repositoryId = "timeline" as const;

  constructor(private readonly repository: SQLiteTimelineRepository) {}

  findById(id: string): PersistenceRecord | null {
    return this.repository.findById(id);
  }

  save(record: PersistenceRecord): void {
    this.repository.save(record);
  }

  delete(id: string): void {
    this.repository.delete(id);
  }

  list(): readonly PersistenceRecord[] {
    return this.repository.list();
  }

  exists(id: string): boolean {
    return this.repository.exists(id);
  }
}
