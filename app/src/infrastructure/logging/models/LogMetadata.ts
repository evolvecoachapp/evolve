/**
 * Immutable metadata for logging entities.
 */
export type LogMetadata = Readonly<Record<string, string>>;

export function createLogMetadata(
  attributes: Readonly<Record<string, string>> = {},
): LogMetadata {
  return Object.freeze({ ...attributes });
}
