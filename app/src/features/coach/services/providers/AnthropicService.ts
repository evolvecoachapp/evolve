import {
  CoachServiceError,
  type CoachConversation,
  type CoachSendMessageRequest,
  type CoachSendMessageResponse,
  type CoachService,
} from "../../types/coachService";

function notConfigured(): never {
  throw new CoachServiceError(
    "anthropic provider is not configured. Add API keys and wire the backend before enabling this provider.",
    "anthropic",
  );
}

/** Placeholder for Anthropic — implement when API keys and backend routing are available. */
export const anthropicService: CoachService = {
  providerId: "anthropic",

  async createConversation(): Promise<CoachConversation> {
    return notConfigured();
  },

  async sendMessage(_request: CoachSendMessageRequest): Promise<CoachSendMessageResponse> {
    return notConfigured();
  },
};
