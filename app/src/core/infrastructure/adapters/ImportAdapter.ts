import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for data import.
 * No implementation in this sprint.
 */
export interface ImportAdapter {
  readonly adapterId: "import";
  importData(
    format: string,
    payload: string,
  ): Promise<AdapterResult<Readonly<Record<string, string>>>> | AdapterResult<Readonly<Record<string, string>>>;
  supportedFormats(): Promise<AdapterResult<readonly string[]>> | AdapterResult<readonly string[]>;
}
