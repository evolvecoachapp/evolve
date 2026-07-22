/** Descriptive metadata for a registered tool. */
export interface ToolMetadata {
  readonly version: string;
  readonly tags: readonly string[];
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
}
