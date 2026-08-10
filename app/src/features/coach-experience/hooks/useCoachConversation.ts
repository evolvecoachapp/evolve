import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { loadHydratedCoachExperience } from "../application/loadHydratedCoachExperience";
import type { CoachExperienceService } from "../services";
import { CoachExperienceViewModel } from "../viewmodels";

export interface UseCoachConversationOptions {
  readonly service?: CoachExperienceService;
  readonly viewModel?: CoachExperienceViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to CoachExperienceViewModel conversation surface — no business logic.
 * Production path applies hydrated workspace output via applyHydratedCoachExperience().
 * CoachExperienceService is test/preview-only when injected explicitly.
 */
export function useCoachConversation({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseCoachConversationOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () => injected ?? new CoachExperienceViewModel({ service, athleteId }),
    [injected, service, athleteId],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (!autoLoad || injected) {
      return;
    }

    if (!isRuntimePath) {
      void viewModel.loadConversation();
      return;
    }

    if (!athleteId) {
      return;
    }

    if (runtimeStatus !== RUNTIME_SESSION_STATUS.ready) {
      return;
    }

    let cancelled = false;

    void loadHydratedCoachExperience({ athleteId }).then((experience) => {
      if (cancelled) {
        return;
      }

      if (experience) {
        viewModel.applyHydratedCoachExperience(experience);
        return;
      }

      viewModel.applyCoachFailure("Coach runtime unavailable.");
    });

    return () => {
      cancelled = true;
    };
  }, [autoLoad, injected, viewModel, isRuntimePath, athleteKey, athleteId, runtimeStatus]);

  const sendMessage = useCallback(
    (message: string) => viewModel.sendMessage(message),
    [viewModel],
  );
  const regenerateResponse = useCallback(
    (messageId: string) => viewModel.regenerateResponse(messageId),
    [viewModel],
  );
  const refresh = useCallback(async () => {
    await viewModel.refresh();
  }, [viewModel]);
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
