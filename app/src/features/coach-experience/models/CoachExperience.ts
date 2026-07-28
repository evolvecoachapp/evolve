import type { CoachConversation } from "./CoachConversation";
import type { CoachInsight } from "./CoachInsight";
import type { CoachMemorySummary } from "./CoachMemorySummary";
import type { CoachQuickAction } from "./CoachQuickAction";
import type { CoachRecommendation } from "./CoachRecommendation";

/** Immutable conversation history list item — presentation only. */
export interface CoachConversationHistoryItem {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly updatedAt: string;
  readonly messageCount: number;
  readonly destination: string;
}

export function createCoachConversationHistoryItem(input: {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly updatedAt: string;
  readonly messageCount?: number;
  readonly destination?: string;
}): CoachConversationHistoryItem {
  return Object.freeze({
    id: input.id,
    title: input.title,
    preview: input.preview,
    updatedAt: input.updatedAt,
    messageCount: input.messageCount ?? 0,
    destination:
      input.destination ?? `/(app)/coach/history/${input.id}`,
  });
}

/** Immutable Coach Experience aggregate — presentation read model. */
export interface CoachExperience {
  readonly conversation: CoachConversation;
  readonly dailyInsight: CoachInsight | null;
  readonly pinnedInsight: CoachInsight | null;
  readonly recommendations: readonly CoachRecommendation[];
  readonly quickActions: readonly CoachQuickAction[];
  readonly memorySummary: CoachMemorySummary | null;
  readonly conversationHistory: readonly CoachConversationHistoryItem[];
  readonly isEmpty: boolean;
}

export function createCoachExperience(input: {
  readonly conversation: CoachConversation;
  readonly dailyInsight?: CoachInsight | null;
  readonly pinnedInsight?: CoachInsight | null;
  readonly recommendations?: readonly CoachRecommendation[];
  readonly quickActions?: readonly CoachQuickAction[];
  readonly memorySummary?: CoachMemorySummary | null;
  readonly conversationHistory?: readonly CoachConversationHistoryItem[];
}): CoachExperience {
  const recommendations = Object.freeze([...(input.recommendations ?? [])]);
  const quickActions = Object.freeze([...(input.quickActions ?? [])]);
  const conversationHistory = Object.freeze([
    ...(input.conversationHistory ?? []),
  ]);
  const dailyInsight = input.dailyInsight ?? null;
  const pinnedInsight = input.pinnedInsight ?? null;
  const memorySummary = input.memorySummary ?? null;

  const isEmpty =
    input.conversation.isEmpty &&
    dailyInsight === null &&
    pinnedInsight === null &&
    recommendations.length === 0 &&
    quickActions.length === 0 &&
    memorySummary === null;

  return Object.freeze({
    conversation: input.conversation,
    dailyInsight,
    pinnedInsight,
    recommendations,
    quickActions,
    memorySummary,
    conversationHistory,
    isEmpty,
  });
}
