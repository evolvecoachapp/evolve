/**
 * Immutable named argument for a planned action step.
 */
export interface ActionArgument {
  readonly name: string;
  readonly value: string | number | boolean | null;
  readonly required: boolean;
}
