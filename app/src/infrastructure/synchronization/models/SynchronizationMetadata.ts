/**
 * Immutable metadata bag for synchronization entities.
 */
export type SynchronizationMetadata = Readonly<Record<string, string>>;

export function createSynchronizationMetadata(
  attributes: Readonly<Record<string, string>> = {},
): SynchronizationMetadata {
  return Object.freeze({ ...attributes });
}
