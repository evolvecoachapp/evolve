import type { StorageHealthStatus } from "./StorageHealthStatus";
import type { StorageResult } from "./StorageResult";

/**
 * Storage health port contract.
 * No implementation in this sprint.
 */
export interface StorageHealth {
  readonly portId: "storage-health";
  check():
    | Promise<StorageResult<StorageHealthStatus>>
    | StorageResult<StorageHealthStatus>;
}
