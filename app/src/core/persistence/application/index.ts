import type { PersistenceContractsView } from "../contracts/PersistenceContractsView";
import type { PersistenceValidation } from "../contracts/PersistenceValidation";
import {
  createPersistenceContractRegistry,
  type PersistenceContractRegistry,
  type PersistenceContractRegistryDeps,
} from "./PersistenceContractRegistry";
import type { RepositoryRegistry } from "./RepositoryRegistry";

function resolveRegistry(
  registry: PersistenceContractRegistry | undefined,
  deps: PersistenceContractRegistryDeps | undefined,
): PersistenceContractRegistry {
  if (registry) return registry;
  return createPersistenceContractRegistry(deps ?? {});
}

/** Application API — frozen view of all persistence contracts. */
export function getPersistenceContracts(options: {
  readonly registry?: PersistenceContractRegistry;
  readonly deps?: PersistenceContractRegistryDeps;
} = {}): PersistenceContractsView {
  return resolveRegistry(options.registry, options.deps).getContracts();
}

/** Application API — repository contract registry. */
export function getRepositoryRegistry(options: {
  readonly registry?: PersistenceContractRegistry;
  readonly deps?: PersistenceContractRegistryDeps;
} = {}): RepositoryRegistry {
  return resolveRegistry(options.registry, options.deps).getRepositoryRegistry();
}

/** Application API — validate persistence contract integrity. */
export function validatePersistenceContracts(options: {
  readonly registry?: PersistenceContractRegistry;
  readonly deps?: PersistenceContractRegistryDeps;
} = {}): PersistenceValidation {
  return resolveRegistry(options.registry, options.deps).validate();
}

export type { PersistenceContractRegistryDeps };
