export interface PromptSafety {
  readonly id: string;
  readonly codes: readonly string[];
  readonly constraintIds: readonly string[];
  readonly statement: string;
}
