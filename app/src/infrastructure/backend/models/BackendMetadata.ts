/**
 * Immutable metadata for backend entities.
 */
export type BackendMetadata = Readonly<Record<string, string>>;

export function createBackendMetadata(
  attributes: Readonly<Record<string, string>> = {},
): BackendMetadata {
  return Object.freeze({ ...attributes });
}
