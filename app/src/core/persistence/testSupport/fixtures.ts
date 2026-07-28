import {
  createPersistenceContractRegistry,
  type PersistenceContractRegistry,
} from "../application/PersistenceContractRegistry";
import { createDefaultRepositoryDescriptors } from "../application/defaultDescriptors";
import { createDefaultStorageDescriptors } from "../application/defaultDescriptors";

export const FIXED_PERSISTENCE_TIMESTAMP = "2026-07-28T12:00:00.000Z";

export function createTestPersistenceRegistry(
  overrides: {
    readonly seedDefaults?: boolean;
  } = {},
): PersistenceContractRegistry {
  return createPersistenceContractRegistry({
    seedDefaults: overrides.seedDefaults !== false,
    clock: () => FIXED_PERSISTENCE_TIMESTAMP,
  });
}

export function createEmptyPersistenceRegistry(): PersistenceContractRegistry {
  return createPersistenceContractRegistry({
    seedDefaults: false,
    clock: () => FIXED_PERSISTENCE_TIMESTAMP,
  });
}

export {
  createDefaultRepositoryDescriptors,
  createDefaultStorageDescriptors,
};
