import {
  dismissCoachInsight,
  loadCoachConversation,
  loadConversationHistory,
  loadDailyInsight,
  loadQuickActions,
  loadRecommendations,
  pinCoachInsight,
  refreshCoachExperience,
  regenerateCoachResponse,
  sendCoachMessage,
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
import {
  coachExperienceService,
  CoachExperienceError,
  type CoachExperienceService,
} from "../services";

export interface CoachExperienceViewModelDeps {
  readonly service?: CoachExperienceService;
}

/**
 * Coach Experience ViewModel — application orchestration only.
 * No UI code. Streaming state is prepared for future live providers.
 */
export class CoachExperienceViewModel {
  private readonly service: CoachExperienceService;
  private readonly listeners = new Set<() => void>();

  private _experience: CoachExperience | null = null;
  private _loading: CoachLoadingState = createCoachLoadingState(
    CoachLoadingStatuses.IDLE,
  );
  private _typing: CoachTypingState = createCoachTypingState(
    CoachTypingStatuses.IDLE,
  );
  private _error: CoachErrorState | null = null;
  private _streamingPrepared = false;

  constructor(deps: CoachExperienceViewModelDeps = {}) {
    this.service = deps.service ?? coachExperienceService;
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

  async loadDailyInsight(): Promise<void> {
    if (!this._experience) {
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
      this._experience = await sendCoachMessage({
        service: this.service,
        experience: this._experience,
        message: trimmed,
      });
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
      this._experience = await regenerateCoachResponse({
        service: this.service,
        experience: this._experience,
        messageId,
      });
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

  private toErrorState(caught: unknown): CoachErrorState {
    if (caught instanceof CoachExperienceError) {
      return createCoachErrorState(
        caught.message,
        "coach_experience_service_error",
        true,
      );
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
}
