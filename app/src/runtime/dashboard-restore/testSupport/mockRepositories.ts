import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { IdentityRepository } from "../../../core/persistence/repositories/IdentityRepository";
import type { RuntimeRepository } from "../../../core/persistence/repositories/RuntimeRepository";
import type { WorkspaceRepository } from "../../../core/persistence/repositories/WorkspaceRepository";

export function createRecord(id: string): PersistenceRecord {
  return Object.freeze({ id });
}

export function createMockIdentityRepository(
  records: readonly PersistenceRecord[] = [],
): IdentityRepository {
  return {
    repositoryId: "identity",
    findById: () => null,
    save: () => undefined,
    delete: () => undefined,
    list: () => records,
    exists: () => false,
  };
}

export function createMockRuntimeRepository(
  records: readonly PersistenceRecord[] = [],
): RuntimeRepository {
  return {
    repositoryId: "runtime",
    findById: () => null,
    save: () => undefined,
    delete: () => undefined,
    list: () => records,
    exists: () => false,
  };
}

export function createMockWorkspaceRepository(
  records: readonly PersistenceRecord[] = [],
): WorkspaceRepository {
  return {
    repositoryId: "workspace",
    findById: () => null,
    save: () => undefined,
    delete: () => undefined,
    list: () => records,
    exists: () => false,
  };
}
