/**
 * Preferred communication style metadata for future prompt builders.
 * Not a prompt. Not conversational output.
 */
export const CoachCommunicationStyles = {
  DIRECT: "direct",
  SUPPORTIVE: "supportive",
  CONCISE: "concise",
  DETAILED: "detailed",
} as const;

export type CoachCommunicationStyle =
  (typeof CoachCommunicationStyles)[keyof typeof CoachCommunicationStyles];

export const ALL_COACH_COMMUNICATION_STYLES: readonly CoachCommunicationStyle[] =
  Object.freeze([
    CoachCommunicationStyles.DIRECT,
    CoachCommunicationStyles.SUPPORTIVE,
    CoachCommunicationStyles.CONCISE,
    CoachCommunicationStyles.DETAILED,
  ]);
