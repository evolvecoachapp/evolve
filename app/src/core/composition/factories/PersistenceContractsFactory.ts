import {
  createPersistenceContractRegistry,
  type PersistenceContractRegistry,
  type PersistenceContractRegistryDeps,
} from "../../persistence/application/PersistenceContractRegistry";

export interface PersistenceContractsFactoryDeps
  extends PersistenceContractRegistryDeps {
  readonly registry?: PersistenceContractRegistry;
}

export const PersistenceContractsFactory = {
  create(
    deps: PersistenceContractsFactoryDeps = {},
  ): PersistenceContractRegistry {
    return deps.registry ?? createPersistenceContractRegistry(deps);
  },
} as const;
