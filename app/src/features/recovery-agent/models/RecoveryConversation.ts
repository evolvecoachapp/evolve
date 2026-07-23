import type { RecoveryIntent } from "./RecoveryIntent";

export interface RecoveryConversation {
  readonly id: string;
  readonly conversationId: string | null;
  readonly turnCount: number;
  readonly lastUserMessage: string;
  readonly intent: RecoveryIntent;
  readonly summary: string | null;
}
