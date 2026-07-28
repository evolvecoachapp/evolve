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
    "local provider is not configured. Wire local Coach Intelligence adapters before enabling this provider.",
    "local",
  );
}

/**
 * Placeholder for on-device / Coach Intelligence–backed experience.
 * Future: Coach Intelligence → Memory → Context → Mock/OpenAI/Azure/Anthropic/Local LLM.
 */
export const localCoachExperienceService: CoachExperienceService = {
  providerId: "local",

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
