import type { StorageResult } from "./StorageResult";

/**
 * Storage read port contract.
 * No implementation in this sprint.
 */
export interface StorageReader {
  readonly portId: "storage-reader";
  read(
    key: string,
  ): Promise<StorageResult<string | null>> | StorageResult<string | null>;
  readMany(
    keys: readonly string[],
  ):
    | Promise<StorageResult<readonly (string | null)[]>>
    | StorageResult<readonly (string | null)[]>;
  has(key: string): Promise<StorageResult<boolean>> | StorageResult<boolean>;
}
