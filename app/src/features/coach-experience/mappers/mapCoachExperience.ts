import {
  createCoachConversation,
  type CoachConversation,
} from "../models/CoachConversation";
import {
  createCoachConversationHistoryItem,
  createCoachExperience,
  type CoachConversationHistoryItem,
  type CoachExperience,
} from "../models/CoachExperience";
import {
  CoachConversationStatuses,
  createCoachConversationState,
} from "../models/CoachConversationState";
import {
  createCoachInsight,
  type CoachInsight,
} from "../models/CoachInsight";
import {
  createCoachMemorySummary,
  type CoachMemorySummary,
} from "../models/CoachMemorySummary";
import {
  CoachMessageRoles,
  CoachMessageStatuses,
  createCoachMessage,
  type CoachMessage,
} from "../models/CoachMessage";
import {
  createCoachQuickAction,
  type CoachQuickAction,
} from "../models/CoachQuickAction";
import {
  createCoachRecommendation,
  type CoachRecommendation,
} from "../models/CoachRecommendation";
import type {
  CoachConversationDto,
  CoachConversationHistoryDto,
  CoachExperienceDto,
  CoachInsightDto,
  CoachMemorySummaryDto,
  CoachMessageDto,
  CoachQuickActionDto,
  CoachRecommendationDto,
} from "../types/coachExperienceDto";

export function mapCoachMessage(dto: CoachMessageDto): CoachMessage {
  const role =
    dto.role === "user"
      ? CoachMessageRoles.USER
      : dto.role === "system"
        ? CoachMessageRoles.SYSTEM
        : CoachMessageRoles.COACH;

  return createCoachMessage({
    id: dto.id,
    role,
    content: dto.content,
    createdAt: dto.createdAt,
    status: CoachMessageStatuses.COMPLETE,
    markdownReady: true,
    citations: dto.citations ?? [],
  });
}

export function mapCoachConversation(
  dto: CoachConversationDto,
): CoachConversation {
  const messages = Object.freeze(dto.messages.map(mapCoachMessage));
  const empty = dto.empty === true || messages.length === 0;
  return createCoachConversation({
    id: dto.id,
    title: dto.title,
    messages,
    state: createCoachConversationState(
      empty
        ? CoachConversationStatuses.EMPTY
        : CoachConversationStatuses.READY,
    ),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  });
}

export function mapCoachInsight(dto: CoachInsightDto): CoachInsight {
  return createCoachInsight({
    id: dto.id,
    kind: dto.kind,
    title: dto.title,
    body: dto.body,
    severity: dto.severity,
    pinned: dto.pinned,
    dismissed: dto.dismissed,
    createdAt: dto.createdAt,
  });
}

export function mapCoachRecommendation(
  dto: CoachRecommendationDto,
): CoachRecommendation {
  return createCoachRecommendation({
    id: dto.id,
    domain: dto.domain,
    title: dto.title,
    body: dto.body,
    actionLabel: dto.actionLabel,
    destination: dto.destination,
    priority: dto.priority,
    confidence: dto.confidence,
  });
}

export function mapCoachQuickAction(
  dto: CoachQuickActionDto,
): CoachQuickAction {
  return createCoachQuickAction({
    id: dto.id,
    kind: dto.kind,
    label: dto.label,
    prompt: dto.prompt,
    icon: dto.icon,
    enabled: dto.enabled,
    reason: dto.reason,
  });
}

export function mapCoachMemorySummary(
  dto: CoachMemorySummaryDto,
): CoachMemorySummary {
  return createCoachMemorySummary({
    id: dto.id,
    headline: dto.headline,
    summary: dto.summary,
    focusAreas: dto.focusAreas,
    lastUpdatedAt: dto.lastUpdatedAt,
    entryCount: dto.entryCount,
  });
}

export function mapCoachConversationHistoryItem(
  dto: CoachConversationHistoryDto,
): CoachConversationHistoryItem {
  return createCoachConversationHistoryItem({
    id: dto.id,
    title: dto.title,
    preview: dto.preview,
    updatedAt: dto.updatedAt,
    messageCount: dto.messageCount,
  });
}

export function mapCoachExperience(dto: CoachExperienceDto): CoachExperience {
  const conversation = mapCoachConversation(dto.conversation);
  const dailyInsight = dto.dailyInsight
    ? mapCoachInsight(dto.dailyInsight)
    : null;
  const pinnedInsight = dto.pinnedInsight
    ? mapCoachInsight(dto.pinnedInsight)
    : null;
  const recommendations = Object.freeze(
    (dto.recommendations ?? []).map(mapCoachRecommendation),
  );
  const quickActions = Object.freeze(
    (dto.quickActions ?? []).map(mapCoachQuickAction),
  );
  const memorySummary = dto.memorySummary
    ? mapCoachMemorySummary(dto.memorySummary)
    : null;
  const conversationHistory = Object.freeze(
    (dto.conversationHistory ?? []).map(mapCoachConversationHistoryItem),
  );

  const experience = createCoachExperience({
    conversation,
    dailyInsight,
    pinnedInsight,
    recommendations,
    quickActions,
    memorySummary,
    conversationHistory,
  });

  if (dto.empty === true) {
    return createCoachExperience({
      conversation,
      dailyInsight: null,
      pinnedInsight: null,
      recommendations: [],
      quickActions: [],
      memorySummary: null,
      conversationHistory: [],
    });
  }

  return experience;
}

/** Rebuild experience after local conversation mutations. */
export function rebuildCoachExperience(
  current: CoachExperience,
  patch: Partial<{
    conversation: CoachConversation;
    dailyInsight: CoachInsight | null;
    pinnedInsight: CoachInsight | null;
    recommendations: readonly CoachRecommendation[];
    quickActions: readonly CoachQuickAction[];
    memorySummary: CoachMemorySummary | null;
    conversationHistory: readonly CoachConversationHistoryItem[];
  }>,
): CoachExperience {
  return createCoachExperience({
    conversation: patch.conversation ?? current.conversation,
    dailyInsight:
      patch.dailyInsight !== undefined
        ? patch.dailyInsight
        : current.dailyInsight,
    pinnedInsight:
      patch.pinnedInsight !== undefined
        ? patch.pinnedInsight
        : current.pinnedInsight,
    recommendations: patch.recommendations ?? current.recommendations,
    quickActions: patch.quickActions ?? current.quickActions,
    memorySummary:
      patch.memorySummary !== undefined
        ? patch.memorySummary
        : current.memorySummary,
    conversationHistory:
      patch.conversationHistory ?? current.conversationHistory,
  });
}
