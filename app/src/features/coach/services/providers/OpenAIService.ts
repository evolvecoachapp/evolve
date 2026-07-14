import {
  CoachServiceError,
  type CoachConversation,
  type CoachSendMessageRequest,
  type CoachSendMessageResponse,
  type CoachService,
} from "../../types/coachService";

function notConfigured(): never {
  throw new CoachServiceError(
    "openai provider is not configured. Add API keys and wire the backend before enabling this provider.",
    "openai",
  );
}

/** Placeholder for OpenAI — implement when API keys and backend routing are available. */
export const openAIService: CoachService = {
  providerId: "openai",

  async createConversation(): Promise<CoachConversation> {
    return notConfigured();
  },

  async sendMessage(_request: CoachSendMessageRequest): Promise<CoachSendMessageResponse> {
    return notConfigured();
  },
};
