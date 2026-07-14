import { formatMessageTimestamp } from "../../utils/presentationFormatters";
import type { CoachMessage } from "../../types/coachMessage";

export function createConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createCoachMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createCoachMessage(content: string, role: CoachMessage["role"] = "coach"): CoachMessage {
  return {
    id: createCoachMessageId(),
    role,
    content,
    timestamp: formatMessageTimestamp(),
  };
}
