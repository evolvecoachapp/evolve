export const CoachMessageRoles = {
  USER: "user",
  COACH: "coach",
  SYSTEM: "system",
} as const;

export type CoachMessageRole =
  (typeof CoachMessageRoles)[keyof typeof CoachMessageRoles];

export const CoachMessageStatuses = {
  COMPLETE: "complete",
  STREAMING: "streaming",
  PENDING: "pending",
  ERROR: "error",
} as const;

export type CoachMessageStatus =
  (typeof CoachMessageStatuses)[keyof typeof CoachMessageStatuses];

/** Immutable coach conversation message — presentation read model. */
export interface CoachMessage {
  readonly id: string;
  readonly role: CoachMessageRole;
  readonly content: string;
  readonly createdAt: string;
  readonly status: CoachMessageStatus;
  /** Prepared for future markdown rendering. */
  readonly markdownReady: boolean;
  /** Prepared for future citation chips. */
  readonly citations: readonly string[];
  readonly isStreaming: boolean;
}

export function createCoachMessage(input: {
  readonly id: string;
  readonly role: CoachMessageRole;
  readonly content: string;
  readonly createdAt: string;
  readonly status?: CoachMessageStatus;
  readonly markdownReady?: boolean;
  readonly citations?: readonly string[];
}): CoachMessage {
  const status = input.status ?? CoachMessageStatuses.COMPLETE;
  return Object.freeze({
    id: input.id,
    role: input.role,
    content: input.content,
    createdAt: input.createdAt,
    status,
    markdownReady: input.markdownReady ?? true,
    citations: Object.freeze([...(input.citations ?? [])]),
    isStreaming: status === CoachMessageStatuses.STREAMING,
  });
}
