/**
 * Immutable logging capability descriptors.
 * Capabilities only — no runtime probing, no I/O.
 */
export interface LogCapabilities {
  readonly supportsTrace: boolean;
  readonly supportsDebug: boolean;
  readonly supportsInformation: boolean;
  readonly supportsWarning: boolean;
  readonly supportsError: boolean;
  readonly supportsFatal: boolean;
  readonly supportsFlush: boolean;
  readonly supportsClear: boolean;
  readonly supportsStatistics: boolean;
  readonly supportsOffline: boolean;
}

export function createLogCapabilities(
  input: Partial<LogCapabilities> = {},
): LogCapabilities {
  return Object.freeze({
    supportsTrace: input.supportsTrace ?? true,
    supportsDebug: input.supportsDebug ?? true,
    supportsInformation: input.supportsInformation ?? true,
    supportsWarning: input.supportsWarning ?? true,
    supportsError: input.supportsError ?? true,
    supportsFatal: input.supportsFatal ?? true,
    supportsFlush: input.supportsFlush ?? true,
    supportsClear: input.supportsClear ?? true,
    supportsStatistics: input.supportsStatistics ?? true,
    supportsOffline: input.supportsOffline ?? true,
  });
}

export const MOCK_LOG_CAPABILITIES = createLogCapabilities({
  supportsTrace: true,
  supportsDebug: true,
  supportsInformation: true,
  supportsWarning: true,
  supportsError: true,
  supportsFatal: true,
  supportsFlush: true,
  supportsClear: true,
  supportsStatistics: true,
  supportsOffline: true,
});
