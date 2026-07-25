import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationPackage } from "./AdaptationPackage";

export const AdaptationSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type AdaptationSessionStatus =
  (typeof AdaptationSessionStatuses)[keyof typeof AdaptationSessionStatuses];

export interface AdaptationState {
  readonly status: AdaptationSessionStatus;
  readonly package: AdaptationPackage | null;
  readonly decisions: readonly AdaptationDecision[];
  readonly updatedAt: string;
}
