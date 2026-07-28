import type { LogLevel } from "../levels/LogLevel";
import type { LogContext } from "../context/LogContext";
import {
  createLogMetadata,
  type LogMetadata,
} from "../models/LogMetadata";
import { createLogContext } from "../context/LogContext";

/**
 * Immutable log event input (pre-entry).
 */
export interface LogEvent {
  readonly level: LogLevel;
  readonly message: string;
  readonly context: LogContext;
  readonly metadata: LogMetadata;
}

export function createLogEvent(input: {
  readonly level: LogLevel;
  readonly message: string;
  readonly context: LogContext;
  readonly metadata?: Readonly<Record<string, string>>;
}): LogEvent {
  return Object.freeze({
    level: input.level,
    message: input.message,
    context: input.context,
    metadata: createLogMetadata(input.metadata ?? {}),
  });
}

export function createScopedLogEvent(input: {
  readonly level: LogLevel;
  readonly message: string;
  readonly scope: LogContext["scope"];
  readonly attributes?: Readonly<Record<string, string>>;
  readonly metadata?: Readonly<Record<string, string>>;
}): LogEvent {
  return createLogEvent({
    level: input.level,
    message: input.message,
    context: createLogContext({
      scope: input.scope,
      attributes: input.attributes,
    }),
    metadata: input.metadata,
  });
}
