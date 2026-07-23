export interface PromptComposition {
  readonly id: string;
  readonly packageId: string;
  readonly blockIds: readonly string[];
  readonly sectionIds: readonly string[];
  readonly templateIds: readonly string[];
  readonly composerName: string;
  readonly composedAt: string;
}
