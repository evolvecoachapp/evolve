import type { ContextConfidence } from "./ContextConfidence";
import type { ContextConflict } from "./ContextConflict";
import type { ContextDependency } from "./ContextDependency";
import type { ContextDiagnostics } from "./ContextDiagnostics";
import type { ContextIntegrity } from "./ContextIntegrity";
import type { ContextMerge } from "./ContextMerge";
import type { ContextMetadata } from "./ContextMetadata";
import type { ContextPriority } from "./ContextPriority";
import type { ContextResolution } from "./ContextResolution";
import type { ContextSection } from "./ContextSection";
import type { ContextSlice } from "./ContextSlice";
import type { ContextSource } from "./ContextSource";
import type { ContextStatistics } from "./ContextStatistics";
import type { ContextSummary } from "./ContextSummary";
import type { ContextTimeline } from "./ContextTimeline";
import type { ContextVersion } from "./ContextVersion";
import type { ContextView } from "./ContextView";

/**
 * Immutable unified coaching context — single fused truth for Decision Engine.
 * Fusion only: no AI, calculations, persistence, or networking.
 */
export interface UnifiedCoachingContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly version: ContextVersion;
  readonly sources: readonly ContextSource[];
  readonly sections: readonly ContextSection[];
  readonly views: readonly ContextView[];
  readonly dependencies: readonly ContextDependency[];
  readonly priorities: readonly ContextPriority[];
  readonly conflicts: readonly ContextConflict[];
  readonly resolutions: readonly ContextResolution[];
  readonly merge: ContextMerge | null;
  readonly integrity: ContextIntegrity;
  readonly confidence: ContextConfidence;
  readonly timeline: ContextTimeline;
  readonly statistics: ContextStatistics;
  readonly diagnostics: ContextDiagnostics;
  readonly summary: ContextSummary | null;
  readonly conversation: ContextSlice | null;
  readonly session: ContextSlice | null;
  readonly athlete: ContextSlice | null;
  readonly workout: ContextSlice | null;
  readonly nutrition: ContextSlice | null;
  readonly recovery: ContextSlice | null;
  readonly goal: ContextSlice | null;
  readonly supervisor: ContextSlice | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}
