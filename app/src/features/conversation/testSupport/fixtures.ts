import { createAthleteProfile } from "../../athlete-context/testSupport/fixtures";
import { buildPromptContext } from "../../prompt-builder/utils/buildPromptContext";
import { createSnapshot } from "../../prompt-builder/testSupport/fixtures";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationMetadata } from "../models/ConversationMetadata";
import type { ConversationSession } from "../models/ConversationSession";
import type { ConversationStatus } from "../models/ConversationStatus";

export const FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export function createPromptContext(
  overrides: { readonly generatedAt?: string } = {},
): PromptContext {
  return buildPromptContext(createSnapshot(), {
    generatedAt: overrides.generatedAt ?? FIXED_TIMESTAMP,
    profile: createAthleteProfile(),
  });
}

export function createMessage(
  overrides: Partial<ConversationMessage> = {},
): ConversationMessage {
  return Object.freeze({
    id: "msg-1",
    conversationId: "conv-1",
    role: "user",
    content: "How should I train today?",
    status: "sent",
    createdAt: FIXED_TIMESTAMP,
    updatedAt: FIXED_TIMESTAMP,
    ...overrides,
  });
}

export function createConversation(
  overrides: {
    readonly id?: string;
    readonly status?: ConversationStatus;
    readonly messages?: readonly ConversationMessage[];
    readonly metadata?: Partial<ConversationMetadata>;
    readonly session?: Partial<ConversationSession>;
    readonly createdAt?: string;
    readonly updatedAt?: string;
  } = {},
): Conversation {
  const id = overrides.id ?? "conv-1";
  const createdAt = overrides.createdAt ?? FIXED_TIMESTAMP;
  const updatedAt = overrides.updatedAt ?? createdAt;
  const messages = Object.freeze(overrides.messages ?? []);

  return Object.freeze({
    id,
    status: overrides.status ?? "active",
    messages,
    metadata: Object.freeze({
      title: overrides.metadata?.title ?? "New conversation",
      messageCount: overrides.metadata?.messageCount ?? messages.length,
      lastMessageAt:
        overrides.metadata?.lastMessageAt !== undefined
          ? overrides.metadata.lastMessageAt
          : messages.length > 0
            ? messages[messages.length - 1]!.createdAt
            : null,
      createdAt: overrides.metadata?.createdAt ?? createdAt,
      updatedAt: overrides.metadata?.updatedAt ?? updatedAt,
    }),
    session: Object.freeze({
      id: overrides.session?.id ?? "sess-1",
      conversationId: overrides.session?.conversationId ?? id,
      startedAt: overrides.session?.startedAt ?? createdAt,
      endedAt:
        overrides.session?.endedAt !== undefined
          ? overrides.session.endedAt
          : null,
    }),
    createdAt,
    updatedAt,
  });
}
