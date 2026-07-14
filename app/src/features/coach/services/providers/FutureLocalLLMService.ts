import {
  CoachServiceError,
  type CoachConversation,
  type CoachSendMessageRequest,
  type CoachSendMessageResponse,
  type CoachService,
} from "../../types/coachService";

function notConfigured(): never {
  throw new CoachServiceError(
    "local provider is not configured. Integrate an on-device runtime before enabling this provider.",
    "local",
  );
}

/** Placeholder for on-device inference — implement when a local runtime is integrated. */
export const futureLocalLLMService: CoachService = {
  providerId: "local",

  async createConversation(): Promise<CoachConversation> {
    return notConfigured();
  },

  async sendMessage(_request: CoachSendMessageRequest): Promise<CoachSendMessageResponse> {
    return notConfigured();
  },
};
