export interface PromptToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly parameterSchema: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly enabled: boolean;
}
