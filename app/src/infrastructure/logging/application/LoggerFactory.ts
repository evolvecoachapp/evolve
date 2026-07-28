import type { Logger } from "../logger/Logger";
import { LoggerInstanceFactory } from "../logger/LoggerInstanceFactory";
import { MockLogger } from "../logger/MockLogger";
import {
  LoggerRegistry,
  createLoggerRegistration,
  createLoggerRegistry,
} from "../registry";
import type { LoggerToken } from "../registry/LoggerToken";
import { validateLoggingBundle } from "../validation";
import type { LogValidation } from "../models/LogResult";
import type { LogStatistics } from "../models/LogStatistics";
import type { LogEntry } from "../models/LogEntry";
import type { LogEvent } from "../events/LogEvent";
import type { LogResult } from "../models/LogResult";
import { createLogResult } from "../models/LogResult";

export const LOGGING_ADAPTER_VERSION = "1.0.0" as const;

export interface LoggerBundle {
  readonly registry: LoggerRegistry;
  readonly logger: Logger;
  readonly mockLogger: MockLogger;
}

export interface LoggerFactoryDeps {
  readonly registry?: LoggerRegistry;
  readonly logger?: Logger;
  readonly mockLogger?: MockLogger;
  readonly bundle?: LoggerBundle;
  readonly version?: string;
  readonly activeToken?: LoggerToken;
}

const LOGGER_NAMES: Record<LoggerToken, string> = {
  mock: "MockLogger",
};

function seedRegistry(
  registry: LoggerRegistry,
  logger: Logger,
  version: string,
): void {
  if (registry.has(logger.loggerId)) {
    return;
  }
  registry.register(
    createLoggerRegistration({
      token: logger.loggerId,
      name: LOGGER_NAMES[logger.loggerId],
      version,
      loggerId: logger.loggerId,
      metadata: Object.freeze({
        backend: "mock",
        contract: "logging",
      }),
    }),
    logger,
  );
}

/**
 * Factory for Logging & Observability Adapter Foundation (Mock logger).
 */
export const LoggerFactory = {
  create(deps: LoggerFactoryDeps = {}): LoggerBundle {
    if (deps.bundle) {
      return deps.bundle;
    }

    const version = deps.version ?? LOGGING_ADAPTER_VERSION;
    const mockLogger =
      deps.mockLogger ??
      (deps.logger instanceof MockLogger
        ? deps.logger
        : new MockLogger());
    const logger =
      deps.logger ??
      LoggerInstanceFactory.create({ logger: mockLogger });
    const registry = deps.registry ?? createLoggerRegistry();
    seedRegistry(registry, logger, version);

    if (deps.activeToken) {
      registry.setActive(deps.activeToken);
    }

    return Object.freeze({
      registry,
      logger,
      mockLogger: logger instanceof MockLogger ? logger : mockLogger,
    });
  },
} as const;

/** Application API — active logger. */
export function getLogger(options: {
  readonly logger?: Logger;
  readonly registry?: LoggerRegistry;
  readonly deps?: LoggerFactoryDeps;
} = {}): Logger {
  if (options.logger) {
    return options.logger;
  }
  if (options.registry) {
    const active = options.registry.resolveActive();
    if (active) {
      return active;
    }
  }
  return LoggerFactory.create(options.deps).logger;
}

/** Application API — emit a typed log event. */
export function log(
  event: LogEvent,
  options: {
    readonly logger?: Logger;
    readonly registry?: LoggerRegistry;
    readonly deps?: LoggerFactoryDeps;
  } = {},
): LogResult<LogEntry> {
  return getLogger(options).log(event);
}

/** Application API — logging statistics snapshot. */
export function getLogStatistics(options: {
  readonly logger?: Logger;
  readonly registry?: LoggerRegistry;
  readonly deps?: LoggerFactoryDeps;
} = {}): LogStatistics {
  return getLogger(options).getStatistics().value!;
}

/** Application API — clear in-memory log entries. */
export function clearLogs(options: {
  readonly logger?: Logger;
  readonly registry?: LoggerRegistry;
  readonly deps?: LoggerFactoryDeps;
} = {}): void {
  getLogger(options).clearEntries();
}

/** Application API — validate logging wiring. */
export function validateLogging(options: {
  readonly registry?: LoggerRegistry | null;
  readonly logger?: Logger | null;
  readonly deps?: LoggerFactoryDeps;
} = {}): LogValidation {
  const hasExplicit = "registry" in options || "logger" in options;

  if (hasExplicit) {
    return validateLoggingBundle({
      registry: options.registry ?? null,
      logger: options.logger ?? null,
    });
  }

  const bundle = LoggerFactory.create(options.deps);
  return validateLoggingBundle(bundle);
}

export type {
  LogValidation,
  LogResult,
  LogStatistics,
  LogEntry,
  LogEvent,
};
export { createLogResult };
