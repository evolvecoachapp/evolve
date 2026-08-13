import * as SecureStore from "expo-secure-store";

/**
 * Persists the backend Coach conversation UUID across app restarts using the
 * same expo-secure-store mechanism as auth tokens. This is not a second auth
 * path — only a conversation-id key.
 */
const CONVERSATION_ID_KEY = "evolve.coach.conversation_id";

export async function persistBackendCoachConversationId(
  conversationId: string,
): Promise<void> {
  await SecureStore.setItemAsync(CONVERSATION_ID_KEY, conversationId);
}

export async function loadBackendCoachConversationId(): Promise<string | null> {
  return SecureStore.getItemAsync(CONVERSATION_ID_KEY);
}

export async function clearBackendCoachConversationId(): Promise<void> {
  await SecureStore.deleteItemAsync(CONVERSATION_ID_KEY);
}
