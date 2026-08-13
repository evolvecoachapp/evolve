import { listCoachConversationMessages, sendCoachMessage } from "../../../api/coach";
import { ApiError } from "../../../api/client";
import type { ChatMessagePageDto, CoachMessageCreateRequest } from "../../../types/api";
import {
  buildEmptyBackendCoachExperience,
  mapBackendCoachMessagesToExperienceDto,
  mapBackendCoachReplyToSendResult,
} from "../mappers/mapBackendCoachToExperienceDto";
import type {
  CoachConversationHistoryDto,
  CoachExperienceDto,
  CoachInsightDto,
  CoachMessageDto,
  CoachQuickActionDto,
  CoachRecommendationDto,
} from "../types/coachExperienceDto";
import {
  CoachExperienceError,
  type CoachExperienceService,
} from "../types/coachExperienceService";
import {
  clearBackendCoachConversationId,
  loadBackendCoachConversationId,
  persistBackendCoachConversationId,
} from "./backendCoachConversationStore";

/**
 * Backend provider — talks to the already-implemented Coach FastAPI
 * surface (`/api/v1/coach`) via the shared authenticated API client.
 *
 * Supported:
 * - Send via `POST /messages` (omits `conversation_id` until the backend
 *   has returned one; then resumes that conversation)
 * - Experience read via `GET /conversations/{id}/messages` once a
 *   conversation id is known from a prior send or persisted restart
 *
 * Explicitly unsupported (no matching Coach API endpoint):
 * - `regenerateResponse()` — no-op; no regenerate route
 * - `pinInsight()` / `dismissInsight()` — no insight model or routes
 * - `getConversationHistory()` — Experience lists conversations; backend
 *   only pages messages inside one known conversation
 * - `getDailyInsight()` / `getRecommendations()` / `getQuickActions()` —
 *   no insight / recommendation / quick-action routes
 *
 * Production Coach tab uses this provider by default.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HISTORY_PAGE_LIMIT = 100;

let lastKnownConversationId: string | null = null;

export function resetBackendCoachExperienceState(): void {
  lastKnownConversationId = null;
}

function toCoachExperienceError(
  error: unknown,
  fallback: string,
): CoachExperienceError {
  if (error instanceof CoachExperienceError) {
    return error;
  }
  if (error instanceof ApiError) {
    return new CoachExperienceError(error.message, "backend");
  }
  return new CoachExperienceError(
    error instanceof Error ? error.message : fallback,
    "backend",
  );
}

function unsupportedCapability(name: string): CoachExperienceError {
  return new CoachExperienceError(
    `${name} is not supported by the backend coach API yet — see /api/v1/coach.`,
    "backend",
  );
}

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function resolveConversationId(inputId: string): string | undefined {
  if (isUuid(inputId)) {
    return inputId;
  }
  return lastKnownConversationId ?? undefined;
}

async function rememberConversationId(conversationId: string): Promise<void> {
  lastKnownConversationId = conversationId;
  try {
    await persistBackendCoachConversationId(conversationId);
  } catch {
    // In-memory id still resumes the thread for this session.
  }
}

async function hydrateStoredConversationId(): Promise<string | null> {
  if (lastKnownConversationId) {
    return lastKnownConversationId;
  }
  try {
    const persisted = await loadBackendCoachConversationId();
    if (persisted && isUuid(persisted)) {
      lastKnownConversationId = persisted;
      return persisted;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchLatestMessagePage(
  conversationId: string,
): Promise<ChatMessagePageDto> {
  const first = await listCoachConversationMessages(conversationId, {
    limit: HISTORY_PAGE_LIMIT,
    offset: 0,
  });
  if (first.total <= first.items.length) {
    return first;
  }
  const offset = Math.max(0, first.total - HISTORY_PAGE_LIMIT);
  return listCoachConversationMessages(conversationId, {
    limit: HISTORY_PAGE_LIMIT,
    offset,
  });
}

async function fetchExperience(): Promise<CoachExperienceDto> {
  const conversationId = await hydrateStoredConversationId();
  if (!conversationId) {
    return buildEmptyBackendCoachExperience();
  }

  try {
    const page = await fetchLatestMessagePage(conversationId);
    return mapBackendCoachMessagesToExperienceDto({
      conversationId,
      page,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      lastKnownConversationId = null;
      await clearBackendCoachConversationId().catch(() => undefined);
      return buildEmptyBackendCoachExperience();
    }
    throw error;
  }
}

export const backendCoachExperienceService: CoachExperienceService = {
  providerId: "backend",

  async getExperience() {
    try {
      return await fetchExperience();
    } catch (error) {
      throw toCoachExperienceError(error, "Failed to load coach experience.");
    }
  },

  async sendMessage(input: {
    readonly conversationId: string;
    readonly message: string;
  }) {
    const trimmed = input.message.trim();
    if (!trimmed) {
      throw new CoachExperienceError("Message must not be empty.", "backend");
    }

    try {
      await hydrateStoredConversationId();
      const body: CoachMessageCreateRequest = { message: trimmed };
      const conversationId = resolveConversationId(input.conversationId);
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      const reply = await sendCoachMessage(body);
      await rememberConversationId(reply.conversation_id);

      return mapBackendCoachReplyToSendResult({
        reply,
        userContent: trimmed,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      throw toCoachExperienceError(error, "Failed to send coach message.");
    }
  },

  async regenerateResponse(input: {
    readonly conversationId: string;
    readonly messageId: string;
  }): Promise<CoachMessageDto> {
    return Object.freeze({
      id: input.messageId,
      role: "coach",
      content: "",
      createdAt: new Date().toISOString(),
    });
  },

  async pinInsight(): Promise<CoachInsightDto> {
    throw unsupportedCapability("Insight pinning");
  },

  async dismissInsight(): Promise<void> {
    throw unsupportedCapability("Insight dismissal");
  },

  async getConversationHistory(): Promise<
    readonly CoachConversationHistoryDto[]
  > {
    throw unsupportedCapability("Conversation history listing");
  },

  async getDailyInsight(): Promise<CoachInsightDto | null> {
    throw unsupportedCapability("Daily insights");
  },

  async getRecommendations(): Promise<readonly CoachRecommendationDto[]> {
    throw unsupportedCapability("Recommendations");
  },

  async getQuickActions(): Promise<readonly CoachQuickActionDto[]> {
    throw unsupportedCapability("Quick actions");
  },
};
