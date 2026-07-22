/**
 * Reserved slot for a future AI Provider response.
 * Empty orchestration placeholder — never filled by this domain.
 */
export interface ConversationResponsePlaceholder {
  readonly id: string;
  readonly contextId: string;
  readonly status: "reserved";
  readonly provider: null;
  readonly content: null;
  readonly reservedAt: string;
}
