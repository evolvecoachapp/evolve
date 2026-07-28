import type {
  CoachConversationHistoryDto,
  CoachExperienceDto,
  CoachInsightDto,
  CoachMessageDto,
  CoachQuickActionDto,
  CoachRecommendationDto,
  CoachSendMessageResultDto,
} from "./coachExperienceDto";

export type CoachExperienceProviderId = "mock" | "backend" | "local";

/** Contract for Coach Experience backends — UI depends on this only. */
export interface CoachExperienceService {
  readonly providerId: CoachExperienceProviderId;

  getExperience(): Promise<CoachExperienceDto>;

  sendMessage(input: {
    readonly conversationId: string;
    readonly message: string;
  }): Promise<CoachSendMessageResultDto>;

  regenerateResponse(input: {
    readonly conversationId: string;
    readonly messageId: string;
  }): Promise<CoachMessageDto>;

  pinInsight(insightId: string): Promise<CoachInsightDto>;

  dismissInsight(insightId: string): Promise<void>;

  getConversationHistory(): Promise<readonly CoachConversationHistoryDto[]>;

  getDailyInsight(): Promise<CoachInsightDto | null>;

  getRecommendations(): Promise<readonly CoachRecommendationDto[]>;

  getQuickActions(): Promise<readonly CoachQuickActionDto[]>;
}

export class CoachExperienceError extends Error {
  constructor(
    message: string,
    readonly providerId?: CoachExperienceProviderId,
  ) {
    super(message);
    this.name = "CoachExperienceError";
  }
}
