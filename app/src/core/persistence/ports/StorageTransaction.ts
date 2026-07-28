import type { StorageResult } from "./StorageResult";
import type { StorageSession } from "./StorageSession";

/**
 * Storage transaction port contract.
 * No implementation in this sprint.
 */
export interface StorageTransaction {
  readonly portId: "storage-transaction";
  begin(): Promise<StorageResult<StorageSession>> | StorageResult<StorageSession>;
  commit(
    session: StorageSession,
  ): Promise<StorageResult<void>> | StorageResult<void>;
  rollback(
    session: StorageSession,
  ): Promise<StorageResult<void>> | StorageResult<void>;
}
