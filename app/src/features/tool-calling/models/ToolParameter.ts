/** Immutable schema parameter for a tool. */
export interface ToolParameter {
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly required: boolean;
  readonly defaultValue: unknown | null;
}
