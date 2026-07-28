import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for storage backends.
 * No implementation in this sprint.
 */
export interface StorageAdapter {
  readonly adapterId: "storage";
  read(
    key: string,
  ): Promise<AdapterResult<string | null>> | AdapterResult<string | null>;
  write(
    key: string,
    value: string,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  delete(key: string): Promise<AdapterResult<void>> | AdapterResult<void>;
  exists(key: string): Promise<AdapterResult<boolean>> | AdapterResult<boolean>;
}
