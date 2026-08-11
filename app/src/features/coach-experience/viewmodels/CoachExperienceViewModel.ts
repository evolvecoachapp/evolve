import {
  dismissCoachInsight,
  loadCoachConversation,
  loadConversationHistory,
  loadDailyInsight,
  loadHydratedCoachExperience,
  loadQuickActions,
  loadRecommendations,
  pinCoachInsight,
  refreshCoachExperience,
  regenerateCoachResponse,
  regenerateRuntimeCoachResponse,
  sendCoachMessage,
  sendRuntimeCoachMessage,
} from "../application";
import type { CoachConversationHistoryItem } from "../models/CoachExperience";
import type { CoachExperience } from "../models/CoachExperience";
import {
  createCoachErrorState,
  type CoachErrorState,
} from "../models/CoachErrorState";
import type { CoachInsight } from "../models/CoachInsight";
import {
  createCoachLoadingState,
  CoachLoadingStatuses,
  type CoachLoadingState,
} from "../models/CoachLoadingState";
import type { CoachQuickAction } from "../models/CoachQuickAction";
import type { CoachRecommendation } from "../models/CoachRecommendation";
import {
  createCoachTypingState,
  CoachTypingStatuses,
  type CoachTypingState,
} from "../models/CoachTypingState";
import { rebuildCoachExperience } from "../mappers";
import type { CoachMessageDto } from "../types/coachExperienceDto";
import { CoachRuntimeError } from "../application/sendRuntimeCoachMessage";
import { persistCoachRuntimeMutation } from "../../../runtime/domain-persistence/application/persistCoachRuntimeMutation";
import { readPersistedCoachRuntimeOverlay } from "../../../runtime/domain-persistence/application/persistCoachRuntimeMutation";
import {
  CoachExperienceError,
  type CoachExperienceService,
} from "../services";

export interface CoachExperienceViewModelDeps {
  readonly service?: CoachExperienceService;
  readonly athleteId?: string;
  readonly now?: () => Date;
}

/**
 * Coach Experience ViewModel — application orchestration only.
 * Production path applies hydrated Unified Workspace via applyHydratedCoachExperience().
 */
export class CoachExperienceViewModel {
  private readonly service: CoachExperienceService | null;
  private readonly athleteId: string | null;
  private readonly now: () => Date;
  private readonly listeners = new Set<() => void>();

  private _experience: CoachExperience | null = null;
  private _loading: CoachLoadingState;
  private _typing: CoachTypingState = createCoachTypingState(
    CoachTypingStatuses.IDLE,
  );
  private _error: CoachErrorState | null = null;
  private _streamingPrepared = false;
  private _sessionId: string | null = null;
  private _sessionMessages: readonly CoachMessageDto[] = Object.freeze([]);
  private _pinnedInsightId: string | null = null;
  private readonly _dismissedInsightIds = new Set<string>();

  constructor(deps: CoachExperienceViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this.now = deps.now ?? (() => new Date());
    this._loading = createCoachLoadingState(
      this.service
        ? CoachLoadingStatuses.IDLE
        : CoachLoadingStatuses.LOADING,
    );
  }

  /** True when the ViewModel is driven by hydrated workspace instead of CoachExperienceService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
  }

  get experience(): CoachExperience | null {
    return this._experience;
  }

  get conversation() {
    return this._experience?.conversation ?? null;
  }

  get messages() {
    return this._experience?.conversation.messages ?? Object.freeze([]);
  }

  get dailyInsight(): CoachInsight | null {
    return this._experience?.dailyInsight ?? null;
  }

  get pinnedInsight(): CoachInsight | null {
    return this._experience?.pinnedInsight ?? null;
  }

  get recommendations(): readonly CoachRecommendation[] {
    return this._experience?.recommendations ?? Object.freeze([]);
  }

  get quickActions(): readonly CoachQuickAction[] {
    return this._experience?.quickActions ?? Object.freeze([]);
  }

  get memorySummary() {
    return this._experience?.memorySummary ?? null;
  }

  get conversationHistory(): readonly CoachConversationHistoryItem[] {
    return this._experience?.conversationHistory ?? Object.freeze([]);
  }

  get loading(): CoachLoadingState {
    return this._loading;
  }

  get typing(): CoachTypingState {
    return this._typing;
  }

  /** Streaming indicator prepared for future providers — not live yet. */
  get streamingPrepared(): boolean {
    return this._streamingPrepared;
  }

  get error(): CoachErrorState | null {
    return this._error;
  }

  get isEmpty(): boolean {
    return this._experience?.isEmpty === true;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async loadConversation(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createCoachLoadingState(CoachLoadingStatuses.LOADING);
    this._error = null;
    this.notify();

    try {
      this._experience = await loadCoachConversation({
        service: this.service,
      });
      this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
      this._error = null;
    } catch (caught: unknown) {
      this._experience = null;
      this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  /** Applies Coach Experience projected from hydrated Unified Workspace output. */
  applyHydratedCoachExperience(experience: CoachExperience): void {
    this._experience = experience;
    this._sessionMessages = Object.freeze(
      experience.conversation.messages.map((message) =>
        Object.freeze({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
          citations:
            message.citations.length > 0 ? message.citations : undefined,
        }),
      ),
    );
    if (this.isRuntimeDriven && this.athleteId) {
      this._sessionId =
        readPersistedCoachRuntimeOverlay(this.athleteId)?.sessionId ??
        this._sessionId;
    }
    this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies hydrated workspace output (runtime production refresh path). */
  async refreshFromHydratedCoachExperience(
    experience: CoachExperience | null,
  ): Promise<void> {
    this._loading = createCoachLoadingState(CoachLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (experience) {
      this.applyHydratedCoachExperience(experience);
      return;
    }

    this._experience = null;
    this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
    this._error = createCoachErrorState(
      "Coach runtime unavailable.",
      "coach_runtime_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable hydrated coach output to the Coach UI. */
  applyCoachFailure(message: string): void {
    this._experience = null;
    this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
    this._error = createCoachErrorState(message, "coach_runtime_unavailable");
    this.notify();
  }

  async loadDailyInsight(): Promise<void> {
    if (!this._experience) {
      return;
    }

    if (!this.service) {
      await this.reloadHydratedExperience();
      return;
    }

    try {
      const dailyInsight = await loadDailyInsight({ service: this.service });
      this._experience = rebuildCoachExperience(this._experience, {
        dailyInsight,
      });
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async sendMessage(message: string): Promise<void> {
    if (!this._experience) {
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    this._loading = createCoachLoadingState(CoachLoadingStatuses.SENDING);
    this._typing = createCoachTypingState(CoachTypingStatuses.TYPING);
    this._streamingPrepared = true;
    this._error = null;
    this.notify();

    try {
      if (this.service) {
        this._experience = await sendCoachMessage({
          service: this.service,
          experience: this._experience,
          message: trimmed,
        });
      } else if (this.athleteId) {
        const createdAt = this.now().toISOString();
        const turn = sendRuntimeCoachMessage({
          athleteId: this.athleteId,
          conversationId: this._experience.conversation.id,
          message: trimmed,
          sessionId: this._sessionId,
          createdAt,
        });
        this._sessionId = turn.sessionId;
        this._sessionMessages = Object.freeze([
          ...this._sessionMessages,
          turn.userMessage,
          turn.coachMessage,
        ]);
        const hydrated = await loadHydratedCoachExperience({
          athleteId: this.athleteId,
          sessionMessages: this._sessionMessages,
          sessionId: this._sessionId,
          pinnedInsightId: this._pinnedInsightId,
          dismissedInsightIds: [...this._dismissedInsightIds],
        });
        if (!hydrated) {
          throw new CoachRuntimeError("Coach runtime unavailable.");
        }
        this._experience = hydrated;
        this.persistIfRuntimeDriven("sendMessage");
      } else {
        throw new CoachRuntimeError("Coach runtime unavailable.");
      }

      this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
      this._typing = createCoachTypingState(CoachTypingStatuses.IDLE);
      this._error = null;
    } catch (caught: unknown) {
      this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
      this._typing = createCoachTypingState(CoachTypingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async regenerateResponse(messageId: string): Promise<void> {
    if (!this._experience) {
      return;
    }

    this._typing = createCoachTypingState(CoachTypingStatuses.TYPING);
    this._streamingPrepared = true;
    this.notify();

    try {
      if (this.service) {
        this._experience = await regenerateCoachResponse({
          service: this.service,
          experience: this._experience,
          messageId,
        });
      } else if (this.athleteId) {
        const createdAt = this.now().toISOString();
        const turn = regenerateRuntimeCoachResponse({
          experience: this._experience,
          athleteId: this.athleteId,
          messageId,
          sessionId: this._sessionId,
          createdAt,
        });
        this._sessionId = turn.sessionId;
        this._sessionMessages = turn.messages;
        const hydrated = await loadHydratedCoachExperience({
          athleteId: this.athleteId,
          sessionMessages: this._sessionMessages,
          sessionId: this._sessionId,
          pinnedInsightId: this._pinnedInsightId,
          dismissedInsightIds: [...this._dismissedInsightIds],
        });
        if (!hydrated) {
          throw new CoachRuntimeError("Coach runtime unavailable.");
        }
        this._experience = hydrated;
        this.persistIfRuntimeDriven("regenerate");
      } else {
        throw new CoachRuntimeError("Coach runtime unavailable.");
      }

      this._typing = createCoachTypingState(CoachTypingStatuses.IDLE);
      this._error = null;
    } catch (caught: unknown) {
      this._typing = createCoachTypingState(CoachTypingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async suggestActions(): Promise<void> {
    if (!this._experience) {
      return;
    }

    if (!this.service) {
      await this.reloadHydratedExperience();
      return;
    }

    try {
      const quickActions = await loadQuickActions({ service: this.service });
      this._experience = rebuildCoachExperience(this._experience, {
        quickActions,
      });
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async loadConversationHistory(): Promise<void> {
    if (!this._experience) {
      return;
    }

    if (!this.service) {
      await this.reloadHydratedExperience();
      return;
    }

    try {
      const conversationHistory = await loadConversationHistory({
        service: this.service,
      });
      this._experience = rebuildCoachExperience(this._experience, {
        conversationHistory,
      });
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async pinInsight(insightId: string): Promise<void> {
    if (!this._experience) {
      return;
    }

    if (!this.service) {
      this._pinnedInsightId = insightId;
      await this.reloadHydratedExperience();
      return;
    }

    try {
      this._experience = await pinCoachInsight({
        service: this.service,
        experience: this._experience,
        insightId,
      });
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async dismissInsight(insightId: string): Promise<void> {
    if (!this._experience) {
      return;
    }

    if (!this.service) {
      this._dismissedInsightIds.add(insightId);
      if (this._pinnedInsightId === insightId) {
        this._pinnedInsightId = null;
      }
      await this.reloadHydratedExperience();
      return;
    }

    try {
      this._experience = await dismissCoachInsight({
        service: this.service,
        experience: this._experience,
        insightId,
      });
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async refresh(): Promise<void> {
    if (!this.service) {
      if (!this.athleteId) {
        this.applyCoachFailure("Coach runtime unavailable.");
        return;
      }

      const experience = await loadHydratedCoachExperience({
        athleteId: this.athleteId,
        sessionMessages: this._sessionMessages,
        sessionId: this._sessionId,
        pinnedInsightId: this._pinnedInsightId,
        dismissedInsightIds: [...this._dismissedInsightIds],
      });
      await this.refreshFromHydratedCoachExperience(experience);
      return;
    }

    this._loading = createCoachLoadingState(CoachLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    try {
      this._experience = await refreshCoachExperience({
        service: this.service,
      });
      this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
      this._error = null;
    } catch (caught: unknown) {
      this._loading = createCoachLoadingState(CoachLoadingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async loadRecommendations(): Promise<void> {
    if (!this._experience) {
      return;
    }

    if (!this.service) {
      await this.reloadHydratedExperience();
      return;
    }

    try {
      const recommendations = await loadRecommendations({
        service: this.service,
      });
      this._experience = rebuildCoachExperience(this._experience, {
        recommendations,
      });
      this._error = null;
    } catch (caught: unknown) {
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  private async reloadHydratedExperience(): Promise<void> {
    if (!this.athleteId) {
      this.applyCoachFailure("Coach runtime unavailable.");
      return;
    }

    const experience = await loadHydratedCoachExperience({
      athleteId: this.athleteId,
      sessionMessages: this._sessionMessages,
      sessionId: this._sessionId,
      pinnedInsightId: this._pinnedInsightId,
      dismissedInsightIds: [...this._dismissedInsightIds],
    });

    if (!experience) {
      this.applyCoachFailure("Coach runtime unavailable.");
      return;
    }

    this.applyHydratedCoachExperience(experience);
  }

  private toErrorState(caught: unknown): CoachErrorState {
    if (caught instanceof CoachExperienceError) {
      return createCoachErrorState(
        caught.message,
        "coach_experience_service_error",
        true,
      );
    }
    if (caught instanceof CoachRuntimeError) {
      return createCoachErrorState(caught.message, "coach_runtime_error", true);
    }
    if (caught instanceof Error) {
      return createCoachErrorState(caught.message);
    }
    return createCoachErrorState("Failed to load Coach experience.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private persistIfRuntimeDriven(kind: string): void {
    if (!this.isRuntimeDriven || !this.athleteId) {
      return;
    }

    persistCoachRuntimeMutation({
      athleteId: this.athleteId,
      requestId: `coach:runtime:${kind}:${this.athleteId}:${this.now().getTime()}`,
      sessionMessages: this._sessionMessages,
      sessionId: this._sessionId,
    });
  }
}
