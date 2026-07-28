import type { RuntimeRepository } from "../../../core/persistence/repositories/RuntimeRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteRuntimeRepository } from "../../sqlite/repositories/SQLiteRuntimeRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteRuntimeRepository.
 */
export class RuntimeRepositoryAdapter implements RuntimeRepository {
  readonly repositoryId = "runtime" as const;

  constructor(private readonly repository: SQLiteRuntimeRepository) {}

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
