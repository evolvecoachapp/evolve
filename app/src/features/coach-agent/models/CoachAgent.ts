import type { CoachMetadata } from "./CoachMetadata";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

/**
 * Immutable Coach Agent descriptor (capabilities surface).
 */
export interface CoachAgent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly supportedAgents: readonly SpecialistAgentKind[];
  readonly futureAgents: readonly SpecialistAgentKind[];
  readonly metadata: CoachMetadata;
  readonly createdAt: string;
}
