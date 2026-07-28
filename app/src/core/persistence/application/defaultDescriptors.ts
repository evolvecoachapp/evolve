import type { PersistenceCapability } from "../contracts/PersistenceCapability";
import type { RepositoryContractDescriptor } from "../contracts/RepositoryContractDescriptor";
import type { StorageContractDescriptor } from "../contracts/StorageContractDescriptor";
import { REPOSITORY_TOKENS } from "../repositories/RepositoryToken";
import { STORAGE_PORT_TOKENS } from "../ports/StoragePortToken";

const DEFAULT_REPOSITORY_CAPABILITIES: readonly PersistenceCapability[] =
  Object.freeze(["read", "write", "delete", "list"]);

const DEFAULT_STORAGE_CAPABILITIES: readonly PersistenceCapability[] =
  Object.freeze(["read", "write", "delete", "metadata"]);

const REPOSITORY_NAMES: Readonly<Record<(typeof REPOSITORY_TOKENS)[number], string>> =
  Object.freeze({
    athlete: "AthleteRepository",
    identity: "IdentityRepository",
    workspace: "WorkspaceRepository",
    snapshot: "SnapshotRepository",
    timeline: "TimelineRepository",
    plan: "PlanRepository",
    workout: "WorkoutRepository",
    nutrition: "NutritionRepository",
    recovery: "RecoveryRepository",
    settings: "SettingsRepository",
    runtime: "RuntimeRepository",
  });

const STORAGE_PORT_NAMES: Readonly<
  Record<(typeof STORAGE_PORT_TOKENS)[number], string>
> = Object.freeze({
  "storage-reader": "StorageReader",
  "storage-writer": "StorageWriter",
  "storage-transaction": "StorageTransaction",
  "storage-session": "StorageSession",
  "storage-health": "StorageHealth",
  "storage-metadata": "StorageMetadata",
  "storage-result": "StorageResult",
});

const STORAGE_PORT_CAPABILITIES = {
  "storage-reader": ["read"],
  "storage-writer": ["write", "delete"],
  "storage-transaction": ["transaction"],
  "storage-session": ["session"],
  "storage-health": ["health"],
  "storage-metadata": ["metadata"],
  "storage-result": ["metadata"],
} as const satisfies Record<
  (typeof STORAGE_PORT_TOKENS)[number],
  readonly PersistenceCapability[]
>;
export const PERSISTENCE_CONTRACT_VERSION = "1.0.0";
export const PERSISTENCE_SCHEMA_VERSION = "1";

/** Canonical repository contract descriptors (metadata only). */
export function createDefaultRepositoryDescriptors(): readonly RepositoryContractDescriptor[] {
  return Object.freeze(
    REPOSITORY_TOKENS.map((token) =>
      Object.freeze({
        token,
        name: REPOSITORY_NAMES[token],
        version: PERSISTENCE_CONTRACT_VERSION,
        capabilities: DEFAULT_REPOSITORY_CAPABILITIES,
        metadata: Object.freeze({
          layer: "persistence-contracts",
          kind: "repository",
        }),
      }),
    ),
  );
}

/** Canonical storage port contract descriptors (metadata only). */
export function createDefaultStorageDescriptors(): readonly StorageContractDescriptor[] {
  return Object.freeze(
    STORAGE_PORT_TOKENS.map((token) =>
      Object.freeze({
        token,
        name: STORAGE_PORT_NAMES[token],
        version: PERSISTENCE_CONTRACT_VERSION,
        capabilities:
          STORAGE_PORT_CAPABILITIES[token] ?? DEFAULT_STORAGE_CAPABILITIES,
        metadata: Object.freeze({
          layer: "persistence-contracts",
          kind: "storage-port",
        }),
      }),
    ),
  );
}
