import type { ConversationIntent } from "../models/ConversationIntent";

export function formatCountPhrase(count: number, noun: string): string {
  const plural = count === 1 ? noun : `${noun}s`;
  return `${count} ${plural}`;
}

export function formatIntentLabel(intent: ConversationIntent): string {
  return intent.replace(/_/g, " ");
}
