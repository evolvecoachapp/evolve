/**
 * Immutable backend capability descriptors.
 * Capabilities only — no runtime probing, no I/O.
 */
export interface BackendCapabilities {
  readonly supportsSend: boolean;
  readonly supportsExecute: boolean;
  readonly supportsDispatch: boolean;
  readonly supportsHealth: boolean;
  readonly supportsOffline: boolean;
  readonly supportsListEndpoints: boolean;
}

export function createBackendCapabilities(
  input: Partial<BackendCapabilities> = {},
): BackendCapabilities {
  return Object.freeze({
    supportsSend: input.supportsSend ?? true,
    supportsExecute: input.supportsExecute ?? true,
    supportsDispatch: input.supportsDispatch ?? true,
    supportsHealth: input.supportsHealth ?? true,
    supportsOffline: input.supportsOffline ?? true,
    supportsListEndpoints: input.supportsListEndpoints ?? true,
  });
}

export const MOCK_BACKEND_CAPABILITIES = createBackendCapabilities({
  supportsSend: true,
  supportsExecute: true,
  supportsDispatch: true,
  supportsHealth: true,
  supportsOffline: true,
  supportsListEndpoints: true,
});
