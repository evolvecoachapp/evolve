import { useCallback, useRef, useState } from "react";
import type { StreamingSession } from "../../ai/models/StreamingSession";
import { WellKnownCapabilityIds } from "../../agent-capability/models/CapabilityId";
import type { CoachingSessionService } from "../../coaching-session/services/CoachingSessionService";
import { EMPTY_SESSION_METADATA } from "../../coaching-session/models/SessionMetadata";
import {
  SessionRequestKinds,
  type SessionRequest,
} from "../../coaching-session/models/SessionRequest";
import type { PromptContext } from "../../prompt-builder/models/coach/PromptContext";
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
   * Optional Coaching Session Runtime from Composition Root.
   * When provided, conversation turns also execute the new coaching pipeline.
   */
  readonly coachingSession?: CoachingSessionService | null;
  /**
   * Prompt context used for AI generation on send/retry.
   * Required when calling sendMessage or retryMessage.
   */
  readonly promptContext?: PromptContext | null;
  /** Optional athlete id for session / supervisor invocations. */
  readonly athleteId?: string | null;
}

/**
 * Presentation adapter for the Conversation engine.
 *
 * Returns domain state and actions only — no UI formatting.
 * Optionally bridges into Coaching Session Runtime (Composition Root).
 */
export function useCoachConversation({
  service,
  coachingSession = null,
  promptContext = null,
  athleteId = null,
}: UseCoachConversationOptions) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [currentStream, setCurrentStream] = useState<StreamingSession | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const requestSeq = useRef(0);

  const syncStreamState = useCallback(() => {
    const next = service.getCurrentStream();
    setCurrentStream(next);
    setIsStreaming(
      next !== null &&
        (next.status === "starting" || next.status === "streaming"),
    );
  }, [service]);

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

  const invokeSession = useCallback(
    (input: {
      readonly kind:
        | typeof SessionRequestKinds.START
        | typeof SessionRequestKinds.CONTINUE
        | typeof SessionRequestKinds.END;
      readonly conversationId: string | null;
      readonly message: string;
    }) => {
      if (!coachingSession) return;
      requestSeq.current += 1;
      const request: SessionRequest = Object.freeze({
        id: `session-req:${requestSeq.current}`,
        kind: input.kind,
        sessionId: sessionIdRef.current,
        conversationId: input.conversationId,
        athleteId,
        message: input.message,
        intent: "coach_conversation",
        requiredCapabilityIds: Object.freeze([
          WellKnownCapabilityIds.GENERATE_WORKOUT,
          WellKnownCapabilityIds.EVALUATE_RECOVERY,
        ]),
        metadata: EMPTY_SESSION_METADATA,
        createdAt: new Date().toISOString(),
      });

      const result =
        input.kind === SessionRequestKinds.START
          ? coachingSession.startSession(request)
          : input.kind === SessionRequestKinds.CONTINUE
            ? coachingSession.continueSession(request)
            : coachingSession.endSession(request);

      if (result.success && result.sessionId) {
        sessionIdRef.current = result.sessionId;
      }
      if (input.kind === SessionRequestKinds.END && result.success) {
        sessionIdRef.current = null;
      }
    },
    [athleteId, coachingSession],
  );

  const run = useCallback(
    async (
      action: () => Promise<Conversation | void>,
      conversationIdForRefresh?: string,
      options: { readonly streaming?: boolean } = {},
    ): Promise<void> => {
      setLoading(true);
      setError(null);
      if (options.streaming) {
        setIsStreaming(true);
      }
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
        syncStreamState();
        setIsStreaming(false);
      }
    },
    [refreshConversation, syncStreamState],
  );

  const startConversation = useCallback(async () => {
    await run(async () => {
      const next = await startConversationUseCase(service);
      if (next) {
        invokeSession({
          kind: SessionRequestKinds.START,
          conversationId: next.id,
          message: "start coaching session",
        });
      }
      return next;
    });
  }, [invokeSession, run, service]);

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
        async () => {
          const next = await sendMessageUseCase(service, {
            conversationId,
            content,
            promptContext,
            onConversationUpdate: (updated) => {
              setConversation(updated);
              syncStreamState();
            },
          });
          invokeSession({
            kind: sessionIdRef.current
              ? SessionRequestKinds.CONTINUE
              : SessionRequestKinds.START,
            conversationId,
            message: content,
          });
          return next;
        },
        conversationId,
        { streaming: true },
      );
    },
    [
      conversation,
      invokeSession,
      promptContext,
      run,
      service,
      syncStreamState,
    ],
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
            onConversationUpdate: (next) => {
              setConversation(next);
              syncStreamState();
            },
          }),
        conversationId,
        { streaming: true },
      );
    },
    [conversation, promptContext, run, service, syncStreamState],
  );

  const cancelStream = useCallback(async () => {
    const next = await service.cancelStream();
    syncStreamState();
    if (next) {
      setConversation(next);
    }
  }, [service, syncStreamState]);

  const closeConversation = useCallback(async () => {
    if (!conversation) {
      setError("No active conversation.");
      return;
    }

    await run(async () => {
      invokeSession({
        kind: SessionRequestKinds.END,
        conversationId: conversation.id,
        message: "end coaching session",
      });
      return closeConversationUseCase(service, conversation.id);
    });
  }, [conversation, invokeSession, run, service]);

  const deleteConversation = useCallback(async () => {
    if (!conversation) {
      setError("No active conversation.");
      return;
    }

    const conversationId = conversation.id;
    await run(async () => {
      invokeSession({
        kind: SessionRequestKinds.END,
        conversationId,
        message: "end coaching session",
      });
      await deleteConversationUseCase(service, conversationId);
    });
  }, [conversation, invokeSession, run, service]);

  const restore = useCallback(async () => {
    setIsRestoring(true);
    setError(null);
    try {
      const restored = await service.restoreConversation(conversation?.id);
      setConversation(restored);
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Conversation restore failed.",
      );
    } finally {
      setIsRestoring(false);
      syncStreamState();
    }
  }, [conversation?.id, service, syncStreamState]);

  const clearHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await service.clearConversation(conversation?.id);
      setConversation(null);
      sessionIdRef.current = null;
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Conversation clear failed.",
      );
    } finally {
      setLoading(false);
      syncStreamState();
    }
  }, [conversation?.id, service, syncStreamState]);

  const messages: readonly ConversationMessage[] =
    conversation?.messages ?? Object.freeze([]);
  const status: ConversationStatus | null = conversation?.status ?? null;

  return {
    conversation,
    messages,
    status,
    loading,
    isStreaming,
    isRestoring,
    currentStream,
    error,
    startConversation,
    sendMessage,
    retryMessage,
    cancelStream,
    closeConversation,
    deleteConversation,
    restore,
    clearHistory,
  };
}
