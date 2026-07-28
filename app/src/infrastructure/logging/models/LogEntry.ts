import type { LogLevel } from "../levels/LogLevel";
import type { LogContext } from "../context/LogContext";
import {
  createLogMetadata,
  type LogMetadata,
} from "./LogMetadata";

/**
 * Immutable stored log entry.
 */
export interface LogEntry {
  readonly entryId: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context: LogContext;
  readonly timestamp: string;
  readonly metadata: LogMetadata;
}

export function createLogEntry(input: {
  readonly entryId: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context: LogContext;
  readonly timestamp: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): LogEntry {
  return Object.freeze({
    entryId: input.entryId,
    level: input.level,
    message: input.message,
    context: input.context,
    timestamp: input.timestamp,
    metadata: createLogMetadata(input.metadata ?? {}),
  });
}
