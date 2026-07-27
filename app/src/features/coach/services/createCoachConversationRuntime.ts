import { AIConfigurationFactory } from "../../ai-config/factory";
import type { AIConfiguration } from "../../ai-config/models/AIConfiguration";
import type { AIProviderInfo } from "../../ai/models/AIProviderInfo";
import { AIProviderFactory } from "../../ai/providers/AIProviderFactory";
import { AIService } from "../../ai/services/AIService";
import { resolveService } from "../../../core/composition";
import type { CoachConversationService } from "../../coach-conversation/services/CoachConversationService";
import type { CoachingSessionService } from "../../coaching-session/services/CoachingSessionService";
import { InMemoryConversationRepository } from "../../conversation/repository/InMemoryConversationRepository";
import { ConversationService } from "../../conversation/services/ConversationService";

export interface CoachConversationRuntime {
  readonly service: ConversationService;
  readonly coachingSession: CoachingSessionService;
  readonly coachConversation: CoachConversationService;
  readonly configuration: AIConfiguration;
  readonly providerInfo: AIProviderInfo;
  readonly healthCheck: () => Promise<boolean>;
}

/**
 * App composition root for Coach chat.
 * Builds ConversationService → AIService → AIProvider (local stub, no networking)
 * and resolves Coaching Session + Coach Conversation from the process Composition Root.
 */
export function createCoachConversationRuntime(): CoachConversationRuntime {
  const configuration = AIConfigurationFactory.createDefault({
    providerType: "local",
  });
  const provider = AIProviderFactory.create(configuration.provider.type);
  const aiService = new AIService(provider, configuration);
  const service = new ConversationService(
    new InMemoryConversationRepository(),
    aiService,
  );
  const coachingSession = resolveService("CoachingSessionService");
  const coachConversation = resolveService("CoachConversationService");

  return {
    service,
    coachingSession,
    coachConversation,
    configuration,
    providerInfo: provider.getProviderInfo(),
    healthCheck: () => aiService.healthCheck(),
  };
}
