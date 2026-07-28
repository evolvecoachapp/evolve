import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for logging platforms.
 * No implementation in this sprint.
 */
export interface LoggingAdapter {
  readonly adapterId: "logging";
  debug(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  info(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  warn(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  error(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
}
