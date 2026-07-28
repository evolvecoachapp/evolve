import {
  createLogValidation,
  isLogLevel,
  isValidLogContext,
  type LogCapabilities,
  type LogEntry,
  type LogEvent,
  type LogValidation,
} from "../models";
import { isLogScope } from "../context";

/**
 * Deterministic logger validation.
 * Validates invalid level, missing metadata, invalid context, invalid event.
 */
export class LoggerValidator {
  validateEvent(event: LogEvent | null | undefined): LogValidation {
    const errors: string[] = [];

    if (!event || typeof event !== "object") {
      errors.push("invalid event");
      return createLogValidation(errors);
    }

    if (!isLogLevel(event.level)) {
      errors.push("invalid level");
    }

    if (typeof event.message !== "string" || event.message.trim().length === 0) {
      errors.push("invalid event: message required");
    }

    if (!isValidLogContext(event.context)) {
      errors.push("invalid context");
    }

    if (
      !event.metadata ||
      typeof event.metadata !== "object" ||
      Array.isArray(event.metadata)
    ) {
      errors.push("missing metadata");
    }

    return createLogValidation(errors);
  }

  validateEntry(entry: LogEntry | null | undefined): LogValidation {
    const errors: string[] = [];

    if (!entry || typeof entry !== "object") {
      errors.push("invalid event");
      return createLogValidation(errors);
    }

    if (
      typeof entry.entryId !== "string" ||
      entry.entryId.trim().length === 0
    ) {
      errors.push("missing immutable fields: entryId");
    }

    if (!isLogLevel(entry.level)) {
      errors.push("invalid level");
    }

    if (typeof entry.message !== "string" || entry.message.trim().length === 0) {
      errors.push("invalid event: message required");
    }

    if (!isValidLogContext(entry.context)) {
      errors.push("invalid context");
    }

    if (
      typeof entry.timestamp !== "string" ||
      entry.timestamp.trim().length === 0
    ) {
      errors.push("missing immutable fields: timestamp");
    }

    if (
      !entry.metadata ||
      typeof entry.metadata !== "object" ||
      Array.isArray(entry.metadata)
    ) {
      errors.push("missing metadata");
    }

    return createLogValidation(errors);
  }

  validateCapabilities(
    capabilities: LogCapabilities | null | undefined,
  ): LogValidation {
    const errors: string[] = [];

    if (!capabilities || typeof capabilities !== "object") {
      errors.push("invalid capabilities");
      return createLogValidation(errors);
    }

    const flags: (keyof LogCapabilities)[] = [
      "supportsTrace",
      "supportsDebug",
      "supportsInformation",
      "supportsWarning",
      "supportsError",
      "supportsFatal",
      "supportsFlush",
      "supportsClear",
      "supportsStatistics",
      "supportsOffline",
    ];

    for (const flag of flags) {
      if (typeof capabilities[flag] !== "boolean") {
        errors.push(`invalid capabilities: ${flag}`);
      }
    }

    if (
      !capabilities.supportsTrace ||
      !capabilities.supportsDebug ||
      !capabilities.supportsInformation ||
      !capabilities.supportsWarning ||
      !capabilities.supportsError ||
      !capabilities.supportsFatal ||
      !capabilities.supportsFlush ||
      !capabilities.supportsClear ||
      !capabilities.supportsStatistics
    ) {
      errors.push("unsupported operations");
    }

    return createLogValidation(errors);
  }

  validateLevel(level: string | null | undefined): LogValidation {
    const errors: string[] = [];
    if (!level || !isLogLevel(level)) {
      errors.push("invalid level");
    }
    return createLogValidation(errors);
  }

  validateScope(scope: string | null | undefined): LogValidation {
    const errors: string[] = [];
    if (!scope || !isLogScope(scope)) {
      errors.push("invalid context");
    }
    return createLogValidation(errors);
  }
}
