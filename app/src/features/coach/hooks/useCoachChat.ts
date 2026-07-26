import { useCallback, useEffect, useRef, useState } from "react";
import type { CoachMessage } from "../types/coachMessage";
import { coachService, type CoachService } from "../services";
import { formatMessageTimestamp } from "../utils/presentationFormatters";

const TYPING_DELAY_MS = 1000;

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface UseCoachChatOptions {
  service?: CoachService;
  typingDelayMs?: number;
  /** When true and the active provider supports streaming, render partial coach replies. */
  enableStreaming?: boolean;
}

/**
 * @deprecated Sprint 23.2 — Prefer `useCoachConversation` with
 * `createCoachConversationRuntime()` (Composition Root Coaching Session).
 * Retained for compatibility; CoachScreen no longer uses this hook.
 */
export function useCoachChat({
  service = coachService,
  typingDelayMs = TYPING_DELAY_MS,
  enableStreaming = false,
}: UseCoachChatOptions = {}) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    void service.createConversation().then((conversation) => {
      if (cancelled) {
        return;
      }
      setConversationId(conversation.id);
      setMessages(conversation.messages);
      setIsLoadingConversation(false);
    });

    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [service]);

  const sendMessage = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isTyping || !conversationId || isLoadingConversation) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const userMessage: CoachMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      timestamp: formatMessageTimestamp(),
    };

    const historyWithUser = [...messages, userMessage];

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setIsTyping(true);

    await delay(typingDelayMs);
    if (requestIdRef.current !== requestId) {
      return;
    }

    const request = {
      conversationId,
      message: trimmed,
      history: historyWithUser,
    };

    const useStreaming = enableStreaming && typeof service.sendMessageStream === "function";

    if (useStreaming && service.sendMessageStream) {
      const placeholderId = createMessageId();
      const placeholder: CoachMessage = {
        id: placeholderId,
        role: "coach",
        content: "",
        timestamp: formatMessageTimestamp(),
      };

      setMessages((current) => [...current, placeholder]);
      setIsTyping(false);

      const response = await service.sendMessageStream(request, (chunk) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setMessages((current) =>
          current.map((entry) =>
            entry.id === placeholderId
              ? { ...entry, content: entry.content + chunk.delta }
              : entry,
          ),
        );
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      setMessages((current) =>
        current.map((entry) =>
          entry.id === placeholderId ? response.message : entry,
        ),
      );
      return;
    }

    const response = await service.sendMessage(request);
    if (requestIdRef.current !== requestId) {
      return;
    }

    setMessages((current) => [...current, response.message]);
    setIsTyping(false);
  }, [
    conversationId,
    enableStreaming,
    isLoadingConversation,
    isTyping,
    message,
    messages,
    service,
    typingDelayMs,
  ]);

  const canSend =
    message.trim().length > 0 && !isTyping && !isLoadingConversation && conversationId !== null;

  return {
    conversationId,
    messages,
    message,
    setMessage,
    sendMessage,
    isTyping,
    isLoadingConversation,
    canSend,
  };
}
