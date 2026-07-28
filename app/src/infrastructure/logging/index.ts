/**
 * Logging & Observability Adapter Foundation (Sprint 30.6).
 *
 * Application → Logging Contract → Logging Adapter → Mock Logger
 *
 * Deterministic logging infrastructure used by every layer of EVOLVE.
 * No console / file / OpenTelemetry / Sentry / Datadog / Azure Monitor /
 * Grafana / Elastic / cloud / networking / persistence / business logic.
 */

export * from "./models";
export * from "./levels";
export * from "./context";
export * from "./events";
export {
  LOGGER_TOKENS,
  isLoggerToken,
  createLoggerRegistration,
  createLoggerMetadata,
  createLoggerResult,
  LoggerRegistry,
  createLoggerRegistry,
  LoggerRegistrationError,
  LoggerValidationError,
  LoggerNotFoundError,
  type LoggerToken,
  type LoggerRegistration,
  type LoggerMetadata,
  type LoggerResult,
} from "./registry";
export {
  MockLogger,
  LoggerValidator,
  LogDispatcher,
  LoggerInstanceFactory,
  type Logger,
  type LoggerCreateDeps,
} from "./logger";
export { validateLoggingBundle } from "./validation";
export {
  LoggerFactory,
  getLogger,
  log,
  getLogStatistics,
  clearLogs,
  validateLogging,
  LOGGING_ADAPTER_VERSION,
  type LoggerBundle,
  type LoggerFactoryDeps,
} from "./application";
