import {
  createLogEntry,
  createLogResult,
  createLogStatistics,
  type LogEntry,
  type LogEvent,
  type LogLevel,
  type LogResult,
  type LogStatistics,
} from "../models";
import { LOG_LEVELS } from "../levels";
import { LoggerValidator } from "./LoggerValidator";

/**
 * Deterministic in-memory log dispatcher.
 * No console. No files. No remote logging. No persistence.
 */
export class LogDispatcher {
  private readonly validator: LoggerValidator;
  private readonly entries: LogEntry[] = [];
  private sequence = 0;
  private flushedCount = 0;

  constructor(validator: LoggerValidator = new LoggerValidator()) {
    this.validator = validator;
  }

  dispatch(event: LogEvent): LogResult<LogEntry> {
    const validation = this.validator.validateEvent(event);
    if (!validation.valid) {
      return createLogResult({
        success: false,
        errorCode: "validation_error",
        message: validation.errors.join("; "),
      });
    }

    this.sequence += 1;
    const timestamp = `1970-01-01T00:00:${String(this.sequence).padStart(2, "0")}.000Z`;
    const entry = createLogEntry({
      entryId: `mock-log-${this.sequence}`,
      level: event.level,
      message: event.message,
      context: event.context,
      timestamp,
      metadata: event.metadata,
    });

    const entryValidation = this.validator.validateEntry(entry);
    if (!entryValidation.valid) {
      return createLogResult({
        success: false,
        value: entry,
        errorCode: "invalid_entry",
        message: entryValidation.errors.join("; "),
      });
    }

    this.entries.push(entry);
    return createLogResult({
      success: true,
      value: entry,
    });
  }

  getEntries(): readonly LogEntry[] {
    return Object.freeze([...this.entries]);
  }

  getStatistics(): LogStatistics {
    const countsByLevel = Object.fromEntries(
      LOG_LEVELS.map((level) => [level, 0]),
    ) as Record<LogLevel, number>;

    for (const entry of this.entries) {
      countsByLevel[entry.level] += 1;
    }

    const last = this.entries[this.entries.length - 1];
    return createLogStatistics({
      totalCount: this.entries.length,
      flushedCount: this.flushedCount,
      countsByLevel,
      lastEntryId: last?.entryId ?? null,
    });
  }

  flush(): LogResult<number> {
    const count = this.entries.length;
    this.flushedCount += count;
    return createLogResult({
      success: true,
      value: count,
    });
  }

  clear(): LogResult<void> {
    this.entries.length = 0;
    this.flushedCount = 0;
    return createLogResult({
      success: true,
      value: undefined,
    });
  }
}
