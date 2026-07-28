import {
  LoggerFactory,
  type LoggerBundle,
  type LoggerFactoryDeps,
} from "../../../infrastructure/logging/application";

export interface LoggerCompositionFactoryDeps extends LoggerFactoryDeps {}

/**
 * Composition Root factory for the Logging & Observability Adapter Foundation.
 */
export const LoggerCompositionFactory = {
  create(deps: LoggerCompositionFactoryDeps = {}): LoggerBundle {
    return LoggerFactory.create(deps);
  },
} as const;

export type { LoggerBundle, LoggerFactoryDeps };
