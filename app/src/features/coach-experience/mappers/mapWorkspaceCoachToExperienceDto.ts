import type { MemoryEntry } from "../../conversation-memory/models/MemoryEntry";
import type { Workspace } from "../../unified-workspace/models/Workspace";
import type { WorkspaceCoach } from "../../unified-workspace/models/WorkspaceCoach";
import type {
  CoachConversationHistoryDto,
  CoachExperienceDto,
  CoachInsightDto,
  CoachMessageDto,
  CoachMemorySummaryDto,
  CoachQuickActionDto,
  CoachRecommendationDto,
} from "../types/coachExperienceDto";

function buildConversationId(athleteId: string): string {
  return `conversation:${athleteId}`;
}

function buildInitialCoachMessage(
  coach: WorkspaceCoach,
  fallbackCreatedAt: string,
): CoachMessageDto | null {
  const content =
    coach.recommendation?.trim() ||
    coach.expectedOutcome?.trim() ||
    "";
  if (!coach.present || content.length === 0) {
    return null;
  }

  return Object.freeze({
    id: `msg:seed:${coach.sessionId ?? "initial"}`,
    role: "coach",
    content,
    createdAt: coach.session?.timestamp ?? fallbackCreatedAt,
    citations: Object.freeze(coach.evidence?.sources ?? []),
  });
}

function buildDailyInsight(
  coach: WorkspaceCoach,
  dismissedInsightIds: ReadonlySet<string>,
): CoachInsightDto | null {
  if (!coach.present || !coach.session?.insightSummary.present) {
    return null;
  }

  const insightId = `insight:daily:${coach.sessionId ?? coach.athleteId}`;
  if (dismissedInsightIds.has(insightId)) {
    return null;
  }

  return Object.freeze({
    id: insightId,
    kind: "daily",
    title: coach.session.insightSummary.titles[0] ?? "Daily insight",
    body: coach.session.insightSummary.summary,
    severity: "info",
    pinned: false,
    createdAt: coach.session.timestamp,
  });
}

function buildRecommendations(
  workspace: Workspace,
): readonly CoachRecommendationDto[] {
  const coach = workspace.coach;
  const recommendations: CoachRecommendationDto[] = [];

  if (coach.present && coach.recommendation) {
    recommendations.push(
      Object.freeze({
        id: `rec:today:${coach.sessionId ?? coach.athleteId}`,
        domain: "today",
        title:
          coach.session?.recommendationSummary.titles[0] ?? "Today's focus",
        body: coach.recommendation,
        actionLabel: "Ask Coach",
        destination: "/(app)/(tabs)/coach",
        priority: 1,
        confidence: coach.confidence ?? undefined,
      }),
    );
  }

  if (workspace.workout.present) {
    recommendations.push(
      Object.freeze({
        id: `rec:workout:${workspace.athleteId}`,
        domain: "workout",
        title: "Workout recommendation",
        body:
          workspace.workout.summary?.trim() ||
          "Review today's workout plan with Coach.",
        actionLabel: "Open workout",
        destination: "/(app)/(tabs)/workout",
        priority: 2,
      }),
    );
  }

  if (workspace.recovery.present) {
    recommendations.push(
      Object.freeze({
        id: `rec:recovery:${workspace.athleteId}`,
        domain: "recovery",
        title: "Recovery recommendation",
        body:
          workspace.recovery.summary?.trim() ||
          "Check recovery signals before training.",
        actionLabel: "View recovery",
        destination: "/(app)/(tabs)/progress",
        priority: 3,
      }),
    );
  }

  if (workspace.nutrition.present) {
    recommendations.push(
      Object.freeze({
        id: `rec:nutrition:${workspace.athleteId}`,
        domain: "nutrition",
        title: "Nutrition recommendation",
        body:
          workspace.nutrition.summary?.trim() ||
          "Align nutrition with today's training load.",
        actionLabel: "Open nutrition",
        destination: "/(app)/(tabs)/nutrition",
        priority: 4,
      }),
    );
  }

  return Object.freeze(recommendations);
}

function buildQuickActions(workspace: Workspace): readonly CoachQuickActionDto[] {
  const actions: CoachQuickActionDto[] = [];

  if (workspace.workout.present) {
    actions.push(
      Object.freeze({
        id: "qa-explain",
        kind: "explain_today_workout",
        label: "Explain today's workout",
        prompt: "Explain today's workout and why it was prescribed.",
        icon: "barbell-outline",
        enabled: true,
        reason: "Workout plan available",
      }),
    );
    actions.push(
      Object.freeze({
        id: "qa-volume",
        kind: "reduce_today_volume",
        label: "Reduce today's volume",
        prompt: "Reduce today's training volume while keeping the session productive.",
        icon: "remove-circle-outline",
        enabled: true,
        reason: "Volume can be adapted",
      }),
    );
  }

  if (workspace.nutrition.present) {
    actions.push(
      Object.freeze({
        id: "qa-calories",
        kind: "adjust_calories",
        label: "Adjust calories",
        prompt: "Adjust today's calorie target based on training load.",
        icon: "flame-outline",
        enabled: true,
        reason: "Nutrition plan available",
      }),
    );
  }

  if (workspace.goals.present) {
    actions.push(
      Object.freeze({
        id: "qa-progress",
        kind: "show_weekly_progress",
        label: "Show weekly progress",
        prompt: "Show my weekly progress summary.",
        icon: "stats-chart-outline",
        enabled: true,
        reason: "Goal progress available",
      }),
    );
  }

  if (workspace.recovery.present) {
    actions.push(
      Object.freeze({
        id: "qa-recovery",
        kind: "recovery_analysis",
        label: "Recovery analysis",
        prompt: "Give me a recovery analysis for today.",
        icon: "heart-outline",
        enabled: true,
        reason: "Recovery snapshot available",
      }),
    );
  }

  actions.push(
    Object.freeze({
      id: "qa-motivation",
      kind: "generate_motivation",
      label: "Generate motivation",
      prompt: "Give me a short motivational message for today's session.",
      icon: "sparkles-outline",
      enabled: true,
      reason: "Always available",
    }),
  );

  if (workspace.workout.present) {
    actions.push(
      Object.freeze({
        id: "qa-modify",
        kind: "modify_next_workout",
        label: "Modify next workout",
        prompt: "Suggest a modification for my next workout.",
        icon: "create-outline",
        enabled: true,
        reason: "Next workout available",
      }),
    );
  }

  return Object.freeze(actions);
}

function buildMemorySummary(
  entries: readonly MemoryEntry[],
  athleteId: string,
  lastUpdatedAt: string | null,
): CoachMemorySummaryDto | null {
  const scoped = entries.filter((entry) => entry.athleteId === athleteId);
  if (scoped.length === 0) {
    return null;
  }

  const focusAreas = Object.freeze(
    scoped
      .map((entry) => entry.summary ?? entry.key)
      .filter((value) => value.length > 0)
      .slice(0, 5),
  );

  return Object.freeze({
    id: `memory:${athleteId}`,
    headline: "What Coach remembers",
    summary: focusAreas.join(" · ") || "Recent coaching context is available.",
    focusAreas,
    lastUpdatedAt: lastUpdatedAt ?? scoped[scoped.length - 1]?.createdAt ?? "",
    entryCount: scoped.length,
  });
}

function buildConversationHistory(
  workspace: Workspace,
  conversationId: string,
  messageCount: number,
  updatedAt: string,
): readonly CoachConversationHistoryDto[] {
  if (!workspace.coach.present) {
    return Object.freeze([]);
  }

  const preview =
    workspace.coach.recommendation?.slice(0, 80) ||
    workspace.timeline.latestEvents[0]?.summary?.slice(0, 80) ||
    "Coaching session";

  return Object.freeze([
    Object.freeze({
      id: conversationId,
      title: "Today's Coaching",
      preview,
      updatedAt,
      messageCount,
    }),
  ]);
}

export interface MapWorkspaceCoachToExperienceDtoInput {
  readonly workspace: Workspace;
  readonly sessionMessages?: readonly CoachMessageDto[];
  readonly sessionId?: string | null;
  readonly memoryEntries?: readonly MemoryEntry[];
  readonly pinnedInsightId?: string | null;
  readonly dismissedInsightIds?: readonly string[];
}

/** Maps hydrated Unified Workspace coach projection into the Coach Experience DTO. */
export function mapWorkspaceCoachToExperienceDto(
  input: MapWorkspaceCoachToExperienceDtoInput,
): CoachExperienceDto {
  const { workspace } = input;
  const coach = workspace.coach;
  const conversationId = buildConversationId(workspace.athleteId);
  const dismissedInsightIds = new Set(input.dismissedInsightIds ?? []);
  const generatedAt = workspace.metadata.generatedAt;
  const seedMessage = buildInitialCoachMessage(coach, generatedAt);
  const providedMessages = Object.freeze([...(input.sessionMessages ?? [])]);
  const messages =
    providedMessages.length > 0
      ? providedMessages
      : seedMessage
        ? Object.freeze([seedMessage])
        : Object.freeze([]);

  const updatedAt =
    messages.length > 0
      ? messages[messages.length - 1]?.createdAt ?? generatedAt
      : generatedAt;

  const dailyInsight = buildDailyInsight(coach, dismissedInsightIds);
  const pinnedInsight =
    input.pinnedInsightId && dailyInsight?.id === input.pinnedInsightId
      ? Object.freeze({ ...dailyInsight, pinned: true, kind: "pinned" as const })
      : null;

  const memorySummary = buildMemorySummary(
    input.memoryEntries ?? Object.freeze([]),
    workspace.athleteId,
    updatedAt,
  );

  const conversation = Object.freeze({
    id: conversationId,
    title: "Today's Coaching",
    messages,
    createdAt: coach.session?.timestamp ?? generatedAt,
    updatedAt,
    empty: messages.length === 0,
  });

  const isEmpty =
    !coach.present &&
    messages.length === 0 &&
    dailyInsight === null &&
    pinnedInsight === null;

  return Object.freeze({
    conversation,
    dailyInsight: pinnedInsight ? null : dailyInsight,
    pinnedInsight,
    recommendations: buildRecommendations(workspace),
    quickActions: buildQuickActions(workspace),
    memorySummary,
    conversationHistory: buildConversationHistory(
      workspace,
      conversationId,
      messages.length,
      updatedAt,
    ),
    empty: isEmpty,
  });
}
