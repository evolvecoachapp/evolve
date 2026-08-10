import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { IdentityRepository } from "../../../core/persistence/repositories/IdentityRepository";
import type { RuntimeRepository } from "../../../core/persistence/repositories/RuntimeRepository";
import type { WorkspaceRepository } from "../../../core/persistence/repositories/WorkspaceRepository";

export function createRecord(id: string): PersistenceRecord {
  return Object.freeze({ id });
}

export function createMockIdentityRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): IdentityRepository {
  const saved: PersistenceRecord[] = [...records];

  return {
    repositoryId: "identity",
    findById: (id) => saved.find((record) => record.id === id) ?? null,
    save: (record) => {
      if (options?.rejectSave) {
        throw new Error("Identity repository rejected save");
      }
      options?.onSave?.(record);
      saved.push(record);
    },
    delete: () => undefined,
    list: () => Object.freeze([...saved]),
    exists: (id) => saved.some((record) => record.id === id),
  };
}

export function createMockRuntimeRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): RuntimeRepository {
  const saved: PersistenceRecord[] = [...records];

  return {
    repositoryId: "runtime",
    findById: (id) => saved.find((record) => record.id === id) ?? null,
    save: (record) => {
      if (options?.rejectSave) {
        throw new Error("Runtime repository rejected save");
      }
      options?.onSave?.(record);
      saved.push(record);
    },
    delete: () => undefined,
    list: () => Object.freeze([...saved]),
    exists: (id) => saved.some((record) => record.id === id),
  };
}

export function createMockWorkspaceRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): WorkspaceRepository {
  const saved: PersistenceRecord[] = [...records];

  return {
    repositoryId: "workspace",
    findById: (id) => saved.find((record) => record.id === id) ?? null,
    save: (record) => {
      if (options?.rejectSave) {
        throw new Error("Workspace repository rejected save");
      }
      options?.onSave?.(record);
      saved.push(record);
    },
    delete: () => undefined,
    list: () => Object.freeze([...saved]),
    exists: (id) => saved.some((record) => record.id === id),
  };
}
