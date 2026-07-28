import type {
  CoachConversationHistoryDto,
  CoachExperienceDto,
  CoachInsightDto,
  CoachMessageDto,
  CoachQuickActionDto,
  CoachRecommendationDto,
  CoachSendMessageResultDto,
} from "../types/coachExperienceDto";
import {
  CoachExperienceError,
  type CoachExperienceService,
} from "../types/coachExperienceService";

function notConfigured(): never {
  throw new CoachExperienceError(
    "backend provider is not configured. Wire the EVOLVE API before enabling this provider.",
    "backend",
  );
}

/** Placeholder for the EVOLVE backend — implement when API integration is available. */
export const backendCoachExperienceService: CoachExperienceService = {
  providerId: "backend",

  async getExperience(): Promise<CoachExperienceDto> {
    return notConfigured();
  },

  async sendMessage(): Promise<CoachSendMessageResultDto> {
    return notConfigured();
  },

  async regenerateResponse(): Promise<CoachMessageDto> {
    return notConfigured();
  },

  async pinInsight(): Promise<CoachInsightDto> {
    return notConfigured();
  },

  async dismissInsight(): Promise<void> {
    return notConfigured();
  },

  async getConversationHistory(): Promise<
    readonly CoachConversationHistoryDto[]
  > {
    return notConfigured();
  },

  async getDailyInsight(): Promise<CoachInsightDto | null> {
    return notConfigured();
  },

  async getRecommendations(): Promise<readonly CoachRecommendationDto[]> {
    return notConfigured();
  },

  async getQuickActions(): Promise<readonly CoachQuickActionDto[]> {
    return notConfigured();
  },
};
