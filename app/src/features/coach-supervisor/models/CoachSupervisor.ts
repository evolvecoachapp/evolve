import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";

export const CoachSupervisorCapabilityKinds = {
  ORCHESTRATE: "orchestrate",
  ROUTE: "route",
  COORDINATE: "coordinate",
  AGGREGATE: "aggregate",
  RESPOND: "respond",
} as const;

export type CoachSupervisorCapabilityKind =
  (typeof CoachSupervisorCapabilityKinds)[keyof typeof CoachSupervisorCapabilityKinds];

/**
 * Immutable Coach Supervisor agent descriptor.
 */
export interface CoachSupervisor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly role: "coach_supervisor";
  readonly capabilities: readonly CoachSupervisorCapabilityKind[];
  readonly supportedDomains: readonly string[];
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
}
