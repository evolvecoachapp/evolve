import type { LoggerToken } from "./LoggerToken";
import type { LoggerMetadata } from "./LoggerMetadata";
import { createLoggerMetadata } from "./LoggerMetadata";

/**
 * Immutable descriptor for a registered logger.
 */
export interface LoggerRegistration {
  readonly token: LoggerToken;
  readonly name: string;
  readonly version: string;
  readonly loggerId: LoggerToken;
  readonly metadata: LoggerMetadata;
}

export function createLoggerRegistration(input: {
  readonly token: LoggerToken;
  readonly name: string;
  readonly version: string;
  readonly loggerId: LoggerToken;
  readonly metadata?: Readonly<Record<string, string>>;
}): LoggerRegistration {
  return Object.freeze({
    token: input.token,
    name: input.name,
    version: input.version,
    loggerId: input.loggerId,
    metadata: createLoggerMetadata(input.metadata ?? {}),
  });
}
