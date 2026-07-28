import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { CoachExperienceService } from "../services";
import { CoachExperienceViewModel } from "../viewmodels";

export interface UseCoachConversationOptions {
  readonly service?: CoachExperienceService;
  readonly viewModel?: CoachExperienceViewModel;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to CoachExperienceViewModel conversation surface — no business logic.
 */
export function useCoachConversation({
  service,
  viewModel: injected,
  autoLoad = true,
}: UseCoachConversationOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);

  const viewModel = useMemo(
    () => injected ?? new CoachExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (autoLoad && !injected) {
      void viewModel.loadConversation();
    }
  }, [viewModel, autoLoad, injected]);

  const sendMessage = useCallback(
    (message: string) => viewModel.sendMessage(message),
    [viewModel],
  );
  const regenerateResponse = useCallback(
    (messageId: string) => viewModel.regenerateResponse(messageId),
    [viewModel],
  );
  const refresh = useCallback(() => viewModel.refresh(), [viewModel]);
  const loadConversation = useCallback(
    () => viewModel.loadConversation(),
    [viewModel],
  );
  const loadConversationHistory = useCallback(
    () => viewModel.loadConversationHistory(),
    [viewModel],
  );

  return {
    experience: viewModel.experience,
    conversation: viewModel.conversation,
    messages: viewModel.messages,
    memorySummary: viewModel.memorySummary,
    conversationHistory: viewModel.conversationHistory,
    loading: viewModel.loading,
    typing: viewModel.typing,
    streamingPrepared: viewModel.streamingPrepared,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    sendMessage,
    regenerateResponse,
    refresh,
    loadConversation,
    loadConversationHistory,
    viewModel,
  };
}
