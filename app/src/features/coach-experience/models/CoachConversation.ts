import type { CoachMessage } from "./CoachMessage";
import type { CoachConversationState } from "./CoachConversationState";

/** Immutable coach conversation aggregate — presentation read model. */
export interface CoachConversation {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly CoachMessage[];
  readonly state: CoachConversationState;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly isEmpty: boolean;
  /** Prepared future navigation destinations. */
  readonly historyDestination: string;
  readonly settingsDestination: string;
}

export function createCoachConversation(input: {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly CoachMessage[];
  readonly state: CoachConversationState;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly historyDestination?: string;
  readonly settingsDestination?: string;
}): CoachConversation {
  const messages = Object.freeze([...input.messages]);
  return Object.freeze({
    id: input.id,
    title: input.title,
    messages,
    state: input.state,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    isEmpty: messages.length === 0,
    historyDestination:
      input.historyDestination ?? "/(app)/coach/history",
    settingsDestination:
      input.settingsDestination ?? "/(app)/coach/settings",
  });
}
