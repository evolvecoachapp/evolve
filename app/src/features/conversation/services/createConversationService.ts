import { AIConfigurationFactory } from "../../ai-config/factory";
import type { AIConfiguration } from "../../ai-config/models/AIConfiguration";
import { AIProviderFactory } from "../../ai/providers/AIProviderFactory";
import type { AIProvider } from "../../ai/providers/AIProvider";
import { AIService } from "../../ai/services/AIService";
import { InMemoryConversationRepository } from "../repository/InMemoryConversationRepository";
import type { ConversationRepository } from "../repository/ConversationRepository";
import { ConversationService } from "./ConversationService";

export interface CreateConversationServiceOptions {
  readonly configuration?: AIConfiguration;
  readonly provider?: AIProvider;
  readonly repository?: ConversationRepository;
}

/**
 * Composes ConversationService → AIService → AIProvider.
 *
 * Defaults to the local stub provider (no networking) and an in-memory
 * repository — suitable for presentation / offline Coach chat.
 * No singleton — each call returns a fresh graph.
 */
export function createConversationService(
  options: CreateConversationServiceOptions = {},
): ConversationService {
  const configuration =
    options.configuration ??
    AIConfigurationFactory.createDefault({ providerType: "local" });
  const provider =
    options.provider ?? AIProviderFactory.create(configuration.provider.type);
  const repository =
    options.repository ?? new InMemoryConversationRepository();
  const aiService = new AIService(provider, configuration);

  return new ConversationService(repository, aiService);
}
