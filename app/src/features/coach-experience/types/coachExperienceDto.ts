/** Provider DTO — never rendered directly by UI. */
export interface CoachMessageDto {
  readonly id: string;
  readonly role: "user" | "coach" | "system";
  readonly content: string;
  readonly createdAt: string;
  readonly citations?: readonly string[];
}

export interface CoachConversationDto {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly CoachMessageDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly empty?: boolean;
}

export interface CoachInsightDto {
  readonly id: string;
  readonly kind: "daily" | "pinned" | "workout" | "recovery" | "nutrition" | "general";
  readonly title: string;
  readonly body: string;
  readonly severity?: "info" | "positive" | "caution" | "critical";
  readonly pinned?: boolean;
  readonly dismissed?: boolean;
  readonly createdAt: string;
}

export interface CoachRecommendationDto {
  readonly id: string;
  readonly domain: "workout" | "recovery" | "nutrition" | "today" | "general";
  readonly title: string;
  readonly body: string;
  readonly actionLabel?: string;
  readonly destination?: string;
  readonly priority?: number;
  readonly confidence?: number;
}

export interface CoachQuickActionDto {
  readonly id: string;
  readonly kind:
    | "explain_today_workout"
    | "reduce_today_volume"
    | "adjust_calories"
    | "show_weekly_progress"
    | "recovery_analysis"
    | "generate_motivation"
    | "modify_next_workout";
  readonly label: string;
  readonly prompt: string;
  readonly icon?: string;
  readonly enabled?: boolean;
  readonly reason?: string;
}

export interface CoachMemorySummaryDto {
  readonly id: string;
  readonly headline: string;
  readonly summary: string;
  readonly focusAreas?: readonly string[];
  readonly lastUpdatedAt: string;
  readonly entryCount?: number;
}

export interface CoachConversationHistoryDto {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly updatedAt: string;
  readonly messageCount?: number;
}

/** Aggregate provider DTO for the Coach Experience screen. */
export interface CoachExperienceDto {
  readonly conversation: CoachConversationDto;
  readonly dailyInsight?: CoachInsightDto | null;
  readonly pinnedInsight?: CoachInsightDto | null;
  readonly recommendations?: readonly CoachRecommendationDto[];
  readonly quickActions?: readonly CoachQuickActionDto[];
  readonly memorySummary?: CoachMemorySummaryDto | null;
  readonly conversationHistory?: readonly CoachConversationHistoryDto[];
  readonly empty?: boolean;
}

export interface CoachSendMessageResultDto {
  readonly conversationId: string;
  readonly userMessage: CoachMessageDto;
  readonly coachMessage: CoachMessageDto;
}
