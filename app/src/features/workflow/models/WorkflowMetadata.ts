/** Descriptive metadata for a registered workflow. */
export interface WorkflowMetadata {
  readonly version: string;
  readonly tags: readonly string[];
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
}
