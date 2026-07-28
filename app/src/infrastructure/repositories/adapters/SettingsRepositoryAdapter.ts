import type { SettingsRepository } from "../../../core/persistence/repositories/SettingsRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteSettingsRepository } from "../../sqlite/repositories/SQLiteSettingsRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteSettingsRepository.
 */
export class SettingsRepositoryAdapter implements SettingsRepository {
  readonly repositoryId = "settings" as const;

  constructor(private readonly repository: SQLiteSettingsRepository) {}

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
