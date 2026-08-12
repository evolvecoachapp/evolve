import type {
  ChatMessagePageDto,
  CoachMessageCreateRequest,
  CoachMessageReadDto,
} from "../types/api";
import { request } from "./client";

/**
 * Typed calls against the Coach domain: `/api/v1/coach`.
 *
 * Mirrors `src/api/nutrition.ts` / `src/api/goals.ts` — plain
 * request-wrapping functions, no state. Consumed exclusively by
 * `features/coach-experience/providers/BackendCoachExperienceService.ts`.
 *
 * Only the endpoints the Coach Experience backend provider actually uses
 * are wrapped here (send message + conversation message page). There is no
 * conversation-list, regenerate, insight, recommendation, or quick-action
 * route on the FastAPI Coach router.
 */

/** `POST /api/v1/coach/messages` — send one message, return the Coach reply. */
export async function sendCoachMessage(
  data: CoachMessageCreateRequest,
): Promise<CoachMessageReadDto> {
  return request<CoachMessageReadDto>("/api/v1/coach/messages", {
    method: "POST",
    body: data,
  });
}

/** `GET /api/v1/coach/conversations/{id}/messages` — paginated turns, oldest first. */
export async function listCoachConversationMessages(
  conversationId: string,
  params?: {
    limit?: number;
    offset?: number;
  },
): Promise<ChatMessagePageDto> {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set("offset", String(params.offset));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<ChatMessagePageDto>(
    `/api/v1/coach/conversations/${encodeURIComponent(conversationId)}/messages${suffix}`,
  );
}
