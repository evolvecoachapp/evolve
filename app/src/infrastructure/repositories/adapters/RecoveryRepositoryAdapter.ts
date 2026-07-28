import type { RecoveryRepository } from "../../../core/persistence/repositories/RecoveryRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteRecoveryRepository } from "../../sqlite/repositories/SQLiteRecoveryRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteRecoveryRepository.
 */
export class RecoveryRepositoryAdapter implements RecoveryRepository {
  readonly repositoryId = "recovery" as const;

  constructor(private readonly repository: SQLiteRecoveryRepository) {}

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
