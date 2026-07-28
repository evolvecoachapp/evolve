import type { LogMetadata } from "../models/LogMetadata";
import { createLogMetadata } from "../models/LogMetadata";

export type LoggerMetadata = LogMetadata;

export function createLoggerMetadata(
  attributes: Readonly<Record<string, string>> = {},
): LoggerMetadata {
  return createLogMetadata(attributes);
}
