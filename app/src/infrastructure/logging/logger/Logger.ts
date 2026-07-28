import type { LoggingAdapter } from "../../../core/infrastructure/adapters/LoggingAdapter";
import type { AdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import type { LogCapabilities } from "../models/LogCapabilities";
import type { LogEntry } from "../models/LogEntry";
import type { LogEvent } from "../events/LogEvent";
import type { LogResult } from "../models/LogResult";
import type { LogStatistics } from "../models/LogStatistics";
import type { LogValidation } from "../models/LogResult";
import type { LoggerToken } from "../registry/LoggerToken";
import type { LogLevel } from "../levels/LogLevel";
import type { LogContext } from "../context/LogContext";

/**
 * Logger contract.
 * Extends Infrastructure LoggingAdapter; replaceable without Domain changes.
 */
export interface Logger extends LoggingAdapter {
  readonly loggerId: LoggerToken;
  readonly capabilities: LogCapabilities;

  trace(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> | Promise<AdapterResult<void>>;

  debug(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> | Promise<AdapterResult<void>>;

  info(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> | Promise<AdapterResult<void>>;

  warn(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> | Promise<AdapterResult<void>>;

  error(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> | Promise<AdapterResult<void>>;

  fatal(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> | Promise<AdapterResult<void>>;

  flush(): AdapterResult<void> | Promise<AdapterResult<void>>;

  clear(): AdapterResult<void> | Promise<AdapterResult<void>>;

  statistics():
    | AdapterResult<Readonly<Record<string, string>>>
    | Promise<AdapterResult<Readonly<Record<string, string>>>>;

  log(event: LogEvent): LogResult<LogEntry>;

  logMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): LogResult<LogEntry>;

  getStatistics(): LogResult<LogStatistics>;

  getEntries(): LogResult<readonly LogEntry[]>;

  flushEntries(): LogResult<number>;

  clearEntries(): LogResult<void>;

  validate(): LogValidation;
}
