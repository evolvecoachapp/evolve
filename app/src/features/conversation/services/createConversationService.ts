import { AIConfigurationFactory } from "../../ai-config/factory";
import type { AIConfiguration } from "../../ai-config/models/AIConfiguration";
import { AIProviderFactory } from "../../ai/providers/AIProviderFactory";
import type { AIProvider } from "../../ai/providers/AIProvider";
import { AIService } from "../../ai/services/AIService";
import { InMemoryPromptOrchestratorRepository } from "../../prompt-orchestrator/repository/InMemoryPromptOrchestratorRepository";
import { PromptOrchestrator } from "../../prompt-orchestrator/services/PromptOrchestrator";
import { createToolExecutor } from "../../tool-calling/services/createToolExecutor";
import type { ToolExecutor } from "../../tool-calling/services/ToolExecutor";
import { InMemoryConversationPersistenceRepository } from "../persistence/InMemoryConversationPersistenceRepository";
import type { ConversationPersistenceRepository } from "../persistence/ConversationPersistenceRepository";
import { InMemoryConversationRepository } from "../repository/InMemoryConversationRepository";
import type { ConversationRepository } from "../repository/ConversationRepository";
import { ConversationService } from "./ConversationService";

export interface CreateConversationServiceOptions {
  readonly configuration?: AIConfiguration;
  readonly provider?: AIProvider;
  readonly repository?: ConversationRepository;
  readonly persistence?: ConversationPersistenceRepository;
  readonly promptOrchestrator?: PromptOrchestrator | null;
  readonly toolExecutor?: ToolExecutor | null;
}

/**
 * Composes ConversationService → ConversationRepository →
 * ConversationPersistenceRepository → PromptOrchestrator →
 * ToolExecutor → AIService → AIProvider.
 *
 * Defaults to the local stub provider (no networking), in-memory
 * persistence, and a frozen placeholder ToolExecutor — suitable for
 * presentation / offline Coach chat.
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
  const persistence =
    options.persistence ?? new InMemoryConversationPersistenceRepository();
  const repository =
    options.repository ?? new InMemoryConversationRepository(persistence);
  const aiService = new AIService(provider, configuration);
  const promptOrchestrator =
    options.promptOrchestrator === undefined
      ? new PromptOrchestrator(new InMemoryPromptOrchestratorRepository())
      : options.promptOrchestrator;
  const toolExecutor =
    options.toolExecutor === undefined
      ? createToolExecutor()
      : options.toolExecutor;

  return new ConversationService(
    repository,
    aiService,
    promptOrchestrator,
    toolExecutor,
  );
}
