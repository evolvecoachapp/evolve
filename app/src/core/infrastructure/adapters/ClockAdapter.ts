import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for clock / time providers.
 * No implementation in this sprint.
 */
export interface ClockAdapter {
  readonly adapterId: "clock";
  now(): AdapterResult<string>;
  nowMs(): AdapterResult<number>;
}
