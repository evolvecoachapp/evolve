import { MockLogger } from "./MockLogger";
import type { Logger } from "./Logger";
import type { LoggerToken } from "../registry/LoggerToken";
import { LogDispatcher } from "./LogDispatcher";
import { LoggerValidator } from "./LoggerValidator";

export interface LoggerCreateDeps {
  readonly token?: LoggerToken;
  readonly dispatcher?: LogDispatcher;
  readonly validator?: LoggerValidator;
  readonly logger?: Logger;
}

/**
 * Factory for logger instances.
 * Currently produces MockLogger only.
 */
export const LoggerInstanceFactory = {
  create(deps: LoggerCreateDeps = {}): Logger {
    if (deps.logger) {
      return deps.logger;
    }

    const token = deps.token ?? "mock";
    if (token !== "mock") {
      throw new Error(`Logger not implemented in this sprint: ${token}`);
    }

    const validator = deps.validator ?? new LoggerValidator();
    const dispatcher =
      deps.dispatcher ?? new LogDispatcher(validator);

    return new MockLogger(dispatcher, validator);
  },
} as const;
