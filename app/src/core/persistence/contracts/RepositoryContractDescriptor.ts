import type { PersistenceCapability } from "./PersistenceCapability";
import type { RepositoryToken } from "../repositories/RepositoryToken";

/**
 * Immutable descriptor for a registered repository contract.
 * Metadata only — no adapter, no storage.
 */
export interface RepositoryContractDescriptor {
  readonly token: RepositoryToken;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly PersistenceCapability[];
  readonly metadata: Readonly<Record<string, string>>;
}
