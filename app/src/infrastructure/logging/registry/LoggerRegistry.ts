import type { Logger } from "../logger/Logger";
import type { LoggerRegistration } from "./LoggerRegistration";
import { createLoggerRegistration } from "./LoggerRegistration";
import { createLoggerMetadata } from "./LoggerMetadata";
import {
  LOGGER_TOKENS,
  isLoggerToken,
  type LoggerToken,
} from "./LoggerToken";
import { LoggerRegistrationError, LoggerValidationError } from "./errors";
import type { LogValidation } from "../models/LogResult";
import { createLogValidation } from "../models/LogResult";

/**
 * In-memory registry of logger registrations + bound instances.
 */
export class LoggerRegistry {
  private readonly registrations = new Map<LoggerToken, LoggerRegistration>();
  private readonly loggers = new Map<LoggerToken, Logger>();
  private activeToken: LoggerToken | null = null;

  register(registration: LoggerRegistration, logger: Logger): void {
    const issues = this.validateRegistration(registration, logger);
    if (issues.length > 0) {
      throw new LoggerValidationError(
        issues,
        `Cannot register logger: ${issues.join(", ")}`,
      );
    }

    if (this.registrations.has(registration.token)) {
      throw new LoggerRegistrationError(
        registration.token,
        `Duplicate logger registration: ${registration.token}`,
      );
    }

    this.registrations.set(
      registration.token,
      Object.freeze({
        token: registration.token,
        name: registration.name,
        version: registration.version,
        loggerId: registration.loggerId,
        metadata: createLoggerMetadata(registration.metadata),
      }),
    );
    this.loggers.set(registration.token, logger);

    if (this.activeToken === null) {
      this.activeToken = registration.token;
    }
  }

  unregister(token: LoggerToken): boolean {
    this.loggers.delete(token);
    const removed = this.registrations.delete(token);
    if (this.activeToken === token) {
      this.activeToken = this.registrations.keys().next().value ?? null;
    }
    return removed;
  }

  setActive(token: LoggerToken): void {
    if (!this.loggers.has(token)) {
      throw new LoggerRegistrationError(
        token,
        `Cannot activate unregistered logger: ${token}`,
      );
    }
    this.activeToken = token;
  }

  resolve(token: LoggerToken): Logger | null {
    return this.loggers.get(token) ?? null;
  }

  resolveActive(): Logger | null {
    if (this.activeToken === null) {
      return null;
    }
    return this.loggers.get(this.activeToken) ?? null;
  }

  resolveRegistration(token: LoggerToken): LoggerRegistration | null {
    return this.registrations.get(token) ?? null;
  }

  has(token: LoggerToken): boolean {
    return this.registrations.has(token);
  }

  list(): readonly LoggerRegistration[] {
    return Object.freeze([...this.registrations.values()]);
  }

  tokens(): readonly LoggerToken[] {
    return Object.freeze([...this.registrations.keys()]);
  }

  getActiveToken(): LoggerToken | null {
    return this.activeToken;
  }

  clear(): void {
    this.registrations.clear();
    this.loggers.clear();
    this.activeToken = null;
  }

  validate(): LogValidation {
    const errors: string[] = [];
    const seen = new Set<LoggerToken>();

    if (this.registrations.size === 0) {
      errors.push("Missing logger");
    }

    for (const registration of this.registrations.values()) {
      if (seen.has(registration.token)) {
        errors.push(`Duplicate registrations: ${registration.token}`);
      }
      seen.add(registration.token);

      const logger = this.loggers.get(registration.token);
      if (!logger) {
        errors.push(`Missing logger: ${registration.token}`);
        continue;
      }
      errors.push(...this.validateRegistration(registration, logger));
    }

    for (const required of LOGGER_TOKENS) {
      if (!this.registrations.has(required)) {
        errors.push(`Missing logger: ${required}`);
      }
      if (!this.loggers.has(required)) {
        errors.push(`Missing logger instance: ${required}`);
      }
    }

    return createLogValidation(errors);
  }

  private validateRegistration(
    registration: LoggerRegistration,
    logger: Logger,
  ): string[] {
    const issues: string[] = [];

    if (!registration || typeof registration !== "object") {
      issues.push("Invalid registration: registration missing");
      return issues;
    }

    if (!isLoggerToken(registration.token)) {
      issues.push("Invalid registration: unknown logger token");
    }

    if (
      typeof registration.name !== "string" ||
      registration.name.trim().length === 0
    ) {
      issues.push(`Invalid metadata: name required for ${registration.token}`);
    }

    if (
      typeof registration.version !== "string" ||
      registration.version.trim().length === 0
    ) {
      issues.push(
        `Invalid metadata: version required for ${registration.token}`,
      );
    }

    if (!isLoggerToken(registration.loggerId)) {
      issues.push(
        `Invalid registration: unknown loggerId for ${registration.token}`,
      );
    }

    if (registration.token !== registration.loggerId) {
      issues.push(
        `Contract compliance failure: token/loggerId mismatch for ${registration.token}`,
      );
    }

    if (
      !registration.metadata ||
      typeof registration.metadata !== "object" ||
      Array.isArray(registration.metadata)
    ) {
      issues.push(
        `Missing metadata: metadata object required for ${registration.token}`,
      );
    }

    if (!logger || typeof logger !== "object") {
      issues.push(`Missing logger: ${registration.token}`);
      return issues;
    }

    if (logger.loggerId !== registration.token) {
      issues.push(`Contract compliance failure: ${registration.token}`);
    }

    if (logger.adapterId !== "logging") {
      issues.push(
        `Contract compliance failure: adapterId must be logging for ${registration.token}`,
      );
    }

    const requiredMethods = [
      "trace",
      "debug",
      "info",
      "warn",
      "error",
      "fatal",
      "flush",
      "clear",
      "statistics",
    ] as const;

    for (const method of requiredMethods) {
      if (typeof logger[method] !== "function") {
        issues.push(
          `Unsupported operations: ${method} missing on ${registration.token}`,
        );
      }
    }

    if (
      !logger.capabilities ||
      typeof logger.capabilities !== "object" ||
      Array.isArray(logger.capabilities)
    ) {
      issues.push(`Invalid capabilities: ${registration.token}`);
    }

    return issues;
  }
}

export function createLoggerRegistry(
  entries: readonly {
    readonly registration: LoggerRegistration;
    readonly logger: Logger;
  }[] = [],
): LoggerRegistry {
  const registry = new LoggerRegistry();
  for (const entry of entries) {
    registry.register(entry.registration, entry.logger);
  }
  return registry;
}

export { createLoggerRegistration, type LoggerRegistration };
