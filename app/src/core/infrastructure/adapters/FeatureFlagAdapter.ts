import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for feature flag services.
 * No implementation in this sprint.
 */
export interface FeatureFlagAdapter {
  readonly adapterId: "feature-flag";
  isEnabled(
    flagKey: string,
  ): Promise<AdapterResult<boolean>> | AdapterResult<boolean>;
  getVariant(
    flagKey: string,
  ): Promise<AdapterResult<string | null>> | AdapterResult<string | null>;
  getAllFlags(): Promise<AdapterResult<Readonly<Record<string, boolean>>>> | AdapterResult<Readonly<Record<string, boolean>>>;
}
