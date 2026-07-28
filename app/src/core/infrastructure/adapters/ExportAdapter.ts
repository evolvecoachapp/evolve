import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for data export.
 * No implementation in this sprint.
 */
export interface ExportAdapter {
  readonly adapterId: "export";
  exportData(
    format: string,
    payload: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<string>> | AdapterResult<string>;
  supportedFormats(): Promise<AdapterResult<readonly string[]>> | AdapterResult<readonly string[]>;
}
