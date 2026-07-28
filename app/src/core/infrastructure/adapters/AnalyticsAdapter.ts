import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for analytics platforms.
 * No implementation in this sprint.
 */
export interface AnalyticsAdapter {
  readonly adapterId: "analytics";
  track(
    eventName: string,
    properties?: Readonly<Record<string, string | number | boolean | null>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  identify(
    userId: string,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  flush(): Promise<AdapterResult<void>> | AdapterResult<void>;
}
