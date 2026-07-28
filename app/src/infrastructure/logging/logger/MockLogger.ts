import {
  createLogContext,
  createLogEvent,
  createLogResult,
  MOCK_LOG_CAPABILITIES,
  type LogCapabilities,
  type LogContext,
  type LogEntry,
  type LogEvent,
  type LogLevel,
  type LogResult,
  type LogStatistics,
  type LogValidation,
} from "../models";
import { createAdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import type { AdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import type { Logger } from "./Logger";
import { LogDispatcher } from "./LogDispatcher";
import { LoggerValidator } from "./LoggerValidator";

/**
 * In-memory Mock Logger.
 * Implements LoggingAdapter. No console. No files. No remote logging.
 */
export class MockLogger implements Logger {
  readonly adapterId = "logging" as const;
  readonly loggerId = "mock" as const;
  readonly capabilities: LogCapabilities = MOCK_LOG_CAPABILITIES;

  private readonly dispatcher: LogDispatcher;
  private readonly validator: LoggerValidator;

  constructor(
    dispatcher: LogDispatcher = new LogDispatcher(),
    validator: LoggerValidator = new LoggerValidator(),
  ) {
    this.dispatcher = dispatcher;
    this.validator = validator;
  }

  trace(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> {
    return this.toAdapterResult(this.logMessage("Trace", message, this.toContext(context)));
  }

  debug(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> {
    return this.toAdapterResult(this.logMessage("Debug", message, this.toContext(context)));
  }

  info(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> {
    return this.toAdapterResult(
      this.logMessage("Information", message, this.toContext(context)),
    );
  }

  warn(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> {
    return this.toAdapterResult(this.logMessage("Warning", message, this.toContext(context)));
  }

  error(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> {
    return this.toAdapterResult(this.logMessage("Error", message, this.toContext(context)));
  }

  fatal(
    message: string,
    context?: Readonly<Record<string, string>>,
  ): AdapterResult<void> {
    return this.toAdapterResult(this.logMessage("Fatal", message, this.toContext(context)));
  }

  flush(): AdapterResult<void> {
    const result = this.flushEntries();
    return createAdapterResult<void>({
      success: result.success,
      value: undefined,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  clear(): AdapterResult<void> {
    const result = this.clearEntries();
    return createAdapterResult<void>({
      success: result.success,
      value: undefined,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  statistics(): AdapterResult<Readonly<Record<string, string>>> {
    const result = this.getStatistics();
    if (!result.success || !result.value) {
      return createAdapterResult<Readonly<Record<string, string>>>({
        success: false,
        errorCode: result.errorCode,
        message: result.message,
      });
    }
    const stats = result.value;
    return createAdapterResult<Readonly<Record<string, string>>>({
      success: true,
      value: Object.freeze({
        totalCount: String(stats.totalCount),
        flushedCount: String(stats.flushedCount),
        lastEntryId: stats.lastEntryId ?? "",
        Trace: String(stats.countsByLevel.Trace),
        Debug: String(stats.countsByLevel.Debug),
        Information: String(stats.countsByLevel.Information),
        Warning: String(stats.countsByLevel.Warning),
        Error: String(stats.countsByLevel.Error),
        Fatal: String(stats.countsByLevel.Fatal),
      }),
    });
  }

  log(event: LogEvent): LogResult<LogEntry> {
    return this.dispatcher.dispatch(event);
  }

  logMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): LogResult<LogEntry> {
    return this.dispatcher.dispatch(
      createLogEvent({
        level,
        message,
        context:
          context ??
          createLogContext({
            scope: "Application",
          }),
        metadata: Object.freeze({ provider: "mock" }),
      }),
    );
  }

  getStatistics(): LogResult<LogStatistics> {
    return createLogResult({
      success: true,
      value: this.dispatcher.getStatistics(),
    });
  }

  getEntries(): LogResult<readonly LogEntry[]> {
    return createLogResult({
      success: true,
      value: this.dispatcher.getEntries(),
    });
  }

  flushEntries(): LogResult<number> {
    return this.dispatcher.flush();
  }

  clearEntries(): LogResult<void> {
    return this.dispatcher.clear();
  }

  validate(): LogValidation {
    const errors: string[] = [];
    const caps = this.validator.validateCapabilities(this.capabilities);
    errors.push(...caps.errors);

    for (const entry of this.dispatcher.getEntries()) {
      const entryValidation = this.validator.validateEntry(entry);
      errors.push(...entryValidation.errors);
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze([...errors]),
    });
  }

  private toContext(
    context?: Readonly<Record<string, string>>,
  ): LogContext {
    const scopeValue = context?.scope;
    const scope =
      scopeValue === "Workout" ||
      scopeValue === "Nutrition" ||
      scopeValue === "Recovery" ||
      scopeValue === "Coach" ||
      scopeValue === "Synchronization" ||
      scopeValue === "Authentication" ||
      scopeValue === "Backend" ||
      scopeValue === "Application"
        ? scopeValue
        : "Application";

    const attributes = Object.freeze({ ...(context ?? {}) });
    return createLogContext({ scope, attributes });
  }

  private toAdapterResult(result: LogResult<LogEntry>): AdapterResult<void> {
    return createAdapterResult<void>({
      success: result.success,
      value: undefined,
      errorCode: result.errorCode,
      message: result.message,
    });
  }
}
