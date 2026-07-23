import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { PromptBlock } from "../../prompt-composition/models/PromptBlock";
import { PromptBlockTypes } from "../../prompt-composition/models/PromptBlockType";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import { OpenAIRequestBuilder } from "../builders/OpenAIRequestBuilder";
import type { OpenAIMessage } from "../models/OpenAIMessage";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import { normalizeModelName } from "../utils/normalizeModelName";

export interface PromptPackageMapperOptions {
  readonly modelId?: string | null;
  readonly options?: AIExecutionOptions | null;
  readonly configuration: OpenAIProviderConfiguration;
}

const SYSTEM_BLOCK_TYPES = Object.freeze([
  PromptBlockTypes.SYSTEM,
  PromptBlockTypes.IDENTITY,
  PromptBlockTypes.SAFETY,
  PromptBlockTypes.CONSTRAINTS,
  PromptBlockTypes.KNOWLEDGE,
  PromptBlockTypes.MEMORY,
  PromptBlockTypes.CONVERSATION,
] as const);

/**
 * Maps PromptPackage → immutable OpenAIRequest.
 *
 * No business logic. No prompt composition. No conversation history.
 * System-role blocks are concatenated; user_input becomes the user message.
 */
export class PromptPackageMapper {
  static map(
    promptPackage: PromptPackage,
    options: PromptPackageMapperOptions,
  ): OpenAIRequest {
    const modelId =
      normalizeModelName(options.modelId) ||
      options.configuration.defaultModelId;
    const execution = options.options ?? null;
    const messages = buildMessages(promptPackage);

    const temperature =
      execution?.temperature ?? options.configuration.defaultTemperature;
    const maxTokens =
      execution?.maxOutputTokens ??
      options.configuration.defaultMaxOutputTokens;
    const topP = execution?.topP ?? null;
    const stop =
      execution?.stopSequences && execution.stopSequences.length > 0
        ? execution.stopSequences
        : null;
    const timeoutMs =
      execution?.timeoutMs ?? options.configuration.client.timeoutMs;

    return new OpenAIRequestBuilder()
      .withModel(modelId)
      .withMessages(messages)
      .withTemperature(temperature)
      .withMaxTokens(maxTokens)
      .withTopP(topP)
      .withStop(stop)
      .withTimeoutMs(timeoutMs)
      .build();
  }
}

function buildMessages(promptPackage: PromptPackage): readonly OpenAIMessage[] {
  const ordered = [...promptPackage.blocks].sort((a, b) => a.order - b.order);
  const systemParts = ordered
    .filter((block) => isSystemBlock(block))
    .map((block) => formatBlock(block))
    .filter((part) => part.length > 0);

  const userBlock = ordered.find(
    (block) => block.type === PromptBlockTypes.USER_INPUT,
  );
  const userContent =
    userBlock?.statement?.trim() ||
    promptPackage.userInput?.statement?.trim() ||
    "";

  const messages: OpenAIMessage[] = [];

  if (systemParts.length > 0) {
    messages.push(
      Object.freeze({
        role: "system" as const,
        content: systemParts.join("\n\n"),
      }),
    );
  }

  messages.push(
    Object.freeze({
      role: "user" as const,
      content: userContent.length > 0 ? userContent : "(empty user input)",
    }),
  );

  return Object.freeze(messages);
}

function isSystemBlock(block: PromptBlock): boolean {
  return (SYSTEM_BLOCK_TYPES as readonly string[]).includes(block.type);
}

function formatBlock(block: PromptBlock): string {
  const title = block.title?.trim();
  const statement = block.statement?.trim() ?? "";
  if (!statement) {
    return "";
  }
  if (title) {
    return `${title}\n${statement}`;
  }
  return statement;
}
