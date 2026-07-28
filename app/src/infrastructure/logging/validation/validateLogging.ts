import type { Logger } from "../logger/Logger";
import type { LoggerRegistry } from "../registry/LoggerRegistry";
import {
  createLogValidation,
  type LogValidation,
} from "../models/LogResult";
import { LOGGER_TOKENS } from "../registry/LoggerToken";
import { LoggerValidator } from "../logger/LoggerValidator";

/**
 * Validate logging adapter wiring:
 * invalid level, missing metadata, duplicate registrations,
 * invalid context, invalid event.
 */
export function validateLoggingBundle(input: {
  readonly registry?: LoggerRegistry | null;
  readonly logger?: Logger | null;
}): LogValidation {
  const errors: string[] = [];
  const validator = new LoggerValidator();

  if (!input.registry) {
    errors.push("Missing logger");
  } else {
    const registryValidation = input.registry.validate();
    errors.push(...registryValidation.errors);
  }

  if (!input.logger) {
    errors.push("Missing logger");
  } else {
    if (input.logger.adapterId !== "logging") {
      errors.push("Contract compliance failure: logging");
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
      if (typeof input.logger[method] !== "function") {
        errors.push(`Unsupported operations: ${method} missing`);
      }
    }

    const capsValidation = validator.validateCapabilities(
      input.logger.capabilities,
    );
    errors.push(...capsValidation.errors);

    if (input.registry) {
      for (const token of LOGGER_TOKENS) {
        if (!input.registry.has(token)) {
          errors.push(`Missing logger: ${token}`);
        }
      }
      if (
        input.logger.loggerId &&
        !input.registry.has(input.logger.loggerId)
      ) {
        errors.push(`Missing logger: ${input.logger.loggerId}`);
      }

      const registration = input.registry.resolveRegistration(
        input.logger.loggerId,
      );
      if (!registration) {
        errors.push("Invalid registration");
      } else if (
        !registration.metadata ||
        typeof registration.metadata !== "object"
      ) {
        errors.push("Missing metadata");
      }
    }
  }

  return createLogValidation(errors);
}
