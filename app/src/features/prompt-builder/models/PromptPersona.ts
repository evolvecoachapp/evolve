export interface PromptPersona {
  readonly id: string;
  readonly role: string;
  readonly audience: string;
  readonly style: string;
  readonly statement: string;
  readonly refs: readonly string[];
}
