/**
 * Immutable primary coach message body.
 */
export interface CoachMessage {
  readonly id: string;
  readonly role: "coach";
  readonly text: string;
  readonly tone: string | null;
}

export function createCoachMessage(
  id: string,
  text: string,
  tone: string | null = null,
): CoachMessage {
  return Object.freeze({
    id,
    role: "coach" as const,
    text,
    tone,
  });
}
