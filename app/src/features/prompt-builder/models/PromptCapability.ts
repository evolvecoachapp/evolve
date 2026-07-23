export interface PromptCapability {
  readonly id: string;
  readonly codes: readonly string[];
  readonly statements: readonly string[];
  readonly refs: readonly string[];
}
