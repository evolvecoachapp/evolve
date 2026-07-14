export type CoachMessageRole = "user" | "coach";

export interface CoachMessage {
  id: string;
  role: CoachMessageRole;
  content: string;
  timestamp: string;
}
