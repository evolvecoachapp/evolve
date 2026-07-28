import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for synchronization backends.
 * No implementation in this sprint.
 */
export interface SynchronizationAdapter {
  readonly adapterId: "synchronization";
  push(
    payload: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  pull(): Promise<AdapterResult<Readonly<Record<string, string>>>> | AdapterResult<Readonly<Record<string, string>>>;
  getStatus(): Promise<AdapterResult<string>> | AdapterResult<string>;
}
