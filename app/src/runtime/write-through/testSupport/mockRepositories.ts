import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { IdentityRepository } from "../../../core/persistence/repositories/IdentityRepository";
import type { RuntimeRepository } from "../../../core/persistence/repositories/RuntimeRepository";
import type { SnapshotRepository } from "../../../core/persistence/repositories/SnapshotRepository";
import type { TimelineRepository } from "../../../core/persistence/repositories/TimelineRepository";
import type { WorkspaceRepository } from "../../../core/persistence/repositories/WorkspaceRepository";
import { createPayloadRecord } from "../../persistence/DomainRecord";

export function createRecord(id: string): PersistenceRecord {
  return Object.freeze({ id });
}

function createMockRepository<T extends string>(
  repositoryId: T,
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
) {
  const saved: PersistenceRecord[] = [...records];

  return {
    repositoryId,
    findById: (id: string) => saved.find((record) => record.id === id) ?? null,
    save: (record: PersistenceRecord) => {
      if (options?.rejectSave) {
        throw new Error(`${repositoryId} repository rejected save`);
      }
      options?.onSave?.(record);
      const existingIndex = saved.findIndex((entry) => entry.id === record.id);
      if (existingIndex >= 0) {
        saved[existingIndex] = record;
      } else {
        saved.push(record);
      }
    },
    delete: (id: string) => {
      const index = saved.findIndex((record) => record.id === id);
      if (index >= 0) {
        saved.splice(index, 1);
      }
    },
    list: () => Object.freeze([...saved]),
    exists: (id: string) => saved.some((record) => record.id === id),
  };
}

export function createMockIdentityRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): IdentityRepository {
  return createMockRepository("identity", records, options);
}

export function createMockRuntimeRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): RuntimeRepository {
  return createMockRepository("runtime", records, options);
}

export function createMockWorkspaceRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): WorkspaceRepository {
  return createMockRepository("workspace", records, options);
}

export function createMockSnapshotRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): SnapshotRepository {
  return createMockRepository("snapshot", records, options);
}

export function createMockTimelineRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): TimelineRepository {
  return createMockRepository("timeline", records, options);
}

export { createPayloadRecord };
