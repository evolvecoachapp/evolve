import type { PersistenceCapability } from "./PersistenceCapability";
import type { StoragePortToken } from "../ports/StoragePortToken";

/**
 * Immutable descriptor for a registered storage port contract.
 * Metadata only — no adapter, no storage.
 */
export interface StorageContractDescriptor {
  readonly token: StoragePortToken;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly PersistenceCapability[];
  readonly metadata: Readonly<Record<string, string>>;
}
