import type { WorkspaceRepository } from "../../../core/persistence/repositories/WorkspaceRepository";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteWorkspaceRepository } from "../../sqlite/repositories/SQLiteWorkspaceRepository";

/**
 * Persistence Contract adapter — delegates only to SQLiteWorkspaceRepository.
 */
export class WorkspaceRepositoryAdapter implements WorkspaceRepository {
  readonly repositoryId = "workspace" as const;

  constructor(private readonly repository: SQLiteWorkspaceRepository) {}

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
