import type { StorageResult } from "./StorageResult";

/**
 * Storage write port contract.
 * No implementation in this sprint.
 */
export interface StorageWriter {
  readonly portId: "storage-writer";
  write(
    key: string,
    value: string,
  ): Promise<StorageResult<void>> | StorageResult<void>;
  remove(key: string): Promise<StorageResult<void>> | StorageResult<void>;
  clear(): Promise<StorageResult<void>> | StorageResult<void>;
}
