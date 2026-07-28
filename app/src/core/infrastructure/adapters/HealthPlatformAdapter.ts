import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for health platforms (Apple Health / Google Fit).
 * No implementation in this sprint.
 */
export interface HealthPlatformAdapter {
  readonly adapterId: "health-platform";
  requestAuthorization(): Promise<AdapterResult<boolean>> | AdapterResult<boolean>;
  readSamples(
    metricKey: string,
  ): Promise<AdapterResult<readonly string[]>> | AdapterResult<readonly string[]>;
  getAvailability(): Promise<AdapterResult<boolean>> | AdapterResult<boolean>;
}
