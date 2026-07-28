import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for logging platforms.
 * Contracts and orchestration only — no console, files, or remote sinks.
 */
export interface LoggingAdapter {
  readonly adapterId: "logging";
  trace(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
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
  fatal(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  flush(): Promise<AdapterResult<void>> | AdapterResult<void>;
  clear(): Promise<AdapterResult<void>> | AdapterResult<void>;
  statistics():
    | Promise<AdapterResult<Readonly<Record<string, string>>>>
    | AdapterResult<Readonly<Record<string, string>>>;
}
