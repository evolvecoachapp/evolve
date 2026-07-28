import type { SnapshotRepository } from "../../../core/persistence/repositories/SnapshotRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteSnapshotRepository } from "../../sqlite/repositories/SQLiteSnapshotRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteSnapshotRepository.
 */
export class SnapshotRepositoryAdapter implements SnapshotRepository {
  readonly repositoryId = "snapshot" as const;

  constructor(private readonly repository: SQLiteSnapshotRepository) {}

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
