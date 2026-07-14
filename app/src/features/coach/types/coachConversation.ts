import type { CoachMessage } from "./coachMessage";

export interface CoachConversation {
  id: string;
  createdAt: string;
  messages: CoachMessage[];
}
