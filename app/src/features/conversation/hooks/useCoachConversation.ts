import { useCallback, useState } from "react";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import {
  closeConversation as closeConversationUseCase,
  deleteConversation as deleteConversationUseCase,
  retryMessage as retryMessageUseCase,
  sendMessage as sendMessageUseCase,
  startConversation as startConversationUseCase,
} from "../application";
import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationStatus } from "../models/ConversationStatus";
import type { ConversationService } from "../services/ConversationService";

export interface UseCoachConversationOptions {
  /** Injected ConversationService — no singleton / global default. */
  readonly service: ConversationService;
  /**
   * Prompt context used for AI generation on send/retry.
   * Required when calling sendMessage or retryMessage.
   */
  readonly promptContext?: PromptContext | null;
}

/**
 * Presentation adapter for the Conversation engine.
 *
 * Returns domain state and actions only — no UI formatting.
 */
export function useCoachConversation({
  service,
  promptContext = null,
}: UseCoachConversationOptions) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      try {
        const latest = await service.getConversation(conversationId);
        setConversation(latest);
      } catch {
        // Keep prior local state when refresh fails.
      }
    },
    [service],
  );

  const run = useCallback(
    async (
      action: () => Promise<Conversation | void>,
      conversationIdForRefresh?: string,
    ): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const next = await action();
        if (next) {
          setConversation(next);
        } else {
          setConversation(null);
        }
      } catch (caughtError: unknown) {
        if (conversationIdForRefresh) {
          await refreshConversation(conversationIdForRefresh);
        }
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Conversation action failed.",
        );
      } finally {
        setLoading(false);
      }
    },
    [refreshConversation],
  );

  const startConversation = useCallback(async () => {
    await run(() => startConversationUseCase(service));
  }, [run, service]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversation) {
        setError("No active conversation.");
        return;
      }
      if (!promptContext) {
        setError("Prompt context is required to send a message.");
        return;
      }

      const conversationId = conversation.id;
      await run(
        () =>
          sendMessageUseCase(service, {
            conversationId,
            content,
            promptContext,
          }),
        conversationId,
      );
    },
    [conversation, promptContext, run, service],
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      if (!conversation) {
        setError("No active conversation.");
        return;
      }
      if (!promptContext) {
        setError("Prompt context is required to retry a message.");
        return;
      }

      const conversationId = conversation.id;
      await run(
        () =>
          retryMessageUseCase(service, {
            conversationId,
            messageId,
            promptContext,
          }),
        conversationId,
      );
    },
    [conversation, promptContext, run, service],
  );

  const closeConversation = useCallback(async () => {
    if (!conversation) {
      setError("No active conversation.");
      return;
    }

    await run(() => closeConversationUseCase(service, conversation.id));
  }, [conversation, run, service]);

  const deleteConversation = useCallback(async () => {
    if (!conversation) {
      setError("No active conversation.");
      return;
    }

    const conversationId = conversation.id;
    await run(async () => {
      await deleteConversationUseCase(service, conversationId);
    });
  }, [conversation, run, service]);

  const messages: readonly ConversationMessage[] =
    conversation?.messages ?? Object.freeze([]);
  const status: ConversationStatus | null = conversation?.status ?? null;

  return {
    conversation,
    messages,
    status,
    loading,
    error,
    startConversation,
    sendMessage,
    retryMessage,
    closeConversation,
    deleteConversation,
  };
}
