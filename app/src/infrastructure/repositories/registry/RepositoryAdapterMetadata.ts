/**
 * Immutable metadata for a registered repository adapter.
 */
export type RepositoryAdapterMetadata = Readonly<Record<string, string>>;

export function createRepositoryAdapterMetadata(
  attributes: Readonly<Record<string, string>>,
): RepositoryAdapterMetadata {
  return Object.freeze({ ...attributes });
}
