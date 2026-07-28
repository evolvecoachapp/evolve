import type { LogResult } from "../models/LogResult";
import { createLogResult } from "../models/LogResult";

export type LoggerResult<T = unknown> = LogResult<T>;

export function createLoggerResult<T>(input: {
  readonly success: boolean;
  readonly value?: T | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}): LoggerResult<T> {
  return createLogResult(input);
}
