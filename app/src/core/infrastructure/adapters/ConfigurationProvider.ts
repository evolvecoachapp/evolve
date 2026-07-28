import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for configuration providers.
 * No implementation in this sprint.
 */
export interface ConfigurationProvider {
  readonly adapterId: "configuration";
  get(
    key: string,
  ): Promise<AdapterResult<string | null>> | AdapterResult<string | null>;
  getAll(): Promise<AdapterResult<Readonly<Record<string, string>>>> | AdapterResult<Readonly<Record<string, string>>>;
  has(key: string): Promise<AdapterResult<boolean>> | AdapterResult<boolean>;
}
