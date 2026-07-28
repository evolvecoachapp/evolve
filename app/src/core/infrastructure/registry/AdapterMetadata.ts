/**
 * Immutable metadata for a registered infrastructure adapter contract.
 * Metadata only — no adapter implementation.
 */
export type AdapterMetadata = Readonly<Record<string, string>>;

export function createAdapterMetadata(
  attributes: Readonly<Record<string, string>>,
): AdapterMetadata {
  return Object.freeze({ ...attributes });
}
