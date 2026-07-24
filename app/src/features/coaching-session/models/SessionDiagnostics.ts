import type { SessionMetadata } from "./SessionMetadata";
import { EMPTY_SESSION_METADATA } from "./SessionMetadata";

export interface SessionDiagnostics {
  readonly id: string;
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
}

export const EMPTY_SESSION_DIAGNOSTICS: SessionDiagnostics = Object.freeze({
  id: "diag:empty",
  warnings: Object.freeze([] as string[]),
  notes: Object.freeze([] as string[]),
  metadata: EMPTY_SESSION_METADATA,
  createdAt: "",
});
