import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { NutritionRepository } from "../../../core/persistence/repositories/NutritionRepository";
import type { RecoveryRepository } from "../../../core/persistence/repositories/RecoveryRepository";
import type { WorkoutRepository } from "../../../core/persistence/repositories/WorkoutRepository";

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

export function createMockWorkoutRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): WorkoutRepository {
  return createMockRepository("workout", records, options);
}

export function createMockNutritionRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): NutritionRepository {
  return createMockRepository("nutrition", records, options);
}

export function createMockRecoveryRepository(
  records: readonly PersistenceRecord[] = [],
  options?: {
    readonly onSave?: (record: PersistenceRecord) => void;
    readonly rejectSave?: boolean;
  },
): RecoveryRepository {
  return createMockRepository("recovery", records, options);
}
