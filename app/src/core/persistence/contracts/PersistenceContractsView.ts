import type { RepositoryContractDescriptor } from "./RepositoryContractDescriptor";
import type { StorageContractDescriptor } from "./StorageContractDescriptor";

/**
 * Frozen snapshot of all registered persistence contracts.
 */
export interface PersistenceContractsView {
  readonly version: string;
  readonly schemaVersion: string;
  readonly repositories: readonly RepositoryContractDescriptor[];
  readonly storagePorts: readonly StorageContractDescriptor[];
  readonly generatedAt: string;
}
